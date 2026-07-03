import "server-only";

import { GoogleGenAI } from "@google/genai";
import {
  assertGroundingCallBudget,
} from "@/lib/gemini/grounding-config";
import { groundingModelCandidates } from "@/lib/gemini/model-routing";
import { isGeminiQuotaError, listGeminiApiKeys } from "@/lib/gemini/api-keys";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";

export type VerifiedStat = {
  claim: string;
  value: string;
  context: string;
  sourceHint: string;
};

export type FactResearchBrief = {
  keyword: string;
  title: string;
  verifiedStats: VerifiedStat[];
  regulatoryNotes: string[];
  marketTrends: string[];
  citationGuardrails: string[];
  webSearchQueries: string[];
  sources: { title?: string; uri?: string }[];
  model: string;
  apiKeySuffix: string;
  rawJson: string;
};

export type GroundedFactResearchInput = {
  keyword: string;
  title: string;
  commonH2Themes?: string[];
  serpGaps?: string[];
  /** Extra search angle for multi-pass insight research. */
  factFocus?: string;
  /** Calls already made this pipeline run (for per-blog cap). */
  serpCallsSoFar?: number;
  /** Use higher cap for monthly insight reports (default: blog cap). */
  insightsMode?: boolean;
};

function resolveFactModels(): string[] {
  const factOnly = process.env.GEMINI_FACT_MODEL?.trim();
  if (factOnly) {
    return groundingModelCandidates().includes(factOnly)
      ? [factOnly, ...groundingModelCandidates().filter((m) => m !== factOnly)]
      : [factOnly];
  }
  return groundingModelCandidates();
}

function buildFactResearchPrompt(input: GroundedFactResearchInput): string {
  const themes =
    input.commonH2Themes && input.commonH2Themes.length > 0
      ? `\nOutline themes: ${input.commonH2Themes.join("; ")}`
      : "";
  const gaps =
    input.serpGaps && input.serpGaps.length > 0
      ? `\nSERP gaps to support with data: ${input.serpGaps.join("; ")}`
      : "";
  const focus = input.factFocus?.trim()
    ? `\nAdditional search focus for this pass: ${input.factFocus}`
    : "";

  return `You are a research analyst for Taypro (utility-scale solar O&M in India).

Use Google Search to find VERIFIABLE industry and government statistics for a blog post.
Do NOT search for Taypro product specs or invent numbers.

Blog keyword: "${input.keyword}"
Blog title: "${input.title}"
${themes}${gaps}${focus}

Search focus: India utility-scale / MW solar plants, soiling, cleaning economics, regulations (MNRE, CEA, state policies), market reports.

Return ONLY valid JSON (no markdown):
{
  "verifiedStats": [
    {
      "claim": "what the stat describes",
      "value": "exact figure or range with units",
      "context": "India utility-scale / region / year if known",
      "sourceHint": "report name, agency, or domain, no fabricated study names"
    }
  ],
  "regulatoryNotes": ["brief note with year if search supports it"],
  "marketTrends": ["brief trend with year if search supports it"],
  "citationGuardrails": ["rules for the writer, e.g. prefer MNRE/CEA sources"]
}

Rules:
- verifiedStats: 6–10 items max; ONLY include stats you found via search. Empty array if nothing reliable.
- Do NOT invent percentages, study names, or Taypro fleet numbers.
- Prefer India + utility-scale / commercial solar context; skip homeowner DIY stats.
- regulatoryNotes and marketTrends: 0–4 items each; omit if search finds nothing.
- citationGuardrails: 2–4 writer rules (e.g. "Label unsourced ranges as industry-typical").`;
}

function parseJsonFromText(text: string): Record<string, unknown> {
  try {
    return parseGeminiJsonObject(text);
  } catch {
    throw new Error("Grounded fact response did not contain JSON");
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asVerifiedStats(value: unknown): VerifiedStat[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const claim = String(row.claim ?? "").trim();
      const val = String(row.value ?? "").trim();
      if (!claim || !val) return null;
      return {
        claim,
        value: val,
        context: String(row.context ?? "").trim() || "India utility-scale solar",
        sourceHint: String(row.sourceHint ?? "").trim() || "industry report",
      };
    })
    .filter((item): item is VerifiedStat => item !== null)
    .slice(0, 8);
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

function parseFactBrief(
  rawJson: string,
  input: GroundedFactResearchInput,
  meta: {
    model: string;
    apiKeySuffix: string;
    webSearchQueries: string[];
    sources: { title?: string; uri?: string }[];
  }
): FactResearchBrief {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = parseJsonFromText(rawJson);
  } catch (error) {
    if (!input.insightsMode) {
      throw error instanceof Error ? error : new Error(String(error));
    }
    console.warn(
      "[facts] Insights: JSON parse failed, using grounding sources with empty stats"
    );
  }
  return {
    keyword: input.keyword.trim(),
    title: input.title.trim(),
    verifiedStats: asVerifiedStats(parsed.verifiedStats),
    regulatoryNotes: asStringArray(parsed.regulatoryNotes).slice(0, 4),
    marketTrends: asStringArray(parsed.marketTrends).slice(0, 4),
    citationGuardrails: asStringArray(parsed.citationGuardrails).slice(0, 6),
    webSearchQueries: meta.webSearchQueries,
    sources: meta.sources.slice(0, 10),
    model: meta.model,
    apiKeySuffix: meta.apiKeySuffix,
    rawJson,
  };
}

/**
 * Second grounded call: verifiable stats and regulatory context for outline/body.
 */
function isRetryableGroundingError(error: unknown): boolean {
  if (isGeminiQuotaError(error)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("did not contain JSON") ||
    message.includes("Could not parse JSON") ||
    message.includes("response was empty") ||
    // Google-side transient instability on Gemma grounding (rotate to next key).
    message.includes("500") ||
    message.includes("503") ||
    message.includes("Internal error") ||
    message.includes("high demand")
  );
}

export async function runGroundedFactResearch(
  input: GroundedFactResearchInput
): Promise<FactResearchBrief> {
  if (input.insightsMode) {
    const { assertInsightsGroundingCallBudget } = await import(
      "@/lib/gemini/grounding-config"
    );
    assertInsightsGroundingCallBudget(input.serpCallsSoFar ?? 0);
  } else {
    assertGroundingCallBudget(input.serpCallsSoFar ?? 0);
  }

  const prompt = buildFactResearchPrompt(input);
  const models = resolveFactModels();
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;
  let quotaKeys = 0;

  for (const model of models) {
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
          throw new Error("Grounded fact response was empty");
        }

        const grounding = extractGroundingMeta(response);
        await pauseAfterGeminiCall();

        return parseFactBrief(text, input, {
          model,
          apiKeySuffix: apiKey.slice(-4),
          ...grounding,
        });
      } catch (error) {
        lastError = error;
        if (isRetryableGroundingError(error)) {
          quotaKeys += isGeminiQuotaError(error) ? 1 : 0;
          console.warn(
            `[facts] ${model} on ...${apiKey.slice(-4)} retrying: ${
              error instanceof Error ? error.message.slice(0, 100) : error
            }`
          );
          continue;
        }
        console.warn(`[facts] Model ${model} failed on ...${apiKey.slice(-4)}:`, error);
      }
    }
  }

  if (quotaKeys >= apiKeys.length) {
    const { buildEmptyFactBrief } = await import("@/lib/gemini/grounding-config");
    console.warn("[facts] All keys quota-exhausted; using offline fact brief");
    return buildEmptyFactBrief(input.keyword, input.title);
  }

  // Blog + insights: transient grounding failure (e.g. Gemma 500 on all keys)
  // must not kill the write. Proceed with the offline fact brief guardrails.
  const { buildEmptyFactBrief } = await import("@/lib/gemini/grounding-config");
  console.warn(
    `[facts] Grounding unavailable (${
      lastError instanceof Error ? lastError.message.slice(0, 100) : "unknown"
    }); using offline fact brief`
  );
  return buildEmptyFactBrief(input.keyword, input.title);
}

export function formatFactBriefForPrompt(brief: FactResearchBrief): string {
  const lines = [
    "FACT RESEARCH (Google Search grounding, use for stats/regulatory context, NOT Taypro product specs):",
    `Keyword: ${brief.keyword} | Title: ${brief.title}`,
  ];

  if (brief.verifiedStats.length) {
    lines.push("Verified stats (use these for numeric claims when relevant):");
    for (const stat of brief.verifiedStats) {
      lines.push(
        `- ${stat.claim}: ${stat.value} (${stat.context}; source: ${stat.sourceHint})`
      );
    }
  } else {
    lines.push(
      "Verified stats: none found, use industry-typical ranges and label as typical, not cited studies."
    );
  }

  if (brief.regulatoryNotes.length) {
    lines.push(`Regulatory notes: ${brief.regulatoryNotes.join("; ")}`);
  }
  if (brief.marketTrends.length) {
    lines.push(`Market trends: ${brief.marketTrends.join("; ")}`);
  }
  if (brief.citationGuardrails.length) {
    lines.push(
      "Citation guardrails:", ...brief.citationGuardrails.map((g) => `- ${g}`)
    );
  }

  return lines.join("\n");
}
