import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { automationTextModelCandidates } from "@/lib/gemini/model-routing";

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
        console.warn(`[automation-text] Model ${modelName} failed:`, error);
      }
    }

    if (keyHitQuota) continue;
    break;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Automation text generation failed");
}
