import "server-only";

import {
  buildSeoKeywordBrief,
  findSeoKeywordRow,
  inferSearchIntent,
  loadSeoKeywordRows,
} from "@/lib/seo/keyword-stats";
import {
  buildSyntheticMetaDescription,
  getAngleContractMeta,
} from "@/lib/seo/blog-angle-contracts";
import type { EditorialContract } from "@/lib/seo/coverage-ledger";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import {
  briefSlotKey,
  getBriefById,
  listFilledBriefIds,
  listRejectedBriefIds,
  type DiscoveredBrief,
} from "@/lib/seo/discovered-brief-queue";
import { loadTodayCalendarRow } from "@/lib/seo/editorial-calendar";

function seoBriefForBrief(keyword: string) {
  const rows = loadSeoKeywordRows();
  const row = findSeoKeywordRow(keyword);
  if (row) return buildSeoKeywordBrief(row, rows);
  return {
    primary: keyword,
    volumeBucket: 45,
    competition: "MEDIUM",
    competitionIndex: 35,
    searchIntent: inferSearchIntent(keyword),
    related: [],
  };
}

export function buildEditorialContractFromBrief(
  brief: DiscoveredBrief
): EditorialContract {
  const angleMeta = getAngleContractMeta(brief.angleId);
  const seoBrief = seoBriefForBrief(brief.primaryKeyword);

  return {
    slotKey: briefSlotKey(brief.id),
    keyword: brief.primaryKeyword,
    angleId: brief.angleId,
    angleLabel: brief.domainId.replace(/_/g, " "),
    seedTitle: brief.title,
    audience: "om_lead",
    plantContext: "utility_india",
    seoBrief,
    ...angleMeta,
    syntheticMetaDescription: buildSyntheticMetaDescription(
      brief.primaryKeyword,
      angleMeta
    ),
    forbiddenArchetypes: [],
    forbiddenH2Themes: [],
  };
}

/**
 * Reuse discovery-time Google Search grounding as the writer's SERP brief,
 * so we don't spend another grounding call per blog.
 */
export function buildSerpBriefFromBrief(brief: DiscoveredBrief): SerpResearchBrief {
  return {
    keyword: brief.primaryKeyword,
    angle: brief.domainId.replace(/_/g, " "),
    searchQuery: brief.query,
    rankingTitles: [],
    commonH2Themes: [],
    peopleAlsoAsk: brief.peopleAlsoAsk,
    serpGaps: brief.serpGap ? [brief.serpGap] : [],
    freshnessNotes: brief.freshnessNote ? [brief.freshnessNote] : [],
    candidateTitles: [brief.title],
    webSearchQueries: [],
    sources: brief.sources,
    model: "discovery-grounding",
    apiKeySuffix: "disc",
    rawJson: "{}",
  };
}

export function isBriefOpen(briefId: string): boolean {
  return !listFilledBriefIds().has(briefId) && !listRejectedBriefIds().has(briefId);
}

/** Today's calendar primary or backup brief when still open. */
export function pickCalendarBrief(input: {
  useCalendarBackup?: boolean;
  rejectedSlotKeys?: string[];
}): DiscoveredBrief | null {
  const row = loadTodayCalendarRow();
  if (!row?.primaryBriefId) return null;

  const briefId = input.useCalendarBackup ? row.backupBriefId : row.primaryBriefId;
  if (!briefId) return null;

  const rejected = new Set(input.rejectedSlotKeys ?? []);
  if (rejected.has(briefSlotKey(briefId))) return null;
  if (!isBriefOpen(briefId)) return null;

  return getBriefById(briefId);
}
