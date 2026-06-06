import "server-only";

import { GoogleGenAI } from "@google/genai";
import {
  geminiQuotaErrorMessage,
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  assertSerpCallAllowed,
  recordGeminiCall,
} from "@/lib/gemini/daily-budget";

const DEFAULT_FACT_GROUNDING_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
] as const;

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
  /** Calls already made this pipeline run (for per-blog cap). */
  serpCallsSoFar?: number;
};

function resolveFactModels(): string[] {
  const env = process.env.GEMINI_SERP_MODEL?.trim();
  if (env) return [env];
  return [...DEFAULT_FACT_GROUNDING_MODELS];
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

  return `You are a research analyst for Taypro (utility-scale solar O&M in India).

Use Google Search to find VERIFIABLE industry and government statistics for a blog post.
Do NOT search for Taypro product specs or invent numbers.

Blog keyword: "${input.keyword}"
Blog title: "${input.title}"
${themes}${gaps}

Search focus: India utility-scale / MW solar plants, soiling, cleaning economics, regulations (MNRE, CEA, state policies), market reports.

Return ONLY valid JSON (no markdown):
{
  "verifiedStats": [
    {
      "claim": "what the stat describes",
      "value": "exact figure or range with units",
      "context": "India utility-scale / region / year if known",
      "sourceHint": "report name, agency, or domain — no fabricated study names"
    }
  ],
  "regulatoryNotes": ["brief note with year if search supports it"],
  "marketTrends": ["brief trend with year if search supports it"],
  "citationGuardrails": ["rules for the writer, e.g. prefer MNRE/CEA sources"]
}

Rules:
- verifiedStats: 4–8 items max; ONLY include stats you found via search. Empty array if nothing reliable.
- Do NOT invent percentages, study names, or Taypro fleet numbers.
- Prefer India + utility-scale / commercial solar context; skip homeowner DIY stats.
- regulatoryNotes and marketTrends: 0–4 items each; omit if search finds nothing.
- citationGuardrails: 2–4 writer rules (e.g. "Label unsourced ranges as industry-typical").`;
}

function parseJsonFromText(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Grounded fact response did not contain JSON");
    return JSON.parse(match[0]) as Record<string, unknown>;
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
  const parsed = parseJsonFromText(rawJson);
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
export async function runGroundedFactResearch(
  input: GroundedFactResearchInput
): Promise<FactResearchBrief> {
  const prompt = buildFactResearchPrompt(input);
  const models = resolveFactModels();
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;
  let quotaExhaustedKeys = 0;
  const callsSoFar = input.serpCallsSoFar ?? 0;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });
    let keyHitQuota = false;

    for (const model of models) {
      try {
        assertSerpCallAllowed("serp_facts", callsSoFar);
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
        recordGeminiCall("serp_facts");
        await pauseAfterGeminiCall();

        return parseFactBrief(text, input, {
          model,
          apiKeySuffix: apiKey.slice(-4),
          ...grounding,
        });
      } catch (error) {
        lastError = error;
        if (isGeminiQuotaError(error)) {
          keyHitQuota = true;
          console.warn(
            `[facts] Quota on key ...${apiKey.slice(-4)} model ${model}, trying next.`
          );
          break;
        }
        console.warn(`[facts] Model ${model} failed:`, error);
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

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "Grounded fact research failed on all models"
  );
}

export function formatFactBriefForPrompt(brief: FactResearchBrief): string {
  const lines = [
    "FACT RESEARCH (Google Search grounding — use for stats/regulatory context, NOT Taypro product specs):",
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
      "Verified stats: none found — use industry-typical ranges and label as typical, not cited studies."
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
      "Citation guardrails:",
      ...brief.citationGuardrails.map((g) => `- ${g}`)
    );
  }

  return lines.join("\n");
}
