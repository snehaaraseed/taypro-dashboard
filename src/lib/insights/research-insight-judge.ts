import "server-only";

import { generateAutomationText } from "@/lib/gemini/generate-automation-text";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { formatSerpBriefForPrompt } from "@/lib/gemini/grounded-serp-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";

/**
 * LLM-as-judge quality gate for the monthly deep research report.
 *
 * Structural validation (word count, H2 count, links) cannot tell whether a
 * 4,000-word report is genuinely useful or just long-winded filler. This judge
 * reads the full report against the live SERP context + verified stats and
 * scores depth, specificity, factual grounding, and decision-usefulness for an
 * IPP / O&M executive audience.
 *
 * Fail-safe: if the judge call errors (quota/parse), it returns ran=false and
 * never blocks publishing, the structural validator still applies.
 */

export type ResearchJudgeVerdict = "pass" | "revise" | "fail";

export type ResearchJudgeResult = {
  ran: boolean;
  verdict: ResearchJudgeVerdict;
  score: number;
  reasons: string[];
  weakSections: string[];
  factualConcerns: string[];
};

export const RESEARCH_JUDGE_FAILURE_MARKER = "Research quality gate failed";

export function getResearchJudgeMinScore(): number {
  const raw = process.env.RESEARCH_JUDGE_MIN_SCORE?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 72;
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 100 ? parsed : 72;
}

export function researchJudgeEnabled(): boolean {
  return process.env.RESEARCH_INSIGHT_JUDGE?.trim().toLowerCase() !== "false";
}

function buildJudgePrompt(input: {
  title: string;
  audience: string;
  primaryKeyword: string;
  bodyText: string;
  readerQuestions: string[];
  serpBrief?: SerpResearchBrief | null;
  factBriefs: FactResearchBrief[];
}): string {
  const serp = input.serpBrief
    ? formatSerpBriefForPrompt(input.serpBrief)
    : "(no live SERP context available)";

  const stats = input.factBriefs
    .flatMap((f) => f.verifiedStats ?? [])
    .slice(0, 12)
    .map((s) => `- ${s.claim}: ${s.value}`)
    .join("\n");

  const questions = input.readerQuestions.length
    ? input.readerQuestions.map((q) => `- ${q}`).join("\n")
    : "(none provided)";

  return `You are a STRICT research editor reviewing a monthly long-form research report before it is published to a procurement-intelligence hub read by utility-scale solar buyers in India. Judge whether this report is genuinely authoritative, specific, and decision-useful, not padded.

Report title: "${input.title}"
Audience: ${input.audience}
Primary keyword: "${input.primaryKeyword}"

QUESTIONS THE REPORT MUST ANSWER:
${questions}

LIVE RESEARCH CONTEXT (what the web shows):
${serp}

VERIFIED STATS AVAILABLE TO THE WRITER:
${stats || "(none provided)"}

REPORT BODY (plain text, may be truncated):
${input.bodyText.slice(0, 14000)}

AUTOMATIC FAIL (score < 40) if the body contains ANY leaked model scaffolding, e.g. "Part X of Y", planning notes, word-count targets, "Self-Correction", "(Proceeding to generate…)", restated instructions, markdown bullets used as notes, or output markers. Readers must only ever see finished prose.

Rate harshly. Penalize: generic "the industry is growing" filler, sections that restate the heading without substance, repeated points across sections, vague claims with no MW/%/INR/day specifics, missing answers to the reader questions, or invented-looking figures.

Reward: concrete operator-level depth (numbers, ranges, decision criteria, RFP/contract specifics), genuine use of the research context and verified stats, clear regional India detail, and a report a competitor could not quickly copy.

Return ONLY valid JSON:
{
  "score": 0-100,
  "verdict": "pass" | "revise" | "fail",
  "reasons": ["short, concrete reasons for the score"],
  "weakSections": ["section headings or themes that are thin/padded"],
  "factualConcerns": ["any claim that looks unsupported or invented"]
}

Scoring guide: 85-100 flagship-grade; 72-84 solid and publishable; 55-71 publishable only after fixes; <55 not worth publishing. Use "pass" only at ${getResearchJudgeMinScore()}+.`;
}

function asStringArray(value: unknown, limit = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, limit);
}

export async function judgeResearchInsight(input: {
  title: string;
  audience: string;
  primaryKeyword: string;
  content: string;
  readerQuestions: string[];
  serpBrief?: SerpResearchBrief | null;
  factBriefs: FactResearchBrief[];
}): Promise<ResearchJudgeResult> {
  const safe: ResearchJudgeResult = {
    ran: false,
    verdict: "pass",
    score: 0,
    reasons: [],
    weakSections: [],
    factualConcerns: [],
  };
  if (!researchJudgeEnabled()) return safe;

  const bodyText = stripHtmlToPlainText(input.content);
  if (bodyText.split(/\s+/).filter(Boolean).length < 500) return safe;

  try {
    const prompt = buildJudgePrompt({
      title: input.title,
      audience: input.audience,
      primaryKeyword: input.primaryKeyword,
      bodyText,
      readerQuestions: input.readerQuestions,
      serpBrief: input.serpBrief,
      factBriefs: input.factBriefs,
    });
    const text = await generateAutomationText(prompt, {
      maxOutputTokens: 1024,
      purpose: "editorial",
      preferQualityModel: true,
    });
    const parsed = parseGeminiJsonObject<Record<string, unknown>>(text);

    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const rawVerdict = String(parsed.verdict ?? "").toLowerCase();
    const verdict: ResearchJudgeVerdict =
      rawVerdict === "pass" || rawVerdict === "revise" || rawVerdict === "fail"
        ? (rawVerdict as ResearchJudgeVerdict)
        : score >= getResearchJudgeMinScore()
          ? "pass"
          : "fail";

    return {
      ran: true,
      verdict,
      score,
      reasons: asStringArray(parsed.reasons),
      weakSections: asStringArray(parsed.weakSections),
      factualConcerns: asStringArray(parsed.factualConcerns),
    };
  } catch (error) {
    console.warn(
      "[research-judge] Skipped (fail-safe pass):",
      error instanceof Error ? error.message.slice(0, 120) : error
    );
    return safe;
  }
}

/** True when the judge ran and the report is below the publish bar. */
export function researchJudgeBlocksPublish(result: ResearchJudgeResult): boolean {
  if (!result.ran) return false;
  return result.verdict === "fail" || result.score < getResearchJudgeMinScore();
}

export function researchJudgeFailureMessage(result: ResearchJudgeResult): string {
  const reasons = [...result.reasons, ...result.weakSections].slice(0, 4);
  return `${RESEARCH_JUDGE_FAILURE_MARKER} (judge ${result.score}/100, ${result.verdict}): ${reasons.join("; ")}`;
}
