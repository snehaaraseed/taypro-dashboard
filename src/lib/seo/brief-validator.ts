import "server-only";

import { createSlug } from "@/app/utils/blogFileUtils";
import { findKeywordCorpusConflict, findTitleConflict } from "@/lib/seo/blog-plan-gates";
import type { BlogSimilarityCorpusRow } from "@/lib/cms/blogService";
import { isTooGenericTitle } from "@/lib/seo/content-quality";
import { isCompetitorPrimaryKeyword } from "@/lib/seo/competitor-keyword-guard";
import { isTierAMoneyPageKeyword } from "@/lib/seo/topic-coordinate-renderer";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import type { DiscoveredCandidate } from "@/lib/seo/topic-discovery";
import type { DiscoveredBrief } from "@/lib/seo/discovered-brief-queue";

const INTENT_ANGLE: Record<SearchIntentFamily, string> = {
  technical_howto: "default-guide",
  financial_roi: "cost-mw-india",
  comparison_alternative: "default-compare",
  risk_compliance: "warranty-safe",
  troubleshooting_problem: "under-clean",
};

const SOLAR_OM_SIGNAL =
  /clean|soil|wash|dust|o&m|opex|robot|tracker|module|panel|pv|inverter|scada|performance ratio|\bpr\b|mw|utility|plant|monsoon|rajasthan|gujarat|maharashtra|karnataka|warranty|amc|vendor|fleet|bifacial|degradation|water|commission|epc|ipp/i;

export type BriefValidationResult =
  | { ok: true; brief: DiscoveredBrief }
  | { ok: false; reason: string };

function scoreCandidate(candidate: DiscoveredCandidate): number {
  let score = 50;
  if (candidate.serpGap && candidate.serpGap.length > 15) score += 15;
  score += Math.min(15, candidate.peopleAlsoAsk.length * 4);
  score += Math.min(12, candidate.sources.length * 3);
  if (candidate.freshnessNote) score += 6;
  const len = candidate.suggestedTitle.length;
  if (len >= 45 && len <= 68) score += 8;
  else if (len > 70) score -= 8;
  return Math.max(0, Math.min(100, score));
}

/**
 * Validate one grounded candidate into a publishable brief (or reject).
 * Checks demand fit, dedup vs corpus + existing briefs, money-page guard.
 */
export async function validateCandidate(
  candidate: DiscoveredCandidate,
  ctx: {
    corpus: BlogSimilarityCorpusRow[];
    existingBriefTitles: Set<string>;
    existingBriefKeywords: Set<string>;
  }
): Promise<BriefValidationResult> {
  const title = candidate.suggestedTitle.trim();
  const keyword = candidate.primaryKeyword.trim().toLowerCase();

  if (title.length < 30 || title.length > 72) {
    return { ok: false, reason: `title length ${title.length} out of range` };
  }
  if (keyword.length < 8) {
    return { ok: false, reason: "keyword too short" };
  }
  if (/\u2014/.test(title)) {
    return { ok: false, reason: "title contains em dash" };
  }
  if (!SOLAR_OM_SIGNAL.test(`${title} ${keyword}`)) {
    return { ok: false, reason: "not on-topic for utility solar O&M" };
  }
  if (isTooGenericTitle(title, keyword)) {
    return { ok: false, reason: "title too generic / off-keyword" };
  }
  if (isTierAMoneyPageKeyword(keyword)) {
    return { ok: false, reason: "Tier-A money-page keyword (blogs link, not own)" };
  }
  if (isCompetitorPrimaryKeyword(keyword)) {
    return { ok: false, reason: "competitor-led keyword" };
  }

  const titleKey = title.toLowerCase().trim();
  if (ctx.existingBriefTitles.has(titleKey)) {
    return { ok: false, reason: "duplicate of existing brief title" };
  }
  if (ctx.existingBriefKeywords.has(keyword)) {
    return { ok: false, reason: "keyword already has a pending brief" };
  }

  const slug = createSlug(title);
  const titleConflict = await findTitleConflict(title, slug);
  if (titleConflict) {
    return { ok: false, reason: `already published: ${titleConflict.slug}` };
  }
  const corpusConflict = findKeywordCorpusConflict(keyword, ctx.corpus);
  if (corpusConflict) {
    return { ok: false, reason: `keyword corpus conflict: ${corpusConflict.slug}` };
  }

  const score = scoreCandidate(candidate);
  if (score < 55) {
    return { ok: false, reason: `quality score ${score} below threshold` };
  }

  const brief: DiscoveredBrief = {
    id: `brief-${candidate.domainId}-${slug}`.slice(0, 110),
    title,
    primaryKeyword: keyword,
    intentFamily: candidate.intentFamily,
    angleId: INTENT_ANGLE[candidate.intentFamily] ?? "default-guide",
    domainId: candidate.domainId,
    query: candidate.query,
    serpGap: candidate.serpGap,
    peopleAlsoAsk: candidate.peopleAlsoAsk,
    freshnessNote: candidate.freshnessNote,
    sources: candidate.sources,
    score,
    discoveredAt: new Date().toISOString(),
  };

  ctx.existingBriefTitles.add(titleKey);
  ctx.existingBriefKeywords.add(keyword);
  return { ok: true, brief };
}
