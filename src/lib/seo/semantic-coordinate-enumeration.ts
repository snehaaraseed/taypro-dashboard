import "server-only";

import { getPermanentRejectedSlotKeys } from "@/lib/seo/editorial-state";
import { listFilledCoordinateKeys } from "@/lib/seo/semantic-intent-registry";
import {
  buildCoordinateKey,
  hashTopicContext,
  listSemanticDomains,
  type SemanticDomain,
  type TopicContextDimensions,
  type TopicCoordinate,
} from "@/lib/seo/semantic-topic-coordinates";
import {
  isTierAMoneyPageKeyword,
  renderCoordinateTopic,
} from "@/lib/seo/topic-coordinate-renderer";

const DEFAULT_CONTEXT_DIMENSIONS: Required<
  Record<keyof TopicContextDimensions, string[]>
> = {
  geo: ["pan_india"],
  scale: ["50_100mw"],
  plantType: ["fixed_tilt"],
  season: ["pre_monsoon"],
  buyerRole: ["asset_owner"],
};

/** Domain-specific default when catalog omits contextDimensions. */
export function defaultContextForDomain(domainId: string): TopicContextDimensions {
  if (domainId.includes("state") || domainId.includes("dust")) {
    return { geo: "rajasthan", scale: "50_100mw", plantType: "fixed_tilt" };
  }
  if (domainId === "rooftop_ci") {
    return { geo: "pan_india", scale: "distributed", plantType: "rooftop" };
  }
  return { geo: "pan_india", scale: "50_100mw", plantType: "fixed_tilt" };
}

/** Cartesian product of catalog contextDimensions (or defaults). */
export function listContextVariantsForDomain(
  domain: SemanticDomain
): TopicContextDimensions[] {
  const cd = domain.contextDimensions ?? {};
  const geos = cd.geo?.length ? cd.geo : DEFAULT_CONTEXT_DIMENSIONS.geo;
  const scales = cd.scale?.length ? cd.scale : DEFAULT_CONTEXT_DIMENSIONS.scale;
  const plantTypes = cd.plantType?.length
    ? cd.plantType
    : DEFAULT_CONTEXT_DIMENSIONS.plantType;
  const seasons = cd.season?.length ? cd.season : DEFAULT_CONTEXT_DIMENSIONS.season;
  const buyerRoles = cd.buyerRole?.length
    ? cd.buyerRole
    : DEFAULT_CONTEXT_DIMENSIONS.buyerRole;

  const out: TopicContextDimensions[] = [];
  for (const geo of geos) {
    for (const scale of scales) {
      for (const plantType of plantTypes) {
        for (const season of seasons) {
          for (const buyerRole of buyerRoles) {
            out.push({ geo, scale, plantType, season, buyerRole });
          }
        }
      }
    }
  }
  return out;
}

export function buildSemanticSlotKey(coordinate: TopicCoordinate): string {
  const ctx = hashTopicContext(coordinate.context);
  return `semantic::${coordinate.domainId}::${coordinate.subAngleId}::${ctx}`;
}

export type EnumerateTopicCoordinatesOptions = {
  limit?: number;
  skipFilled?: boolean;
  skipRejected?: boolean;
  /** Interleave domains so calendar pick does not exhaust one domain first. */
  interleaveDomains?: boolean;
};

function pushCoordinate(
  out: TopicCoordinate[],
  coordinate: TopicCoordinate,
  limit: number
): boolean {
  out.push(coordinate);
  return out.length >= limit;
}

/** All open semantic coordinates (full context grid minus filled/rejected/tier-A). */
export function enumerateOpenTopicCoordinates(
  options?: EnumerateTopicCoordinatesOptions
): TopicCoordinate[] {
  const limit = options?.limit ?? 50_000;
  const filled =
    options?.skipFilled === false
      ? new Set<string>()
      : listFilledCoordinateKeys();
  const rejected =
    options?.skipRejected === false
      ? new Set<string>()
      : getPermanentRejectedSlotKeys();

  const domains = listSemanticDomains();

  if (options?.interleaveDomains) {
    const buckets: TopicCoordinate[][] = domains.map(() => []);
    for (const domain of domains) {
      const domainIdx = domains.indexOf(domain);
      for (const sub of domain.subAngles) {
        if (!domain.allowedIntents.includes(sub.intentFamily)) continue;
        for (const context of listContextVariantsForDomain(domain)) {
          const coordinate: TopicCoordinate = {
            domainId: domain.id,
            intentFamily: sub.intentFamily,
            subAngleId: sub.id,
            context,
          };
          if (filled.has(buildCoordinateKey(coordinate))) continue;
          if (rejected.has(buildSemanticSlotKey(coordinate))) continue;
          const rendered = renderCoordinateTopic(coordinate);
          if (!rendered || isTierAMoneyPageKeyword(rendered.keyword)) continue;
          buckets[domainIdx]!.push(coordinate);
        }
      }
    }
    const out: TopicCoordinate[] = [];
    let added = true;
    while (added && out.length < limit) {
      added = false;
      for (const bucket of buckets) {
        const next = bucket.shift();
        if (next) {
          out.push(next);
          added = true;
          if (out.length >= limit) break;
        }
      }
    }
    return out;
  }

  const out: TopicCoordinate[] = [];
  for (const domain of domains) {
    for (const sub of domain.subAngles) {
      if (!domain.allowedIntents.includes(sub.intentFamily)) continue;
      for (const context of listContextVariantsForDomain(domain)) {
        const coordinate: TopicCoordinate = {
          domainId: domain.id,
          intentFamily: sub.intentFamily,
          subAngleId: sub.id,
          context,
        };
        if (filled.has(buildCoordinateKey(coordinate))) continue;
        if (rejected.has(buildSemanticSlotKey(coordinate))) continue;
        const rendered = renderCoordinateTopic(coordinate);
        if (!rendered || isTierAMoneyPageKeyword(rendered.keyword)) continue;
        if (pushCoordinate(out, coordinate, limit)) return out;
      }
    }
  }
  return out;
}

export function countTheoreticalTopicCoordinates(): {
  totalCombinations: number;
  openNow: number;
  filled: number;
} {
  let total = 0;
  for (const domain of listSemanticDomains()) {
    const contexts = listContextVariantsForDomain(domain).length;
    total += domain.subAngles.filter((s) =>
      domain.allowedIntents.includes(s.intentFamily)
    ).length * contexts;
  }
  const open = enumerateOpenTopicCoordinates({ limit: total + 1 }).length;
  const filled = listFilledCoordinateKeys().size;
  return { totalCombinations: total, openNow: open, filled };
}
