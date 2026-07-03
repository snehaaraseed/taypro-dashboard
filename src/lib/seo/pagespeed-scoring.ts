import type {
  PagespeedFixCluster,
  PagespeedOpportunity,
  PagespeedPageRow,
  PagespeedTemplateGroup,
} from "@/lib/seo/pagespeed-types";

export type GscTrafficByPath = Map<string, { impressions: number; clicks: number }>;

export function normalizePathForGsc(pathname: string): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return p.replace(/\/$/, "") || "/";
}

export function buildGscTrafficIndex(
  rows: { page: string; impressions: number; clicks: number }[]
): GscTrafficByPath {
  const index: GscTrafficByPath = new Map();

  for (const row of rows) {
    try {
      const pathname = normalizePathForGsc(new URL(row.page).pathname);
      const existing = index.get(pathname) ?? { impressions: 0, clicks: 0 };
      index.set(pathname, {
        impressions: existing.impressions + row.impressions,
        clicks: existing.clicks + row.clicks,
      });
    } catch {
      // skip malformed GSC URLs
    }
  }

  return index;
}

export function computeImpactScore(input: {
  mobileScore: number | null;
  lcpMs: number | null;
  gscImpressions: number;
  gscClicks: number;
  topOpportunities: PagespeedOpportunity[];
}): number {
  const score = input.mobileScore ?? 0;
  const trafficWeight =
    Math.log1p(input.gscImpressions) * 2 + Math.log1p(input.gscClicks) * 5;
  const performanceGap = Math.max(0, 100 - score);
  const lcpPenalty =
    input.lcpMs != null && input.lcpMs > 2500
      ? (input.lcpMs - 2500) / 100
      : 0;
  const opportunityMs = input.topOpportunities
    .slice(0, 3)
    .reduce((sum, o) => sum + o.savingsMs, 0);

  return (
    Math.round(
      (trafficWeight * (performanceGap + lcpPenalty) + opportunityMs * 0.05) *
        100
    ) / 100
  );
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function buildFixClusters(
  pages: Array<{
    url: string;
    topOpportunities: PagespeedOpportunity[];
  }>
): PagespeedFixCluster[] {
  const byAudit = new Map<
    string,
    { title: string; pagesAffected: number; totalSavingsMs: number; sampleUrl: string }
  >();

  for (const page of pages) {
    for (const opp of page.topOpportunities) {
      if (opp.savingsMs <= 50) continue;
      const existing = byAudit.get(opp.id);
      if (existing) {
        existing.pagesAffected += 1;
        existing.totalSavingsMs += opp.savingsMs;
      } else {
        byAudit.set(opp.id, {
          title: opp.title,
          pagesAffected: 1,
          totalSavingsMs: opp.savingsMs,
          sampleUrl: page.url,
        });
      }
    }
  }

  return [...byAudit.entries()]
    .map(([auditId, row]) => ({
      auditId,
      title: row.title,
      pagesAffected: row.pagesAffected,
      totalSavingsMs: Math.round(row.totalSavingsMs),
      sampleUrl: row.sampleUrl,
    }))
    .sort(
      (a, b) =>
        b.pagesAffected * b.totalSavingsMs - a.pagesAffected * a.totalSavingsMs
    );
}

export function buildTemplateGroups(pages: PagespeedPageRow[]): PagespeedTemplateGroup[] {
  const byTemplate = new Map<string, PagespeedPageRow[]>();

  for (const page of pages) {
    if (page.mobileScore == null) continue;
    const list = byTemplate.get(page.template) ?? [];
    list.push(page);
    byTemplate.set(page.template, list);
  }

  return [...byTemplate.entries()]
    .map(([template, rows]) => {
      const scores = rows.map((r) => r.mobileScore!).filter((s) => s >= 0);
      const worst = [...rows].sort(
        (a, b) => (a.mobileScore ?? 101) - (b.mobileScore ?? 101)
      )[0];
      return {
        template,
        pageCount: rows.length,
        medianScore: median(scores),
        worstUrl: worst?.url ?? "",
        worstScore: worst?.mobileScore ?? 0,
      };
    })
    .sort((a, b) => a.medianScore - b.medianScore);
}

export function applyPreviousScores(
  pages: PagespeedPageRow[],
  previous: PagespeedPageRow[] | undefined
): void {
  if (!previous?.length) return;
  const byUrl = new Map(previous.map((p) => [p.url, p.mobileScore]));

  for (const page of pages) {
    const prev = byUrl.get(page.url);
    if (prev == null || page.mobileScore == null) continue;
    page.previousMobileScore = prev;
    page.scoreDelta = page.mobileScore - prev;
  }
}

export function buildPriorityQueue(
  pages: PagespeedPageRow[],
  limit = 50
): PagespeedPageRow[] {
  return [...pages]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, limit);
}
