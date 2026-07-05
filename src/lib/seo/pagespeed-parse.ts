import type { ParsedPsiResult, PagespeedOpportunity } from "@/lib/seo/pagespeed-types";

type Audit = {
  id?: string;
  title?: string;
  displayValue?: string;
  score?: number | null;
  numericValue?: number;
  metricSavings?: {
    LCP?: number;
    FCP?: number;
    TBT?: number;
  };
  details?: {
    type?: string;
    overallSavingsMs?: number;
    items?: Array<{ wastedMs?: number }>;
  };
};

type PsiPayload = {
  error?: { message?: string };
  lighthouseResult?: {
    categories?: {
      performance?: { score?: number | null };
    };
    audits?: Record<string, Audit>;
  };
  loadingExperience?: {
    overall_category?: string;
  };
};

function auditDisplay(audits: Record<string, Audit> | undefined, id: string): string {
  return audits?.[id]?.displayValue?.trim() || "-";
}

function auditNumericMs(audits: Record<string, Audit> | undefined, id: string): number | null {
  const value = audits?.[id]?.numericValue;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function opportunitySavingsMs(audit: Audit): number {
  // Passed audits (e.g. "server response time was short") are not fixes.
  if (audit.score === 1) return 0;

  const fromDetails = audit.details?.overallSavingsMs;
  if (typeof fromDetails === "number" && fromDetails > 0) return fromDetails;

  const metric = audit.metricSavings;
  if (metric) {
    const ms = Math.max(metric.LCP ?? 0, metric.FCP ?? 0, metric.TBT ?? 0);
    if (ms > 0) return ms;
  }

  const items = audit.details?.items;
  if (Array.isArray(items)) {
    const tableMs = items.reduce(
      (sum, item) => sum + (item.wastedMs ?? 0),
      0
    );
    if (tableMs > 0) return tableMs;
  }

  return 0;
}

function extractOpportunities(audits: Record<string, Audit> | undefined): PagespeedOpportunity[] {
  if (!audits) return [];

  const opportunities: PagespeedOpportunity[] = [];
  for (const [id, audit] of Object.entries(audits)) {
    const savingsMs = opportunitySavingsMs(audit);
    if (savingsMs <= 0) continue;
    opportunities.push({
      id,
      title: audit.title?.trim() || id,
      savingsMs,
    });
  }

  return opportunities.sort((a, b) => b.savingsMs - a.savingsMs);
}

export function parsePsiResponse(payload: unknown): ParsedPsiResult {
  const data = payload as PsiPayload;

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const lr = data.lighthouseResult;
  const audits = lr?.audits;
  const scoreRaw = lr?.categories?.performance?.score;
  const mobileScore =
    typeof scoreRaw === "number" && Number.isFinite(scoreRaw)
      ? Math.round(scoreRaw * 100)
      : null;

  return {
    mobileScore,
    lcp: auditDisplay(audits, "largest-contentful-paint"),
    lcpMs: auditNumericMs(audits, "largest-contentful-paint"),
    cls: auditDisplay(audits, "cumulative-layout-shift"),
    tbt: auditDisplay(audits, "total-blocking-time"),
    speedIndex: auditDisplay(audits, "speed-index"),
    cruxCategory: data.loadingExperience?.overall_category,
    opportunities: extractOpportunities(audits),
    raw: payload,
  };
}
