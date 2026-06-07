import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  geminiQuotaErrorMessage,
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  assertGeminiCallAllowed,
  recordGeminiCall,
} from "@/lib/gemini/daily-budget";
import { geminiTranslationModelCandidates } from "./config";

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
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) {
      throw new Error("Gemini response did not contain JSON");
    }
    try {
      return JSON.parse(match[0]) as T;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid JSON from Gemini: ${detail}`);
    }
  }
}

/** Gemini generateContent with dual API keys, model fallback, and JSON response mode. */
export async function generateTranslationText(prompt: string): Promise<string> {
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;
  let quotaExhaustedKeys = 0;

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyHitQuota = false;

    for (const modelName of geminiTranslationModelCandidates()) {
      try {
        assertGeminiCallAllowed("translation");
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });
        let text: string;
        try {
          const result = await model.generateContent(prompt);
          text = result.response.text().trim();
        } finally {
          recordGeminiCall("translation");
          await pauseAfterGeminiCall();
        }
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

export async function generateTranslationJson<T>(prompt: string): Promise<T> {
  const raw = await generateTranslationText(prompt);
  return parseTranslationJson<T>(raw);
}
