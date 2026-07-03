import "server-only";

import { isTooGenericTitle } from "@/lib/seo/content-quality";

/**
 * Post-draft rank-readiness scorecard. Runs AFTER the draft passes uniqueness
 * gates and BEFORE publish. Rejects thin/padded drafts so only genuinely
 * rank-worthy posts go live. Failures are retryable (new contract / brief).
 */

export const RANK_READINESS_FAILURE_MARKER = "Rank-readiness gate failed";

export type RankReadinessInput = {
  title: string;
  description: string;
  content: string;
  primaryKeyword: string;
  peopleAlsoAsk?: string[];
  serpGaps?: string[];
  contentFormat?: "standard" | "narrative";
};

export type RankReadinessResult = {
  pass: boolean;
  score: number;
  reasons: string[];
  signals: {
    wordCount: number;
    h2Count: number;
    hasQuestionHeading: boolean;
    hasDirectAnswer: boolean;
    hasListOrTable: boolean;
    internalLinks: number;
    paaCoverage: number;
    gapCoverage: number;
    keywordInTitle: boolean;
  };
};

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlap(needle: string, haystack: string): number {
  const tokens = needle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3);
  if (tokens.length === 0) return 0;
  const hit = tokens.filter((t) => haystack.includes(t)).length;
  return hit / tokens.length;
}

const MIN_WORDS = 1100;
const MIN_H2 = 4;
const MIN_INTERNAL_LINKS = 2;
const PASS_THRESHOLD = 70;

export function evaluateRankReadiness(
  input: RankReadinessInput
): RankReadinessResult {
  const html = input.content ?? "";
  const text = stripHtml(html);
  const textLower = text.toLowerCase();
  const htmlLower = html.toLowerCase();

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const h2Matches = html.match(/<h2[\s>]/gi) ?? [];
  const h2Count = h2Matches.length;

  const headingText = (html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) ?? [])
    .map((h) => stripHtml(h).toLowerCase())
    .join(" || ");
  const hasQuestionHeading = /\?|^\s*(how|what|why|when|which|should|can|is|are)\b/m.test(
    headingText
  );

  const firstChunk = textLower.slice(0, 600);
  const hasDirectAnswer =
    tokenOverlap(input.primaryKeyword, firstChunk) >= 0.5 ||
    /\b(in short|short answer|the answer is|yes,|no,)\b/.test(firstChunk);

  const hasListOrTable =
    /<table[\s>]/i.test(html) ||
    (html.match(/<li[\s>]/gi) ?? []).length >= 4;
  const narrative = input.contentFormat === "narrative";
  const hasNarrativeOpening =
    firstChunk.length >= 200 &&
    /\b(plant|mw|site|asset|operator|o&m|performance ratio|pr)\b/i.test(
      firstChunk
    );

  const internalLinks = (htmlLower.match(/href=["'](\/|https?:\/\/(www\.)?taypro)/gi) ?? [])
    .length;

  const paaList = input.peopleAlsoAsk ?? [];
  const paaCoverage =
    paaList.length === 0
      ? 1
      : paaList.filter((q) => tokenOverlap(q, textLower) >= 0.5).length /
        paaList.length;

  const gapList = input.serpGaps ?? [];
  const gapCoverage =
    gapList.length === 0
      ? 1
      : gapList.filter((g) => tokenOverlap(g, textLower) >= 0.4).length /
        gapList.length;

  const keywordInTitle =
    tokenOverlap(input.primaryKeyword, input.title.toLowerCase()) >= 0.4;

  const reasons: string[] = [];
  let score = 0;

  if (wordCount >= MIN_WORDS) score += 20;
  else reasons.push(`thin content (${wordCount} words < ${MIN_WORDS})`);

  if (h2Count >= MIN_H2) score += 15;
  else reasons.push(`too few H2 sections (${h2Count} < ${MIN_H2})`);

  if (hasDirectAnswer) score += 15;
  else reasons.push("no direct answer near the top (intent not satisfied early)");

  if (hasQuestionHeading) score += 10;
  else reasons.push("no question-style heading (weak PAA capture)");

  if (narrative ? hasNarrativeOpening || hasListOrTable : hasListOrTable) {
    score += 10;
  } else {
    reasons.push(
      narrative
        ? "narrative opening lacks plant-scene specificity"
        : "no scannable list/table (poor skimmability)"
    );
  }

  if (internalLinks >= MIN_INTERNAL_LINKS) score += 10;
  else reasons.push(`too few internal links (${internalLinks} < ${MIN_INTERNAL_LINKS})`);

  if (paaCoverage >= 0.5) score += 10;
  else reasons.push(`weak PAA coverage (${Math.round(paaCoverage * 100)}%)`);

  if (gapCoverage >= 0.5) score += 5;
  else reasons.push(`SERP gaps unaddressed (${Math.round(gapCoverage * 100)}%)`);

  if (keywordInTitle && !isTooGenericTitle(input.title, input.primaryKeyword)) {
    score += 5;
  } else {
    reasons.push("title generic or off-keyword");
  }

  const pass = score >= PASS_THRESHOLD;

  return {
    pass,
    score,
    reasons: pass ? [] : reasons,
    signals: {
      wordCount,
      h2Count,
      hasQuestionHeading,
      hasDirectAnswer,
      hasListOrTable,
      internalLinks,
      paaCoverage: Math.round(paaCoverage * 100) / 100,
      gapCoverage: Math.round(gapCoverage * 100) / 100,
      keywordInTitle,
    },
  };
}

export function rankReadinessFailureMessage(result: RankReadinessResult): string {
  return `${RANK_READINESS_FAILURE_MARKER} (score ${result.score}/100): ${result.reasons
    .slice(0, 4)
    .join("; ")}`;
}
