import { calculateFleetEsgImpact } from "@/lib/esg/calculate-fleet-esg-impact";
import { buildTayproPublicProofStats } from "@/lib/marketing/public-proof-stats";

/** Compact marketing display (e.g. 875M+, 0.9 Bn+, 93k+, 188 GWh+). */
export function formatCompactImpactValue(value: number, unit?: string): string {
  const suffix = unit ? ` ${unit}` : "";
  if (value >= 1_000_000_000) {
    const bn = value / 1_000_000_000;
    const rounded =
      bn >= 10 ? Math.round(bn) : Math.round(bn * 10) / 10;
    const text = Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1);
    return `${text} Bn+${suffix}`;
  }
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M+${suffix}`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k+${suffix}`;
  }
  return `${Math.round(value)}+${suffix}`;
}

export function formatGwhValue(gwh: number): string {
  const rounded = Math.round(gwh);
  return `${rounded} GWh+`;
}

export interface TayproMarketingImpactStat {
  value: string;
  label: string;
}

/**
 * Hero / sustainability stats derived from {@link calculateFleetEsgImpact}.
 * Update assumptions in fleet-impact-assumptions.ts, values here recompute.
 */
export function buildTayproMarketingImpactStats() {
  const impact = calculateFleetEsgImpact();
  const publicProof = buildTayproPublicProofStats();

  return {
    ...publicProof,
    /** Raw ESG model output for methodology footnotes, not default stat tiles. */
    _raw: impact,
    _esgComputed: {
      waterSavedAnnually: formatCompactImpactValue(impact.waterSavedLitresAnnually),
      extraCleanEnergyAnnually: formatGwhValue(
        impact.additionalGenerationGwhAnnually
      ),
      co2ReducedAnnually: formatCompactImpactValue(
        impact.co2AvoidedMetricTonsAnnually
      ),
    },
  } as const;
}
