import type { EditorialContract } from "@/lib/seo/coverage-ledger";
import type { GroundedSerpResearchInput } from "@/lib/gemini/grounded-serp-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";

/**
 * Google Search grounding on the free tier is tied to Gemini 2.5 Flash family (20 RPD/model).
 * All other blog steps use gemini-3.1-flash-lite (500 RPD). A 429 on 2.5 must not block 3.1.
 */
export const DEFAULT_GROUNDING_MODEL = "gemini-2.5-flash";

export class GroundingQuotaExceededError extends Error {
  readonly model: string;

  constructor(model: string, cause?: unknown) {
    const detail =
      cause instanceof Error ? cause.message.slice(0, 160) : String(cause ?? "");
    super(
      `Gemini Search grounding quota exceeded for ${model} (free tier ~20 RPD). ` +
        `Blog will continue on 3.1 Flash Lite without live SERP/fact research. ${detail}`
    );
    this.name = "GroundingQuotaExceededError";
    this.model = model;
  }
}

export class GroundingCallBudgetExceededError extends Error {
  constructor(callsSoFar: number, maxCalls: number) {
    super(
      `Grounding call budget reached (${callsSoFar}/${maxCalls} per blog). Skipping further Search grounding.`
    );
    this.name = "GroundingCallBudgetExceededError";
  }
}

export function resolveGroundingModel(): string {
  return process.env.GEMINI_GROUNDING_MODEL?.trim() || DEFAULT_GROUNDING_MODEL;
}

export function getGeminiGroundingMaxCallsPerBlog(): number {
  const raw =
    process.env.GEMINI_SERP_MAX_CALLS_PER_BLOG?.trim() ||
    process.env.GEMINI_GROUNDING_MAX_CALLS_PER_BLOG?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 2;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
}

export function assertGroundingCallBudget(serpCallsSoFar = 0): void {
  const max = getGeminiGroundingMaxCallsPerBlog();
  if (serpCallsSoFar >= max) {
    throw new GroundingCallBudgetExceededError(serpCallsSoFar, max);
  }
}

export function isGroundingQuotaError(error: unknown): boolean {
  return error instanceof GroundingQuotaExceededError;
}

export function isGroundingCallBudgetError(error: unknown): boolean {
  return error instanceof GroundingCallBudgetExceededError;
}

function buildSearchQuery(input: GroundedSerpResearchInput): string {
  const kw = input.keyword.trim();
  const angle = input.angle?.trim();
  const parts = [kw, angle, "utility scale solar India O&M"].filter(Boolean);
  return parts.join(" ");
}

/** Minimal SERP brief when Search grounding RPD is exhausted — title/body use 3.1 Flash Lite. */
export function buildFallbackSerpBrief(
  input: GroundedSerpResearchInput
): SerpResearchBrief {
  return {
    keyword: input.keyword.trim(),
    angle: input.angle?.trim() || "practical O&M decision guide",
    searchQuery: buildSearchQuery(input),
    rankingTitles: [],
    commonH2Themes: [],
    peopleAlsoAsk: [],
    serpGaps: [],
    freshnessNotes: [],
    candidateTitles: [],
    webSearchQueries: [],
    sources: [],
    model: "fallback-no-grounding",
    apiKeySuffix: "none",
    rawJson: "{}",
  };
}

export function buildEmptyFactBrief(
  keyword: string,
  title: string
): FactResearchBrief {
  return {
    keyword: keyword.trim(),
    title: title.trim(),
    verifiedStats: [],
    regulatoryNotes: [],
    marketTrends: [],
    citationGuardrails: [
      "Use industry-typical ranges only; label unsourced figures as typical.",
      "Do not invent study names or government statistics.",
    ],
    webSearchQueries: [],
    sources: [],
    model: "fallback-no-grounding",
    apiKeySuffix: "none",
    rawJson: "{}",
  };
}

export function buildFallbackSerpBriefFromContract(
  contract: Pick<EditorialContract, "keyword" | "angleLabel" | "audience">,
  forbiddenTitles: string[] = []
): SerpResearchBrief {
  return buildFallbackSerpBrief({
    keyword: contract.keyword,
    angle: contract.angleLabel,
    audience: contract.audience,
    forbiddenTitles,
  });
}
