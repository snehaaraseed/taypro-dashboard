import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
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
  /** Default burn (post-blog CMS translation). Use insight for monthly reports. */
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
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyHitQuota = false;

    for (const modelName of geminiTranslationModelCandidates()) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        await pauseAfterGeminiCall();
        recordQuotaUsage(quotaScope === "insight" ? "burn" : quotaScope);
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
        if (isGemini503Error(error)) {
          console.warn(
            `[translate] Gemini 503 on ${modelName}, trying next model/key...`
          );
          continue;
        }
        console.warn(`[translate] Gemini model ${modelName} failed:`, error);
      }
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
