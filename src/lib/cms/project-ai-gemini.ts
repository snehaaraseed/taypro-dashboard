import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { freeGeminiTextModelCandidates } from "@/lib/gemini/free-tier-models";
import type { ProjectContentPlan } from "@/lib/seo/project-section-writer";

async function generateText(
  prompt: string,
  preferQualityModel = false
): Promise<string> {
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of freeGeminiTextModelCandidates({
      preferRetryVariant: preferQualityModel,
    })) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        await pauseAfterGeminiCall();
        return text;
      } catch (error) {
        lastError = error;
        if (isGeminiQuotaError(error)) break;
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini project generation failed");
}

function parseJsonObject<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Could not parse JSON from AI response");
    return JSON.parse(m[0]) as T;
  }
}

function stripCodeFences(html: string): string {
  return html
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function generateProjectPlanWithGemini(
  prompt: string
): Promise<ProjectContentPlan> {
  const text = await generateText(prompt, true);
  const plan = parseJsonObject<ProjectContentPlan>(text);
  if (!plan.description?.trim()) {
    throw new Error("AI plan missing description");
  }
  return {
    description: plan.description.trim(),
    executiveSummaryOutline: plan.executiveSummaryOutline ?? "",
    sectionNotes: plan.sectionNotes ?? {},
  };
}

export async function writeProjectSectionWithGemini(
  prompt: string
): Promise<string> {
  const text = await generateText(prompt, false);
  return stripCodeFences(text);
}

export async function expandProjectHtmlWithGemini(
  prompt: string
): Promise<string> {
  const text = await generateText(prompt, true);
  return stripCodeFences(text);
}

export async function generateProjectMetaDescription(
  prompt: string
): Promise<string> {
  const text = await generateText(prompt, false);
  return text.replace(/^["']|["']$/g, "").trim().slice(0, 170);
}
