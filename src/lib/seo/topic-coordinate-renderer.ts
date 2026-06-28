import "server-only";

import {
  getSemanticDomain,
  type TopicContextDimensions,
  type TopicCoordinate,
} from "@/lib/seo/semantic-topic-coordinates";

const GEO_LABELS: Record<string, string> = {
  rajasthan: "Rajasthan",
  gujarat: "Gujarat",
  karnataka: "Karnataka",
  maharashtra: "Maharashtra",
  tamil_nadu: "Tamil Nadu",
  pan_india: "India",
  north_india: "North India",
  west_india: "West India",
};

/** Tier A primary keywords blogs must not own (link only). */
const TIER_A_PRIMARY_BLOCKLIST = [
  "solar panel cleaning robot",
  "solar panel cleaning system",
  "solar panel cleaning",
  "solar cleaning system",
  "automatic solar panel cleaning system",
  "solar panel cleaning service",
  "solar cleaning service",
];

export function isTierAMoneyPageKeyword(keyword: string): boolean {
  const k = keyword.toLowerCase().trim();
  return TIER_A_PRIMARY_BLOCKLIST.some(
    (blocked) => k === blocked || k.startsWith(`${blocked} `)
  );
}

export function renderPrimaryKeyword(
  coordinate: TopicCoordinate,
  domainLabel: string
): string {
  const geo = coordinate.context.geo
    ? GEO_LABELS[coordinate.context.geo] ?? coordinate.context.geo
    : "India";
  const scale = coordinate.context.scale?.replace(/_/g, " ") ?? "utility scale";
  return `${domainLabel.toLowerCase()} ${scale} ${geo}`.replace(/\s+/g, " ").trim();
}

export function renderTitleFromTemplate(
  template: string,
  keyword: string,
  context: TopicContextDimensions
): string {
  const geo = context.geo
    ? GEO_LABELS[context.geo] ?? context.geo
    : "India";
  return template
    .replace(/\{keyword\}/gi, keyword)
    .replace(/\{geo\}/gi, geo)
    .replace(/\s+/g, " ")
    .trim();
}

export function renderCoordinateTopic(coordinate: TopicCoordinate): {
  keyword: string;
  title: string;
  angleId: string;
} | null {
  const domain = getSemanticDomain(coordinate.domainId);
  if (!domain) return null;
  const sub = domain.subAngles.find((s) => s.id === coordinate.subAngleId);
  if (!sub) return null;
  if (!domain.allowedIntents.includes(coordinate.intentFamily)) return null;

  const keyword = renderPrimaryKeyword(coordinate, domain.label);
  if (isTierAMoneyPageKeyword(keyword)) return null;

  const title = renderTitleFromTemplate(
    sub.titleTemplate,
    keyword,
    coordinate.context
  );
  return { keyword, title, angleId: sub.angleId };
}
