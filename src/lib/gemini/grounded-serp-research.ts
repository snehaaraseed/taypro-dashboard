import "server-only";

import { GoogleGenAI } from "@google/genai";
import {
  assertGroundingCallBudget,
  GroundingQuotaExceededError,
  resolveGroundingModel,
} from "@/lib/gemini/grounding-config";
import { isGeminiQuotaError, listGeminiApiKeys } from "@/lib/gemini/api-keys";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";

import type { StructuralArchetype } from "@/lib/seo/corpus-index";

export type SerpRankingEntry = {
  title: string;
  domain?: string;
  url?: string;
};

export type SerpResearchBrief = {
  keyword: string;
  angle: string;
  searchQuery: string;
  rankingTitles: SerpRankingEntry[];
  commonH2Themes: string[];
  peopleAlsoAsk: string[];
  serpGaps: string[];
  freshnessNotes: string[];
  candidateTitles: string[];
  /** Queries the model executed via Google Search grounding (if returned). */
  webSearchQueries: string[];
  /** Grounding source URIs from metadata. */
  sources: { title?: string; uri?: string }[];
  model: string;
  apiKeySuffix: string;
  rawJson: string;
};

export type GroundedSerpResearchInput = {
  keyword: string;
  angle?: string;
  audience?: string;
  /** Titles we must not duplicate (CMS + rejected). */
  forbiddenTitles?: string[];
  /** Archetypes exhausted for this keyword cluster, gaps must NOT reuse these shapes. */
  forbiddenArchetypes?: StructuralArchetype[];
  /** H2 themes already saturated in corpus/SERP: avoid in candidate titles and gaps. */
  saturatedH2Themes?: string[];
  /** Grounded calls already made this pipeline run. */
  serpCallsSoFar?: number;
  /** Use higher grounding cap for monthly insight reports. */
  insightsMode?: boolean;
};

function resolveSerpModels(): string[] {
  const env = process.env.GEMINI_SERP_MODEL?.trim();
  if (env) return [env];
  return [resolveGroundingModel()];
}

function buildSearchQuery(input: GroundedSerpResearchInput): string {
  const kw = input.keyword.trim();
  const angle = input.angle?.trim();
  const parts = [kw, angle, "utility scale solar India O&M"].filter(Boolean);
  return parts.join(" ");
}

function buildSerpResearchPrompt(input: GroundedSerpResearchInput): string {
  const searchQuery = buildSearchQuery(input);
  const forbidden =
    input.forbiddenTitles && input.forbiddenTitles.length > 0
      ? `\nFORBIDDEN TITLES (do not suggest these or close paraphrases):\n${input.forbiddenTitles.map((t) => `- ${t}`).join("\n")}\n`
      : "";
  const archetypeBlock =
    input.forbiddenArchetypes && input.forbiddenArchetypes.length > 0
      ? `\nEXHAUSTED ARTICLE SHAPES (serpGaps and candidateTitles must NOT use these listicle/guide patterns): ${input.forbiddenArchetypes.join(", ")}\n`
      : "";
  const h2Block =
    input.saturatedH2Themes && input.saturatedH2Themes.length > 0
      ? `\nSATURATED H2 THEMES (do not repeat as primary gaps): ${input.saturatedH2Themes.slice(0, 8).join("; ")}\n`
      : "";

  return `You are an SEO strategist for Taypro (utility-scale solar panel cleaning robots in India).

Use Google Search to inspect what currently ranks for utility-scale / MW-plant intent, NOT homeowner DIY content.

SEARCH FOCUS: "${searchQuery}"
Primary keyword: "${input.keyword}"
Editorial angle slot: "${input.angle?.trim() || "practical O&M decision guide"}"
Audience: ${input.audience?.trim() || "utility plant O&M leads and asset owners"}
${forbidden}${archetypeBlock}${h2Block}

Return ONLY valid JSON (no markdown):
{
  "rankingTitles": [
    { "title": "exact or close SERP title", "domain": "example.com", "url": "optional" }
  ],
  "commonH2Themes": ["theme clusters seen across top results"],
  "peopleAlsoAsk": ["question 1", "question 2"],
  "serpGaps": ["what top results miss that Taypro could cover for MW plants in India"],
  "freshnessNotes": ["dated fact or trend worth mentioning, with year if known"],
  "candidateTitles": ["3 unique SEO titles 50-68 chars, include keyword variant, NOT in forbidden list"]
}

Rules:
- rankingTitles: up to 5 commercial/utility-scale results; skip thin DIY-only pages when possible.
- peopleAlsoAsk: 4-6 natural search questions.
- candidateTitles: must differ from rankingTitles and forbidden list; prefer robot/O&M/tracker/dust-belt angles when relevant.
- freshnessNotes: only include if search supports them; do not invent stats.`;
}

function parseJsonFromText(text: string): Record<string, unknown> {
  try {
    return parseGeminiJsonObject(text);
  } catch {
    throw new Error("Grounded SERP response did not contain JSON");
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asRankingEntries(value: unknown): SerpRankingEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: SerpRankingEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = String(row.title ?? "").trim();
    if (!title) continue;
    entries.push({
      title,
      domain: String(row.domain ?? "").trim() || undefined,
      url: String(row.url ?? "").trim() || undefined,
    });
  }
  return entries.slice(0, 5);
}

function extractGroundingMeta(response: unknown): {
  webSearchQueries: string[];
  sources: { title?: string; uri?: string }[];
} {
  const webSearchQueries: string[] = [];
  const sources: { title?: string; uri?: string }[] = [];

  const candidates = [
    (response as { candidates?: unknown[] })?.candidates?.[0],
    (response as { response?: { candidates?: unknown[] } })?.response
      ?.candidates?.[0],
  ].filter(Boolean);

  for (const candidate of candidates) {
    const meta = (candidate as { groundingMetadata?: Record<string, unknown> })
      .groundingMetadata;
    if (!meta) continue;

    const queries = meta.webSearchQueries;
    if (Array.isArray(queries)) {
      for (const q of queries) {
        if (typeof q === "string" && q.trim()) webSearchQueries.push(q.trim());
      }
    }

    const chunks = meta.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        if (!chunk || typeof chunk !== "object") continue;
        const web = (chunk as { web?: { title?: string; uri?: string } }).web;
        if (web?.uri) {
          sources.push({ title: web.title, uri: web.uri });
        }
      }
    }
  }

  return {
    webSearchQueries: [...new Set(webSearchQueries)],
    sources,
  };
}

function parseSerpBrief(
  rawJson: string,
  input: GroundedSerpResearchInput,
  meta: {
    model: string;
    apiKeySuffix: string;
    webSearchQueries: string[];
    sources: { title?: string; uri?: string }[];
  }
): SerpResearchBrief {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = parseJsonFromText(rawJson);
  } catch (error) {
    if (!input.insightsMode) {
      throw error instanceof Error ? error : new Error(String(error));
    }
    console.warn(
      "[serp] Insights: JSON parse failed, using grounding sources with empty SERP themes"
    );
  }
  return {
    keyword: input.keyword.trim(),
    angle: input.angle?.trim() || "practical O&M decision guide",
    searchQuery: buildSearchQuery(input),
    rankingTitles: asRankingEntries(parsed.rankingTitles),
    commonH2Themes: asStringArray(parsed.commonH2Themes).slice(0, 8),
    peopleAlsoAsk: asStringArray(parsed.peopleAlsoAsk).slice(0, 8),
    serpGaps: asStringArray(parsed.serpGaps).slice(0, 6),
    freshnessNotes: asStringArray(parsed.freshnessNotes).slice(0, 5),
    candidateTitles: asStringArray(parsed.candidateTitles).slice(0, 3),
    webSearchQueries: meta.webSearchQueries,
    sources: meta.sources.slice(0, 10),
    model: meta.model,
    apiKeySuffix: meta.apiKeySuffix,
    rawJson,
  };
}

function isRetryableGroundingError(error: unknown): boolean {
  if (isGeminiQuotaError(error)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("did not contain JSON") ||
    message.includes("Could not parse JSON") ||
    message.includes("response was empty")
  );
}

/**
 * One efficient grounded call: live SERP themes + gaps + 3 candidate titles.
 * Uses GEMINI_API_KEY then GEMINI_API_KEY_2 on quota errors.
 */
export async function runGroundedSerpResearch(
  input: GroundedSerpResearchInput
): Promise<SerpResearchBrief> {
  if (input.insightsMode) {
    const { assertInsightsGroundingCallBudget } = await import(
      "@/lib/gemini/grounding-config"
    );
    assertInsightsGroundingCallBudget(input.serpCallsSoFar ?? 0);
  } else {
    assertGroundingCallBudget(input.serpCallsSoFar ?? 0);
  }

  const prompt = buildSerpResearchPrompt(input);
  const model = resolveSerpModels()[0]!;
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;
  let quotaKeys = 0;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          maxOutputTokens: 4096,
        },
      });

      const text = (response.text ?? "").trim();
      if (!text) {
        throw new Error("Grounded SERP response was empty");
      }

      const grounding = extractGroundingMeta(response);
      await pauseAfterGeminiCall();

      return parseSerpBrief(text, input, {
        model,
        apiKeySuffix: apiKey.slice(-4), ...grounding,
      });
    } catch (error) {
      lastError = error;
      if (isRetryableGroundingError(error)) {
        quotaKeys += isGeminiQuotaError(error) ? 1 : 0;
        console.warn(
          `[serp] Retrying on next key (...${apiKey.slice(-4)}): ${
            error instanceof Error ? error.message.slice(0, 100) : error
          }`
        );
        continue;
      }
      console.warn(`[serp] Model ${model} failed:`, error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  if (quotaKeys >= apiKeys.length) {
    if (input.insightsMode) {
      const { buildFallbackSerpBrief } = await import(
        "@/lib/gemini/grounding-config"
      );
      console.warn("[serp] Insights: all keys quota, fallback SERP brief");
      return buildFallbackSerpBrief(input);
    }
    throw new GroundingQuotaExceededError(model, lastError);
  }

  if (input.insightsMode) {
    const { buildFallbackSerpBrief } = await import(
      "@/lib/gemini/grounding-config"
    );
    console.warn("[serp] Insights: grounding exhausted, fallback SERP brief");
    return buildFallbackSerpBrief(input);
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Grounded SERP research failed"
  );
}

export function formatSerpBriefForPrompt(brief: SerpResearchBrief): string {
  const lines = [
    "SERP RESEARCH (Google Search grounding, use for angle/gaps, not for copying text):",
    `Query: ${brief.searchQuery}`,
    `Keyword: ${brief.keyword} | Angle: ${brief.angle}`,
  ];

  if (brief.rankingTitles.length) {
    lines.push(
      "Top ranking titles:", ...brief.rankingTitles.map(
        (r, i) =>
          `${i + 1}. ${r.title}${r.domain ? ` (${r.domain})` : ""}`
      )
    );
  }
  if (brief.commonH2Themes.length) {
    lines.push(`Common H2 themes: ${brief.commonH2Themes.join("; ")}`);
  }
  if (brief.peopleAlsoAsk.length) {
    lines.push(
      "People Also Ask:", ...brief.peopleAlsoAsk.map((q) => `- ${q}`)
    );
  }
  if (brief.serpGaps.length) {
    lines.push(`SERP gaps to exploit: ${brief.serpGaps.join("; ")}`);
  }
  if (brief.freshnessNotes.length) {
    lines.push(`Freshness: ${brief.freshnessNotes.join("; ")}`);
  }
  if (brief.candidateTitles.length) {
    lines.push(
      "Candidate titles (pick one or refine):", ...brief.candidateTitles.map((t) => `- ${t}`)
    );
  }

  return lines.join("\n");
}
