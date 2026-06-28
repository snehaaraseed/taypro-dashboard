import "server-only";

import {
  buildSeoKeywordBrief,
  findSeoKeywordRow,
  inferSearchIntent,
  loadSeoKeywordRows,
  type SeoKeywordBrief,
} from "@/lib/seo/keyword-stats";
import {
  buildSyntheticMetaDescription,
  getAngleContractMeta,
} from "@/lib/seo/blog-angle-contracts";
import type { EditorialContract } from "@/lib/seo/coverage-ledger";
import { buildCoordinateKey } from "@/lib/seo/semantic-topic-coordinates";
import type { TopicCoordinate } from "@/lib/seo/semantic-topic-coordinates";
import { getSemanticDomain } from "@/lib/seo/semantic-topic-coordinates";
import {
  buildSemanticSlotKey,
  defaultContextForDomain,
  enumerateOpenTopicCoordinates,
} from "@/lib/seo/semantic-coordinate-enumeration";
import {
  renderCoordinateTopic,
} from "@/lib/seo/topic-coordinate-renderer";
import { listFilledCoordinateKeys } from "@/lib/seo/semantic-intent-registry";

function buildSeoBriefForSemanticKeyword(keyword: string): SeoKeywordBrief {
  const rows = loadSeoKeywordRows();
  const row = findSeoKeywordRow(keyword);
  if (row) return buildSeoKeywordBrief(row, rows);
  return {
    primary: keyword,
    volumeBucket: 40,
    competition: "MEDIUM",
    competitionIndex: 40,
    searchIntent: inferSearchIntent(keyword),
    related: [],
  };
}

/** Build a cron-safe editorial contract from a semantic coordinate. */
export function buildEditorialContractFromCoordinate(
  coordinate: TopicCoordinate
): EditorialContract | null {
  const rendered = renderCoordinateTopic(coordinate);
  if (!rendered) return null;

  const domain = getSemanticDomain(coordinate.domainId);
  const sub = domain?.subAngles.find((s) => s.id === coordinate.subAngleId);
  const angleMeta = getAngleContractMeta(rendered.angleId);
  const seoBrief = buildSeoBriefForSemanticKeyword(rendered.keyword);

  return {
    slotKey: buildSemanticSlotKey(coordinate),
    keyword: rendered.keyword,
    angleId: rendered.angleId,
    angleLabel: (sub?.id ?? rendered.angleId).replace(/_/g, " "),
    seedTitle: rendered.title,
    audience: coordinate.context.buyerRole ?? "om_lead",
    plantContext: coordinate.context.scale ?? "utility_india",
    seoBrief, ...angleMeta,
    syntheticMetaDescription: buildSyntheticMetaDescription(
      rendered.keyword,
      angleMeta
    ),
    forbiddenArchetypes: [],
    forbiddenH2Themes: [],
  };
}

export function isSemanticCoordinateOpen(coordinate: TopicCoordinate): boolean {
  return !listFilledCoordinateKeys().has(buildCoordinateKey(coordinate));
}

/** @deprecated Calendar uses curated topics, see pickCalendarCuratedTopic. */
export function pickCalendarCoordinateForAttempt(_input: {
  useCalendarBackup?: boolean;
  rejectedSlotKeys?: string[];
}): TopicCoordinate | null {
  return null;
}

/** Next open coordinate after calendar (catalog-wide scan). */
export function pickNextOpenSemanticCoordinate(input?: {
  rejectedSlotKeys?: string[];
  limit?: number;
}): TopicCoordinate | null {
  const rejected = new Set(input?.rejectedSlotKeys ?? []);

  for (const coordinate of enumerateOpenTopicCoordinates({
    limit: input?.limit ?? 5000,
    interleaveDomains: true,
  })) {
    const slotKey = buildSemanticSlotKey(coordinate);
    if (rejected.has(slotKey)) continue;
    return coordinate;
  }
  return null;
}

export function normalizeCalendarCoordinate(
  coordinate: TopicCoordinate
): TopicCoordinate {
  const ctx = coordinate.context;
  if (Object.keys(ctx).length > 0) return coordinate;
  return {
    ...coordinate,
    context: defaultContextForDomain(coordinate.domainId),
  };
}
