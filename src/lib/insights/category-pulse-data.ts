import "server-only";

import {
  fetchSearchAnalyticsPages,
  fetchSearchAnalyticsQueries,
} from "@/lib/gsc/search-console-client";
import { getGscSiteUrl } from "@/lib/gsc/google-service-account";
import { passesSeoKeywordFilters } from "@/lib/seo/keyword-filters";
import {
  loadGscSnapshot,
  previousPeriod,
  type GscSnapshotPayload,
} from "@/lib/insights/gsc-snapshots";

/** Branded queries are not category targets. */
const GSC_QUERY_EXCLUDE = /taypro$|^taypro /i;

export const KEY_LANDING_PATHS = [
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-robot-price-calculator",
  "/solar-panel-cleaning-robot-price-india",
  "/utility-scale-solar-operations",
  "/solar-panel-cleaning-robot-rajasthan",
  "/solar-panel-cleaning-robot-gujarat",
  "/solar-panel-cleaning-robot-maharashtra",
  "/solar-panel-cleaning-robot-karnataka",
] as const;

export type PulseQueryRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clicksDelta: number | null;
  impressionsDelta: number | null;
  positionDelta: number | null;
};

export type PulsePageRow = {
  path: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clicksDelta: number | null;
  impressionsDelta: number | null;
  positionDelta: number | null;
};

export type PulseOpportunity = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  reason: "striking_distance" | "low_ctr" | "high_impressions";
};

export type PulseRecommendedAction = {
  priority: number;
  action: string;
  rationale: string;
};

export type CategoryPulseMetrics = {
  period: string;
  generatedAt: string;
  siteUrl: string;
  lookbackDays: number;
  hasPriorSnapshot: boolean;
  priorPeriod: string | null;
  summary: {
    categoryQueriesTracked: number;
    totalImpressions: number;
    totalClicks: number;
    strikingDistanceCount: number;
    impressionsDelta: number | null;
    clicksDelta: number | null;
  };
  topQueries: PulseQueryRow[];
  keyPages: PulsePageRow[];
  strikingDistance: PulseOpportunity[];
  recommendedActions: PulseRecommendedAction[];
  allowedNumbers: number[];
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalizePagePath(pageUrl: string): string {
  try {
    const url = pageUrl.startsWith("http")
      ? new URL(pageUrl)
      : new URL(pageUrl, "https://taypro.in");
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return pageUrl.split("?")[0]?.replace(/\/$/, "") || pageUrl;
  }
}

function isCategoryQuery(query: string): boolean {
  return passesSeoKeywordFilters(query) && !GSC_QUERY_EXCLUDE.test(query);
}

function scoreStrikingDistance(row: {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}): PulseOpportunity | null {
  const imp = row.impressions;
  const pos = row.position;
  if (pos >= 8 && pos <= 15 && imp >= 10) {
    return {
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      reason: "striking_distance",
    };
  }
  if (imp >= 20 && row.ctr < 0.03) {
    return {
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      reason: "low_ctr",
    };
  }
  if (imp >= 50) {
    return {
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      reason: "high_impressions",
    };
  }
  return null;
}

function delta(
  current: number,
  prior: number | undefined
): number | null {
  if (prior === undefined) return null;
  return current - prior;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function collectAllowedNumbers(metrics: Omit<CategoryPulseMetrics, "allowedNumbers">): number[] {
  const nums = new Set<number>();
  const add = (n: number) => {
    if (!Number.isFinite(n)) return;
    nums.add(n);
    nums.add(round1(n));
    nums.add(round2(n));
    nums.add(Math.round(n));
  };

  add(metrics.lookbackDays);
  add(metrics.summary.categoryQueriesTracked);
  add(metrics.summary.totalImpressions);
  add(metrics.summary.totalClicks);
  add(metrics.summary.strikingDistanceCount);
  if (metrics.summary.impressionsDelta != null) add(metrics.summary.impressionsDelta);
  if (metrics.summary.clicksDelta != null) add(metrics.summary.clicksDelta);

  for (const q of metrics.topQueries) {
    add(q.clicks);
    add(q.impressions);
    add(q.position);
    add(q.ctr * 100);
    if (q.clicksDelta != null) add(q.clicksDelta);
    if (q.impressionsDelta != null) add(q.impressionsDelta);
    if (q.positionDelta != null) add(q.positionDelta);
  }
  for (const p of metrics.keyPages) {
    add(p.clicks);
    add(p.impressions);
    add(p.position);
    add(p.ctr * 100);
    if (p.clicksDelta != null) add(p.clicksDelta);
    if (p.impressionsDelta != null) add(p.impressionsDelta);
    if (p.positionDelta != null) add(p.positionDelta);
  }
  for (const o of metrics.strikingDistance) {
    add(o.clicks);
    add(o.impressions);
    add(o.position);
    add(o.ctr * 100);
  }

  return [...nums];
}

function buildRecommendedActions(
  striking: PulseOpportunity[],
  pages: PulsePageRow[],
  queries: PulseQueryRow[]
): PulseRecommendedAction[] {
  const actions: PulseRecommendedAction[] = [];

  for (const opp of striking.slice(0, 3)) {
    actions.push({
      priority: actions.length + 1,
      action: `Create or refresh content targeting "${opp.query}"`,
      rationale: `Position ${round1(opp.position)} with ${opp.impressions} impressions, within striking distance for page-one gains.`,
    });
  }

  const lowCtrPage = pages.find((p) => p.impressions >= 20 && p.ctr < 0.03);
  if (lowCtrPage) {
    actions.push({
      priority: actions.length + 1,
      action: `Review title and meta description for ${lowCtrPage.path}`,
      rationale: `${lowCtrPage.impressions} impressions at ${(lowCtrPage.ctr * 100).toFixed(1)}% CTR: snippet may underperform intent.`,
    });
  }

  const falling = queries.find(
    (q) => q.positionDelta != null && q.positionDelta > 1.5 && q.impressions >= 15
  );
  if (falling) {
    actions.push({
      priority: actions.length + 1,
      action: `Add internal links to pages ranking for "${falling.query}"`,
      rationale: `Average position worsened by ${round1(falling.positionDelta!)} vs prior snapshot.`,
    });
  }

  if (actions.length === 0) {
    actions.push({
      priority: 1,
      action: "Continue weekly GSC sync and monitor striking-distance queries",
      rationale: "No urgent anomalies detected in this period's category data.",
    });
  }

  return actions.slice(0, 5);
}

export function buildMetricsFromSnapshot(input: {
  period: string;
  lookbackDays: number;
  siteUrl: string;
  queryRows: Awaited<ReturnType<typeof fetchSearchAnalyticsQueries>>;
  pageRows: Awaited<ReturnType<typeof fetchSearchAnalyticsPages>>;
  priorSnapshot: GscSnapshotPayload | null;
}): CategoryPulseMetrics {
  const priorQueryMap = new Map(
    (input.priorSnapshot?.queries ?? []).map((r) => [r.query, r])
  );
  const priorPageMap = new Map(
    (input.priorSnapshot?.pages ?? []).map((r) => [
      normalizePagePath(r.page),
      r,
    ])
  );

  const categoryQueries = input.queryRows
    .filter((r) => isCategoryQuery(r.query))
    .sort((a, b) => b.impressions - a.impressions);

  const topQueries: PulseQueryRow[] = categoryQueries.slice(0, 15).map((row) => {
    const prior = priorQueryMap.get(row.query);
    return {
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      clicksDelta: delta(row.clicks, prior?.clicks),
      impressionsDelta: delta(row.impressions, prior?.impressions),
      positionDelta:
        prior != null ? round1(row.position - prior.position) : null,
    };
  });

  const keyPages: PulsePageRow[] = KEY_LANDING_PATHS.map((path) => {
    const match = input.pageRows.find(
      (r) => normalizePagePath(r.page) === path
    );
    const prior = priorPageMap.get(path);
    if (!match) {
      return {
        path,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        clicksDelta: prior ? -prior.clicks : null,
        impressionsDelta: prior ? -prior.impressions : null,
        positionDelta: null,
      };
    }
    return {
      path,
      clicks: match.clicks,
      impressions: match.impressions,
      ctr: match.ctr,
      position: match.position,
      clicksDelta: delta(match.clicks, prior?.clicks),
      impressionsDelta: delta(match.impressions, prior?.impressions),
      positionDelta:
        prior != null ? round1(match.position - prior.position) : null,
    };
  }).filter((p) => p.impressions > 0 || p.clicksDelta !== null);

  const strikingDistance = categoryQueries
    .map((row) => scoreStrikingDistance(row))
    .filter((r): r is PulseOpportunity => r != null)
    .slice(0, 10);

  const totalImpressions = categoryQueries.reduce(
    (sum, r) => sum + r.impressions,
    0
  );
  const totalClicks = categoryQueries.reduce((sum, r) => sum + r.clicks, 0);

  let priorTotalImpressions: number | undefined;
  let priorTotalClicks: number | undefined;
  if (input.priorSnapshot) {
    const priorCategory = input.priorSnapshot.queries.filter((r) =>
      isCategoryQuery(r.query)
    );
    priorTotalImpressions = priorCategory.reduce(
      (sum, r) => sum + r.impressions,
      0
    );
    priorTotalClicks = priorCategory.reduce((sum, r) => sum + r.clicks, 0);
  }

  const partial: Omit<CategoryPulseMetrics, "allowedNumbers"> = {
    period: input.period,
    generatedAt: new Date().toISOString(),
    siteUrl: input.siteUrl,
    lookbackDays: input.lookbackDays,
    hasPriorSnapshot: input.priorSnapshot != null,
    priorPeriod: input.priorSnapshot?.period ?? null,
    summary: {
      categoryQueriesTracked: categoryQueries.length,
      totalImpressions,
      totalClicks,
      strikingDistanceCount: strikingDistance.filter(
        (s) => s.reason === "striking_distance"
      ).length,
      impressionsDelta: delta(totalImpressions, priorTotalImpressions),
      clicksDelta: delta(totalClicks, priorTotalClicks),
    },
    topQueries,
    keyPages,
    strikingDistance,
    recommendedActions: buildRecommendedActions(
      strikingDistance,
      keyPages,
      topQueries
    ),
  };

  return {
    ...partial,
    allowedNumbers: collectAllowedNumbers(partial),
  };
}

export async function assembleCategoryPulseMetrics(
  period: string
): Promise<{ metrics: CategoryPulseMetrics; snapshot: GscSnapshotPayload }> {
  const lookbackDays = envInt("GSC_LOOKBACK_DAYS", 28);
  const siteUrl = getGscSiteUrl();
  const priorPeriod = previousPeriod(period);
  const priorSnapshot = loadGscSnapshot(priorPeriod);

  const [queryRows, pageRows] = await Promise.all([
    fetchSearchAnalyticsQueries({ lookbackDays }),
    fetchSearchAnalyticsPages({ lookbackDays }),
  ]);

  const categoryQueryRows = queryRows
    .filter((r) => isCategoryQuery(r.query))
    .map((r) => ({
      query: r.query,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

  const snapshot: GscSnapshotPayload = {
    period,
    capturedAt: new Date().toISOString(),
    lookbackDays,
    siteUrl,
    queries: categoryQueryRows,
    pages: pageRows.map((r) => ({
      page: normalizePagePath(r.page),
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
  };

  const metrics = buildMetricsFromSnapshot({
    period,
    lookbackDays,
    siteUrl,
    queryRows,
    pageRows,
    priorSnapshot,
  });

  return { metrics, snapshot };
}
