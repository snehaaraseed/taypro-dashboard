import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import type { PagespeedPageRow } from "@/lib/seo/pagespeed-types";

export type PagespeedAlertReason =
  | "low_score"
  | "score_regression"
  | "slow_lcp"
  | "high_impact";

export type PagespeedAlertSeverity = "critical" | "warning";

export type PagespeedAlert = {
  id: string;
  url: string;
  pathname: string;
  template: string;
  reason: PagespeedAlertReason;
  severity: PagespeedAlertSeverity;
  mobileScore: number | null;
  previousMobileScore?: number;
  scoreDelta?: number;
  lcpMs: number | null;
  gscImpressions: number;
  gscClicks: number;
  impactScore: number;
  topOpportunity?: string;
  createdAt: string;
};

export type PagespeedAlertsSnapshot = {
  runId: string;
  updatedAt: string;
  alerts: PagespeedAlert[];
  newAlertCount: number;
  resolvedCount: number;
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function envFloat(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function pagespeedAlertThresholds() {
  return {
    minImpressions: envInt("PAGESPEED_ALERT_MIN_IMPRESSIONS", 50),
    minClicks: envInt("PAGESPEED_ALERT_MIN_CLICKS", 5),
    minImpactScore: envFloat("PAGESPEED_ALERT_MIN_IMPACT", 15),
    lowScore: envInt("PAGESPEED_ALERT_LOW_SCORE", 70),
    criticalScore: envInt("PAGESPEED_ALERT_CRITICAL_SCORE", 50),
    lcpMs: envInt("PAGESPEED_ALERT_LCP_MS", 2500),
    regressionDelta: envInt("PAGESPEED_ALERT_REGRESSION_DELTA", -5),
  };
}

function alertId(page: PagespeedPageRow, reason: PagespeedAlertReason): string {
  return `${page.pathname}|${reason}`;
}

function isHighTraffic(
  page: PagespeedPageRow,
  thresholds: ReturnType<typeof pagespeedAlertThresholds>
): boolean {
  return (
    page.gscImpressions >= thresholds.minImpressions ||
    page.gscClicks >= thresholds.minClicks
  );
}

export function evaluatePagespeedAlert(
  page: PagespeedPageRow,
  thresholds = pagespeedAlertThresholds()
): PagespeedAlert | null {
  if (page.mobileScore == null && page.error) {
    return null;
  }

  const highTraffic = isHighTraffic(page, thresholds);
  const score = page.mobileScore ?? 0;

  if (
    highTraffic &&
    page.mobileScore != null &&
    score < thresholds.criticalScore
  ) {
    return buildAlert(page, "low_score", "critical");
  }

  if (
    page.scoreDelta != null &&
    page.scoreDelta <= thresholds.regressionDelta &&
    highTraffic
  ) {
    return buildAlert(
      page,
      "score_regression",
      page.scoreDelta <= thresholds.regressionDelta * 2 ? "critical" : "warning"
    );
  }

  if (
    page.lcpMs != null &&
    page.lcpMs > thresholds.lcpMs &&
    page.impactScore >= thresholds.minImpactScore
  ) {
    return buildAlert(
      page,
      "slow_lcp",
      page.lcpMs > thresholds.lcpMs * 1.6 ? "critical" : "warning"
    );
  }

  if (
    page.mobileScore != null &&
    score < thresholds.lowScore &&
    page.impactScore >= thresholds.minImpactScore
  ) {
    return buildAlert(page, "low_score", "warning");
  }

  if (
    page.impactScore >= thresholds.minImpactScore * 3 &&
    page.mobileScore != null &&
    score < 80
  ) {
    return buildAlert(page, "high_impact", "warning");
  }

  return null;
}

function buildAlert(
  page: PagespeedPageRow,
  reason: PagespeedAlertReason,
  severity: PagespeedAlertSeverity
): PagespeedAlert {
  return {
    id: alertId(page, reason),
    url: page.url,
    pathname: page.pathname,
    template: page.template,
    reason,
    severity,
    mobileScore: page.mobileScore,
    previousMobileScore: page.previousMobileScore,
    scoreDelta: page.scoreDelta,
    lcpMs: page.lcpMs,
    gscImpressions: page.gscImpressions,
    gscClicks: page.gscClicks,
    impactScore: page.impactScore,
    topOpportunity: page.topOpportunities[0]?.title,
    createdAt: new Date().toISOString(),
  };
}

export function buildPagespeedAlerts(
  pages: PagespeedPageRow[],
  runId: string,
  previousAlerts: PagespeedAlert[] = []
): PagespeedAlertsSnapshot {
  const thresholds = pagespeedAlertThresholds();
  const byId = new Map<string, PagespeedAlert>();

  for (const page of pages) {
    const alert = evaluatePagespeedAlert(page, thresholds);
    if (alert) {
      byId.set(alert.id, alert);
    }
  }

  const alerts = [...byId.values()].sort(
    (a, b) => b.impactScore - a.impactScore
  );
  const previousIds = new Set(previousAlerts.map((a) => a.id));
  const currentIds = new Set(alerts.map((a) => a.id));

  return {
    runId,
    updatedAt: new Date().toISOString(),
    alerts,
    newAlertCount: alerts.filter((a) => !previousIds.has(a.id)).length,
    resolvedCount: previousAlerts.filter((a) => !currentIds.has(a.id)).length,
  };
}

export function resolvePagespeedAlertsPath(): string {
  const envPath = process.env.PAGESPEED_ALERTS_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "pagespeed-alerts.json");
}

export function readPagespeedAlerts(): PagespeedAlertsSnapshot | null {
  const filePath = resolvePagespeedAlertsPath();
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as PagespeedAlertsSnapshot;
  } catch {
    return null;
  }
}

export function writePagespeedAlerts(snapshot: PagespeedAlertsSnapshot): string {
  const filePath = resolvePagespeedAlertsPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return filePath;
}

export function syncPagespeedAlerts(
  pages: PagespeedPageRow[],
  runId: string
): PagespeedAlertsSnapshot {
  const previous = readPagespeedAlerts();
  const snapshot = buildPagespeedAlerts(pages, runId, previous?.alerts ?? []);
  writePagespeedAlerts(snapshot);
  return snapshot;
}
