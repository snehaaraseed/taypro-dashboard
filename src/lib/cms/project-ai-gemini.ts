import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  assertQuotaBudgetAllowed,
  recordQuotaUsage,
} from "@/lib/gemini/quota-budget";
import {
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { automationTextModelCandidates } from "@/lib/gemini/model-routing";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import type { ProjectContentPlan } from "@/lib/seo/project-section-writer";

function isTransientServerError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("500") ||
    msg.includes("503") ||
    msg.includes("Internal error encountered") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateText(
  prompt: string,
  preferQualityModel = false
): Promise<string> {
  assertQuotaBudgetAllowed("burn");
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyHitQuota = false;

    for (const modelName of automationTextModelCandidates({
      preferRetryVariant: preferQualityModel,
    })) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          await pauseAfterGeminiCall();
          recordQuotaUsage("burn");
          return text;
        } catch (error) {
          lastError = error;
          if (isGeminiQuotaError(error)) {
            keyHitQuota = true;
            break;
          }
          if (isTransientServerError(error) && attempt < 2) {
            await sleep(2000 * (attempt + 1));
            continue;
          }
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
    : new Error("Gemini project generation failed");
}

function parseJsonObject<T extends Record<string, unknown>>(text: string): T {
  return parseGeminiJsonObject<T>(text);
}

function stripCodeFences(html: string): string {
  return html
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export const SECTION_HTML_START = "===HTML===";
export const SECTION_HTML_END = "===END===";

/** Take only the text inside the last ===HTML=== ... ===END=== block, if present. */
function extractBetweenSentinels(text: string): string | null {
  const startRe = /===HTML===/gi;
  let lastStart = -1;
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(text)) !== null) {
    lastStart = m.index + m[0].length;
  }
  if (lastStart < 0) return null;
  let rest = text.slice(lastStart);
  const endMatch = rest.match(/===END===/i);
  if (endMatch && endMatch.index !== undefined) {
    rest = rest.slice(0, endMatch.index);
  }
  return rest.trim();
}

/**
 * Strong markers that only ever appear in leaked model reasoning, never in the
 * final HTML answer. The clean fragment is always emitted AFTER the last such
 * marker, so we slice from there.
 */
const STRONG_REASONING_RE =
  /(?:\*\s{2,})|(?:\bDrafting\s+(?:P\d|Para))|(?:\bRevised\s+(?:P\d|Para|Section|Text|Checklist))|(?:\bWord\s*count\b)|(?:\bSelf[-\s]?correction\b)|(?:\bDouble check\b)|(?:Return ONLY the HTML)|(?:={3}\s*HTML\s*={3})|(?:^\s*\d+\s*[–-]\s*\d+\s*words\b)|(?:^\s*HTML fragment\.?\s*$)/gim;

/**
 * Best-effort recovery when sentinels are absent: drop everything up to and
 * including the last strong reasoning marker, then keep from the first HTML tag.
 * Defense-in-depth only; the validator still rejects any residual artifacts.
 */
function stripLeakedReasoning(text: string): string {
  let lastEnd = -1;
  let m: RegExpExecArray | null;
  STRONG_REASONING_RE.lastIndex = 0;
  while ((m = STRONG_REASONING_RE.exec(text)) !== null) {
    lastEnd = m.index + m[0].length;
    if (m.index === STRONG_REASONING_RE.lastIndex) STRONG_REASONING_RE.lastIndex++;
  }
  const tail = lastEnd >= 0 ? text.slice(lastEnd) : text;
  const firstTag = tail.search(/<\/?[a-z]/i);
  return (firstTag >= 0 ? tail.slice(firstTag) : tail).trim();
}

/** Extract clean section HTML from a Gemma response that may contain reasoning. */
export function extractSectionHtml(text: string): string {
  const fenced = stripCodeFences(text);
  const sentinel = extractBetweenSentinels(fenced);
  if (sentinel) return stripCodeFences(sentinel);
  return stripLeakedReasoning(fenced);
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
  return extractSectionHtml(text);
}

export async function expandProjectHtmlWithGemini(
  prompt: string
): Promise<string> {
  const text = await generateText(prompt, true);
  return extractSectionHtml(text);
}

export async function generateProjectMetaDescription(
  prompt: string
): Promise<string> {
  const text = await generateText(prompt, false);
  return text.replace(/^["']|["']$/g, "").trim().slice(0, 170);
}
