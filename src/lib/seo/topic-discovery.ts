import "server-only";

import { GoogleGenAI } from "@google/genai";
import { isGeminiQuotaError, listGeminiApiKeys } from "@/lib/gemini/api-keys";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import { resolveGroundingModel } from "@/lib/gemini/grounding-config";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import { listSemanticDomains } from "@/lib/seo/semantic-topic-coordinates";

/**
 * Demand-first topic discovery: uses Google Search grounding to find REAL
 * search queries (PAA, related searches, SERP gaps) for each domain, instead
 * of inventing topics from templates. Output feeds the brief validator.
 */

export type DiscoveredCandidate = {
  domainId: string;
  /** Real search query / question a buyer types. */
  query: string;
  /** Proposed SEO title (refined by writer later). */
  suggestedTitle: string;
  primaryKeyword: string;
  intentFamily: SearchIntentFamily;
  /** Why this is worth writing (gap in current SERP). */
  serpGap: string;
  peopleAlsoAsk: string[];
  freshnessNote?: string;
  rationale?: string;
  /** Grounding source URIs that back this candidate's demand. */
  sources: { title?: string; uri?: string }[];
  webSearchQueries: string[];
};

const VALID_INTENTS: SearchIntentFamily[] = [
  "technical_howto",
  "financial_roi",
  "risk_compliance",
  "comparison_alternative",
  "troubleshooting_problem",
];

function coerceIntent(value: unknown): SearchIntentFamily {
  const v = String(value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (VALID_INTENTS as string[]).includes(v)
    ? (v as SearchIntentFamily)
    : "technical_howto";
}

function asStringArray(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, limit);
}

function buildDiscoveryPrompt(input: {
  domainLabel: string;
  pillarPath?: string;
  forbiddenTitles: string[];
  perDomain: number;
}): string {
  const forbidden =
    input.forbiddenTitles.length > 0
      ? `\nALREADY PUBLISHED (do not propose these or close paraphrases):\n${input.forbiddenTitles
          .slice(0, 40)
          .map((t) => `- ${t}`)
          .join("\n")}\n`
      : "";

  return `You are an SEO demand researcher for Taypro (utility-scale solar panel cleaning robots and O&M in India).

Use Google Search to find what utility-scale solar asset owners, O&M leads, EPCs, and IPPs in India ACTUALLY search about: "${input.domainLabel}".

Focus on MW-scale plant operations in India (not homeowner DIY, not generic "solar energy" content).

For each candidate, verify with search that real demand exists (People Also Ask, related searches, forum/LinkedIn questions, weak existing coverage = a gap Taypro can win).

${forbidden}
Return ONLY valid JSON (no markdown):
{
  "candidates": [
    {
      "query": "the real search query/question someone types",
      "suggestedTitle": "SEO title 45-68 chars answering that query for MW plants in India",
      "primaryKeyword": "concise head/long-tail keyword (3-7 words, how people search)",
      "intentFamily": "one of: technical_howto | financial_roi | risk_compliance | comparison_alternative | troubleshooting_problem",
      "serpGap": "what current top results miss that Taypro O&M expertise can answer better",
      "peopleAlsoAsk": ["related question 1", "related question 2"],
      "freshnessNote": "optional dated trend/regulation with year if search supports it",
      "rationale": "one line: why this ranks-worthy and on-brand"
    }
  ]
}

Rules:
- Propose up to ${input.perDomain} DISTINCT high-quality candidates. Quality over quantity: skip anything you cannot back with a real search gap.
- primaryKeyword must be how a buyer actually searches (no stuffed scale+geo strings).
- Do NOT propose money-page terms ("solar panel cleaning robot", ", ...cleaning system", ", ...cleaning service") as primary keywords; those are product pages, not blogs.
- suggestedTitle: specific (method, comparison, number, region, MW), no marketing fluff ("Boost", "Unlock", "Future of"), no em dashes.
- Only include freshnessNote if search supports it; never invent statistics or study names.`;
}

function extractGroundingMeta(response: unknown): {
  webSearchQueries: string[];
  sources: { title?: string; uri?: string }[];
} {
  const webSearchQueries: string[] = [];
  const sources: { title?: string; uri?: string }[] = [];
  const candidate = (response as { candidates?: unknown[] })?.candidates?.[0];
  const meta = (candidate as { groundingMetadata?: Record<string, unknown> })
    ?.groundingMetadata;
  if (meta) {
    const queries = meta.webSearchQueries;
    if (Array.isArray(queries)) {
      for (const q of queries) {
        if (typeof q === "string" && q.trim()) webSearchQueries.push(q.trim());
      }
    }
    const chunks = meta.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        const web = (chunk as { web?: { title?: string; uri?: string } })?.web;
        if (web?.uri) sources.push({ title: web.title, uri: web.uri });
      }
    }
  }
  return { webSearchQueries: [...new Set(webSearchQueries)], sources };
}

/** One grounded discovery call for a single domain. */
export async function discoverCandidatesForDomain(input: {
  domainId: string;
  domainLabel: string;
  pillarPath?: string;
  forbiddenTitles?: string[];
  perDomain?: number;
}): Promise<DiscoveredCandidate[]> {
  const prompt = buildDiscoveryPrompt({
    domainLabel: input.domainLabel,
    pillarPath: input.pillarPath,
    forbiddenTitles: input.forbiddenTitles ?? [],
    perDomain: input.perDomain ?? 5,
  });
  const model = resolveGroundingModel();
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;

  for (const apiKey of apiKeys) {
    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }], maxOutputTokens: 8192 },
      });
      const text = (response.text ?? "").trim();
      if (!text) throw new Error("Discovery response was empty");

      const parsed = parseGeminiJsonObject<Record<string, unknown>>(text);
      const grounding = extractGroundingMeta(response);
      await pauseAfterGeminiCall();

      const rawList = Array.isArray(parsed.candidates) ? parsed.candidates : [];
      const out: DiscoveredCandidate[] = [];
      for (const item of rawList) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const query = String(row.query ?? "").trim();
        const suggestedTitle = String(row.suggestedTitle ?? "").trim();
        const primaryKeyword = String(row.primaryKeyword ?? "").trim();
        if (!suggestedTitle || !primaryKeyword) continue;
        out.push({
          domainId: input.domainId,
          query: query || suggestedTitle,
          suggestedTitle,
          primaryKeyword,
          intentFamily: coerceIntent(row.intentFamily),
          serpGap: String(row.serpGap ?? "").trim(),
          peopleAlsoAsk: asStringArray(row.peopleAlsoAsk),
          freshnessNote: String(row.freshnessNote ?? "").trim() || undefined,
          rationale: String(row.rationale ?? "").trim() || undefined,
          sources: grounding.sources.slice(0, 6),
          webSearchQueries: grounding.webSearchQueries,
        });
      }
      return out;
    } catch (error) {
      lastError = error;
      if (isGeminiQuotaError(error)) {
        console.warn(
          `[discovery] Quota on ...${apiKey.slice(-4)} for "${input.domainLabel}"; trying next key`
        );
        continue;
      }
      console.warn(
        `[discovery] Failed for "${input.domainLabel}":`,
        error instanceof Error ? error.message.slice(0, 140) : error
      );
      return [];
    }
  }
  console.warn(
    `[discovery] All keys exhausted for "${input.domainLabel}"`,
    lastError instanceof Error ? lastError.message.slice(0, 100) : ""
  );
  return [];
}

export type DomainDiscoverySeed = {
  domainId: string;
  domainLabel: string;
  pillarPath?: string;
};

/** All catalog domains as discovery seeds (breadth source, not topic templates). */
export function listDiscoveryDomainSeeds(): DomainDiscoverySeed[] {
  return listSemanticDomains().map((d) => ({
    domainId: d.id,
    domainLabel: d.label,
    pillarPath: d.pillarPath,
  }));
}
