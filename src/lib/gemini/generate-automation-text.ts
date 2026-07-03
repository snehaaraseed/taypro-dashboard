import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { automationTextModelCandidates } from "@/lib/gemini/model-routing";

function isTransientServerError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("500") ||
    msg.includes("503") ||
    msg.includes("Internal error encountered") ||
    msg.includes("UNAVAILABLE")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type GenerateAutomationTextOptions = {
  maxOutputTokens?: number;
  preferQualityModel?: boolean;
};

/** Long-form HTML/text via Gemma 4 (blog / insights writing). */
export async function generateAutomationText(
  prompt: string,
  options?: GenerateAutomationTextOptions
): Promise<string> {
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyHitQuota = false;

    for (const modelName of automationTextModelCandidates({
      preferRetryVariant: options?.preferQualityModel,
    })) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const generationConfig =
            options?.maxOutputTokens && options.maxOutputTokens > 0
              ? { maxOutputTokens: options.maxOutputTokens }
              : undefined;
          const model = genAI.getGenerativeModel({
            model: modelName,
            ...(generationConfig ? { generationConfig } : {}),
          });
          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          await pauseAfterGeminiCall();
          return text;
        } catch (error) {
          lastError = error;
          if (isGeminiQuotaError(error)) {
            keyHitQuota = true;
            break;
          }
          if (isTransientServerError(error) && attempt < 2) {
            const waitMs = 2000 * (attempt + 1);
            console.warn(
              `[automation-text] Model ${modelName} transient error (attempt ${attempt + 1}/3), retrying in ${waitMs}ms…`
            );
            await sleep(waitMs);
            continue;
          }
          console.warn(`[automation-text] Model ${modelName} failed:`, error);
          break;
        }
      }
      if (keyHitQuota) break;
    }

    if (keyHitQuota) continue;
    break;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Automation text generation failed");
}
