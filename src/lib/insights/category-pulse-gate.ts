import "server-only";

/** Minimum GSC volume before Category Pulse is published publicly. */
export const CATEGORY_PULSE_MIN_IMPRESSIONS = (() => {
  const raw = process.env.CATEGORY_PULSE_MIN_IMPRESSIONS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 500;
  return Number.isFinite(n) && n >= 0 ? n : 500;
})();

export const CATEGORY_PULSE_MIN_QUERIES = (() => {
  const raw = process.env.CATEGORY_PULSE_MIN_QUERIES?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 8;
  return Number.isFinite(n) && n >= 0 ? n : 8;
})();

export type CategoryPulseGateResult =
  | { publish: true }
  | {
      publish: false;
      reason: string;
      actual: {
        totalImpressions: number;
        categoryQueriesTracked: number;
      };
      thresholds: {
        minImpressions: number;
        minQueries: number;
      };
    };

export function evaluateCategoryPulseGate(summary: {
  totalImpressions: number;
  categoryQueriesTracked: number;
}): CategoryPulseGateResult {
  const thresholds = {
    minImpressions: CATEGORY_PULSE_MIN_IMPRESSIONS,
    minQueries: CATEGORY_PULSE_MIN_QUERIES,
  };

  if (
    summary.totalImpressions < thresholds.minImpressions ||
    summary.categoryQueriesTracked < thresholds.minQueries
  ) {
    return {
      publish: false,
      reason:
        "Insufficient Google Search Console category data, pulse withheld until rankings mature.",
      actual: {
        totalImpressions: summary.totalImpressions,
        categoryQueriesTracked: summary.categoryQueriesTracked,
      },
      thresholds,
    };
  }

  return { publish: true };
}
