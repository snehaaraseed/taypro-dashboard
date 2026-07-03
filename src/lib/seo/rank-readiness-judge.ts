import "server-only";

import { generateAutomationText } from "@/lib/gemini/generate-automation-text";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";

/**
 * LLM-as-judge rank-readiness gate. Complements the heuristic scorecard by
 * judging whether the draft is genuinely more complete/useful than what already
 * ranks (using the SERP brief as competitive context). Designed to FAIL SAFE:
 * if the judge call fails (quota, parse), it returns ran=false and never blocks
 * publishing, the heuristic gate still applies.
 */

export type RankJudgeVerdict = "pass" | "revise" | "fail";

export type RankJudgeResult = {
  ran: boolean;
  verdict: RankJudgeVerdict;
  score: number;
  reasons: string[];
  differentiationGaps: string[];
  factualConcerns: string[];
};

export const RANK_JUDGE_FAILURE_MARKER = "Rank-readiness gate failed";

export function getRankJudgeMinScore(): number {
  const raw = process.env.BLOG_JUDGE_MIN_SCORE?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 70;
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 100 ? parsed : 70;
}

export function rankJudgeEnabled(): boolean {
  return process.env.BLOG_RANK_JUDGE?.trim().toLowerCase() !== "false";
}

function buildJudgePrompt(input: {
  title: string;
  primaryKeyword: string;
  bodyText: string;
  serpBrief?: SerpResearchBrief | null;
  factBrief?: FactResearchBrief | null;
}): string {
  const serp = input.serpBrief;
  const competitiveContext = serp
    ? [
        serp.rankingTitles?.length
          ? `Currently ranking titles:\n${serp.rankingTitles
              .map((t) => `- ${typeof t === "string" ? t : t.title}`)
              .slice(0, 8)
              .join("\n")}`
          : "",
        serp.commonH2Themes?.length
          ? `Common competitor sections: ${serp.commonH2Themes.slice(0, 10).join("; ")}`
          : "",
        serp.peopleAlsoAsk?.length
          ? `People Also Ask: ${serp.peopleAlsoAsk.slice(0, 8).join(" | ")}`
          : "",
        serp.serpGaps?.length
          ? `Known SERP gaps to beat: ${serp.serpGaps.slice(0, 6).join("; ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "(no live SERP context available)";

  const stats = input.factBrief?.verifiedStats?.length
    ? input.factBrief.verifiedStats
        .map((s) => `- ${s.claim}: ${s.value}`)
        .slice(0, 8)
        .join("\n")
    : "(none provided)";

  return `You are a STRICT Google Search Quality Rater applying E-E-A-T and Helpful Content standards. Judge whether this draft would realistically rank in the top 5 for its query, versus the content that already ranks.

Query / primary keyword: "${input.primaryKeyword}"
Draft title: "${input.title}"

COMPETITIVE CONTEXT (what already ranks):
${competitiveContext}

VERIFIED STATS AVAILABLE TO THE WRITER:
${stats}

DRAFT BODY (plain text, may be truncated):
${input.bodyText.slice(0, 9000)}

Rate harshly. Penalize: generic/padded prose, restating the question without answering, missing the known SERP gaps, no unique angle or first-hand operational specifics, vague "industry is growing" filler, or claims that read invented.

Reward: a direct early answer, specific MW/%/INR/day ranges, decision criteria, coverage of the PAA + gaps, genuine operator-level depth a competitor would not easily copy.

Return ONLY valid JSON:
{
  "score": 0-100,
  "verdict": "pass" | "revise" | "fail",
  "reasons": ["short, concrete reasons for the score"],
  "differentiationGaps": ["what top results have that this draft lacks"],
  "factualConcerns": ["any claim that looks unsupported or invented"]
}

Scoring guide: 80-100 clearly competitive; 70-79 solid, minor gaps; 55-69 publishable only after fixes; <55 not rank-worthy. Use "pass" only at 70+.`;
}

function asStringArray(value: unknown, limit = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, limit);
}

export async function judgeRankReadiness(input: {
  title: string;
  primaryKeyword: string;
  content: string;
  serpBrief?: SerpResearchBrief | null;
  factBrief?: FactResearchBrief | null;
}): Promise<RankJudgeResult> {
  const safe: RankJudgeResult = {
    ran: false,
    verdict: "pass",
    score: 0,
    reasons: [],
    differentiationGaps: [],
    factualConcerns: [],
  };
  if (!rankJudgeEnabled()) return safe;

  const bodyText = stripHtmlToPlainText(input.content);
  if (bodyText.split(/\s+/).filter(Boolean).length < 200) return safe;

  try {
    const prompt = buildJudgePrompt({
      title: input.title,
      primaryKeyword: input.primaryKeyword,
      bodyText,
      serpBrief: input.serpBrief,
      factBrief: input.factBrief,
    });
    const text = await generateAutomationText(prompt, {
      maxOutputTokens: 1024,
      purpose: "editorial",
      preferQualityModel: true,
    });
    const parsed = parseGeminiJsonObject<Record<string, unknown>>(text);

    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const rawVerdict = String(parsed.verdict ?? "").toLowerCase();
    const verdict: RankJudgeVerdict =
      rawVerdict === "pass" || rawVerdict === "revise" || rawVerdict === "fail"
        ? (rawVerdict as RankJudgeVerdict)
        : score >= getRankJudgeMinScore()
          ? "pass"
          : "fail";

    return {
      ran: true,
      verdict,
      score,
      reasons: asStringArray(parsed.reasons),
      differentiationGaps: asStringArray(parsed.differentiationGaps),
      factualConcerns: asStringArray(parsed.factualConcerns),
    };
  } catch (error) {
    console.warn(
      "[rank-judge] Skipped (fail-safe pass):",
      error instanceof Error ? error.message.slice(0, 120) : error
    );
    return safe;
  }
}

/** True when the judge ran and the draft is below the publish bar. */
export function judgeBlocksPublish(result: RankJudgeResult): boolean {
  if (!result.ran) return false;
  return result.verdict === "fail" || result.score < getRankJudgeMinScore();
}

export function rankJudgeFailureMessage(result: RankJudgeResult): string {
  const reasons = [...result.reasons, ...result.differentiationGaps].slice(0, 4);
  return `${RANK_JUDGE_FAILURE_MARKER} (judge ${result.score}/100, ${result.verdict}): ${reasons.join("; ")}`;
}
