import "server-only";

import { GoogleGenAI } from "@google/genai";
import {
  geminiQuotaErrorMessage,
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  assertQuotaBudgetAllowed,
  recordQuotaUsage,
  type QuotaBudgetScope,
} from "@/lib/gemini/quota-budget";
import { geminiTranslationModelCandidates } from "./config";
import { sanitizeGeminiJsonText } from "@/lib/gemini/parse-json-response";

export function isGemini503Error(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("503") ||
    message.toLowerCase().includes("service unavailable") ||
    message.toLowerCase().includes("high demand")
  );
}

export function isGeminiTransientError(error: unknown): boolean {
  if (isGemini503Error(error)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("500") ||
    message.includes("Internal error encountered") ||
    message.includes("UNAVAILABLE")
  );
}

export function isJsonParseError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("JSON") ||
    message.includes("Unexpected token") ||
    message.includes("position ")
  );
}

export function parseTranslationJson<T>(text: string): T {
  const trimmed = sanitizeGeminiJsonText(text.trim());
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) {
      throw new Error("Gemini response did not contain JSON");
    }
    try {
      return JSON.parse(sanitizeGeminiJsonText(match[0])) as T;
    } catch (error) {
      const content = extractJsonContentField(match[0]);
      if (content !== null) {
        return { content } as T;
      }
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid JSON from Gemini: ${detail}`);
    }
  }
}

/** Last-resort: pull "content" from malformed translation JSON. */
function extractJsonContentField(raw: string): string | null {
  const key = '"content"';
  const idx = raw.indexOf(key);
  if (idx < 0) return null;
  let i = idx + key.length;
  while (i < raw.length && /[\s:]/.test(raw[i]!)) i += 1;
  if (raw[i] !== '"') return null;

  i += 1;
  let out = "";
  let escaped = false;
  while (i < raw.length) {
    const ch = raw[i]!;
    if (escaped) {
      if (ch === "n") out += "\n";
      else if (ch === "r") out += "\r";
      else if (ch === "t") out += "\t";
      else out += ch;
      escaped = false;
      i += 1;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      i += 1;
      continue;
    }
    if (ch === '"') {
      return out.trim() || null;
    }
    out += ch;
    i += 1;
  }
  return out.trim() || null;
}

export type TranslationGeminiOptions = {
  /** Default burn (post-blog CMS translation). Use insight/press for parallel admin work. */
  quotaScope?: QuotaBudgetScope;
};

/** Gemini generateContent with dual API keys, model fallback, and JSON response mode. */
export async function generateTranslationText(
  prompt: string,
  options?: TranslationGeminiOptions
): Promise<string> {
  const quotaScope = options?.quotaScope ?? "burn";
  assertQuotaBudgetAllowed(quotaScope);
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;
  let quotaExhaustedKeys = 0;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });
    let keyHitQuota = false;

    for (const modelName of geminiTranslationModelCandidates()) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          const text = (result.text ?? "").trim();
          await pauseAfterGeminiCall();
          recordQuotaUsage(
            quotaScope === "insight" || quotaScope === "press" ? "burn" : quotaScope
          );
          if (apiKey !== apiKeys[0]) {
            console.warn(
              "[translate] Gemini call succeeded on fallback API key (GEMINI_API_KEY_2)."
            );
          }
          return text;
        } catch (error) {
          lastError = error;
          if (isGeminiQuotaError(error)) {
            keyHitQuota = true;
            console.warn(
              `[translate] Gemini quota exceeded on key ...${apiKey.slice(-4)}, trying fallback if configured.`
            );
            break;
          }
          if (isGeminiTransientError(error) && attempt < 2) {
            const waitMs = 2000 * (attempt + 1);
            console.warn(
              `[translate] Gemini transient error on ${modelName} (attempt ${attempt + 1}/3), retrying in ${waitMs}ms…`
            );
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          console.warn(`[translate] Gemini model ${modelName} failed:`, error);
          break;
        }
      }
      if (keyHitQuota) break;
    }

    if (keyHitQuota) {
      quotaExhaustedKeys += 1;
      continue;
    }
    break;
  }

  if (quotaExhaustedKeys >= apiKeys.length) {
    throw new Error(geminiQuotaErrorMessage(lastError));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All configured Gemini translation models failed");
}

export async function generateTranslationJson<T>(
  prompt: string,
  options?: TranslationGeminiOptions
): Promise<T> {
  const raw = await generateTranslationText(prompt, options);
  return parseTranslationJson<T>(raw);
}
