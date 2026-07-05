import "server-only";

import { GoogleGenAI } from "@google/genai";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import {
  textModelCandidatesForPurpose,
  type AutomationTextPurpose,
} from "@/lib/gemini/model-routing";

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
  /** When true, try the retry model first (Gemma before Flash, or 31B before 26B). */
  preferQualityModel?: boolean;
  /** blog = Flash→Gemma; editorial = Gemma 26B→31B; translation/project = Flash→Gemma */
  purpose?: AutomationTextPurpose;
};

/** Long-form HTML/text with purpose-specific model routing. */
export async function generateAutomationText(
  prompt: string,
  options?: GenerateAutomationTextOptions
): Promise<string> {
  const purpose = options?.purpose ?? "blog";
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });
    let keyHitQuota = false;

    for (const modelName of textModelCandidatesForPurpose(purpose, {
      preferRetryVariant: options?.preferQualityModel,
    })) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const generationConfig =
            options?.maxOutputTokens && options.maxOutputTokens > 0
              ? { maxOutputTokens: options.maxOutputTokens }
              : undefined;
          const result = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: generationConfig,
          });
          const text = (result.text ?? "").trim();
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
              `[automation-text:${purpose}] ${modelName} transient (attempt ${attempt + 1}/3), retry in ${waitMs}ms`
            );
            await sleep(waitMs);
            continue;
          }
          console.warn(
            `[automation-text:${purpose}] Model ${modelName} failed:`,
            error
          );
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
