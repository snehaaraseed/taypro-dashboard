import "server-only";

import fs from "fs";
import path from "path";
import { isGscConfigured } from "@/lib/gsc/gsc-auth";
import { fetchSearchAnalyticsPages } from "@/lib/gsc/search-console-client";
import {
  pruneOldRuns,
  readPagespeedSummary,
  resolvePagespeedLockPath,
  resolvePagespeedPagesDir,
  resolvePagespeedStatusPath,
  resolvePagespeedSummaryPath,
  urlToReportFilename,
} from "@/lib/seo/pagespeed-paths";
import { fetchPageSpeedInsightsRateLimited } from "@/lib/seo/pagespeed-psi-client";
import { syncPagespeedAlerts } from "@/lib/seo/pagespeed-alerts";
import {
  applyPreviousScores,
  buildFixClusters,
  buildGscTrafficIndex,
  buildPriorityQueue,
  buildTemplateGroups,
  computeImpactScore,
  normalizePathForGsc,
} from "@/lib/seo/pagespeed-scoring";
import type {
  PagespeedAuditResult,
  PagespeedAuditStatus,
  PagespeedAuditSummary,
  PagespeedPageRow,
  PagespeedStrategy,
} from "@/lib/seo/pagespeed-types";
import {
  classifyTemplate,
  envAuditMode,
  envAuditScope,
  envMaxUrls,
  fetchSitemapUrls,
  filterAuditUrls,
  pathnameFromUrl,
  pickRepresentativeAuditUrls,
} from "@/lib/seo/pagespeed-urls";

function currentRunId(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function readStatus(): { inProgress: boolean; startedAt?: string; runId?: string } {
  const statusPath = resolvePagespeedStatusPath();
  if (!fs.existsSync(statusPath)) return { inProgress: false };
  try {
    return JSON.parse(fs.readFileSync(statusPath, "utf8")) as {
      inProgress: boolean;
      startedAt?: string;
      runId?: string;
    };
  } catch {
    return { inProgress: false };
  }
}

function writeStatus(status: {
  inProgress: boolean;
  startedAt?: string;
  runId?: string;
  completedAt?: string;
  error?: string;
}): void {
  writeJson(resolvePagespeedStatusPath(), status);
}

export function acquirePagespeedLock(): boolean {
  const lockPath = resolvePagespeedLockPath();
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  try {
    const fd = fs.openSync(lockPath, "wx");
    fs.writeFileSync(
      fd,
      JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })
    );
    fs.closeSync(fd);
    return true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EEXIST") return false;
    throw err;
  }
}

export function releasePagespeedLock(): void {
  const lockPath = resolvePagespeedLockPath();
  try {
    fs.unlinkSync(lockPath);
  } catch {
    // ignore
  }
}

export function getPagespeedAuditStatus(): PagespeedAuditStatus {
  const summary = readPagespeedSummary();
  const status = readStatus();
  return {
    configured: Boolean(
      process.env.PAGESPEED_API_KEY?.trim() ||
        process.env.Page_speed_insights_api_key?.trim() ||
        process.env.GOOGLE_API_KEY?.trim()
    ),
    inProgress: status.inProgress,
    lastRunAt: summary?.updatedAt ?? null,
    lastRunId: summary?.runId ?? null,
    urlCount: summary?.scope.urlCount ?? null,
    summaryPath: resolvePagespeedSummaryPath(),
  };
}

export type RunPagespeedAuditOptions = {
  strategy?: PagespeedStrategy;
  skipLock?: boolean;
  onProgress?: (done: number, total: number, url: string) => void;
};

export async function runPagespeedAudit(
  options: RunPagespeedAuditOptions = {}
): Promise<PagespeedAuditResult> {
  const strategy = options.strategy ?? "mobile";
  const auditScope = envAuditScope();
  const runId = currentRunId();
  const startedAt = Date.now();

  if (!options.skipLock && !acquirePagespeedLock()) {
    throw new Error("PageSpeed audit already in progress");
  }

  writeStatus({ inProgress: true, startedAt: new Date().toISOString(), runId });

  try {
    const sitemapUrls = await fetchSitemapUrls();
    let urls = filterAuditUrls(sitemapUrls, auditScope);
    if (envAuditMode() === "representative") {
      urls = pickRepresentativeAuditUrls(urls);
    }
    const maxUrls = envMaxUrls();
    if (maxUrls != null) urls = urls.slice(0, maxUrls);

    let gscTraffic = new Map<string, { impressions: number; clicks: number }>();
    if (isGscConfigured()) {
      try {
        const gscRows = await fetchSearchAnalyticsPages({ lookbackDays: 28 });
        gscTraffic = buildGscTrafficIndex(gscRows);
      } catch (err) {
        console.warn("[pagespeed] GSC page traffic unavailable:", err);
      }
    }

    const previousSummary = readPagespeedSummary();
    const pagesDir = resolvePagespeedPagesDir(runId);
    fs.mkdirSync(pagesDir, { recursive: true });

    const pages: PagespeedPageRow[] = [];
    let failed = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      options.onProgress?.(i + 1, urls.length, url);

      const pathname = pathnameFromUrl(url);
      const template = classifyTemplate(pathname);
      const traffic = gscTraffic.get(normalizePathForGsc(pathname)) ?? {
        impressions: 0,
        clicks: 0,
      };

      try {
        const parsed = await fetchPageSpeedInsightsRateLimited(url, strategy);
        const reportFile = urlToReportFilename(url);
        writeJson(path.join(pagesDir, reportFile), parsed.raw);

        const topOpportunities = parsed.opportunities.slice(0, 5);
        const row: PagespeedPageRow = {
          url,
          pathname,
          template,
          mobileScore: parsed.mobileScore,
          lcp: parsed.lcp,
          lcpMs: parsed.lcpMs,
          cls: parsed.cls,
          tbt: parsed.tbt,
          speedIndex: parsed.speedIndex,
          cruxCategory: parsed.cruxCategory,
          gscImpressions: traffic.impressions,
          gscClicks: traffic.clicks,
          impactScore: computeImpactScore({
            mobileScore: parsed.mobileScore,
            lcpMs: parsed.lcpMs,
            gscImpressions: traffic.impressions,
            gscClicks: traffic.clicks,
            topOpportunities,
          }),
          topOpportunities,
          reportFile,
        };
        pages.push(row);
      } catch (err) {
        failed += 1;
        const message = err instanceof Error ? err.message : "PSI failed";
        console.warn(`[pagespeed] ${url}: ${message}`);
        pages.push({
          url,
          pathname,
          template,
          mobileScore: null,
          lcp: "-",
          lcpMs: null,
          cls: "-",
          tbt: "-",
          speedIndex: "-",
          gscImpressions: traffic.impressions,
          gscClicks: traffic.clicks,
          impactScore: computeImpactScore({
            mobileScore: 0,
            lcpMs: null,
            gscImpressions: traffic.impressions,
            gscClicks: traffic.clicks,
            topOpportunities: [],
          }),
          topOpportunities: [],
          error: message,
        });
      }
    }

    applyPreviousScores(pages, previousSummary?.allPages);

    const scoredPages = pages.filter((p) => p.mobileScore != null);
    const scores = scoredPages.map((p) => p.mobileScore!);
    const siteMedianScore =
      scores.length > 0
        ? scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]
        : 0;

    const summary: PagespeedAuditSummary = {
      runId,
      updatedAt: new Date().toISOString(),
      scope: {
        strategy,
        auditScope,
        urlCount: urls.length,
      },
      previousRunId:
        previousSummary?.runId !== runId
          ? previousSummary?.runId
          : previousSummary?.previousRunId,
      siteMedianScore,
      scoreDelta:
        previousSummary?.siteMedianScore != null
          ? siteMedianScore - previousSummary.siteMedianScore
          : undefined,
      pagesBelow50: scoredPages.filter((p) => (p.mobileScore ?? 100) < 50).length,
      pagesBelow70: scoredPages.filter((p) => (p.mobileScore ?? 100) < 70).length,
      priorityQueue: buildPriorityQueue(pages),
      fixClusters: buildFixClusters(pages),
      templateGroups: buildTemplateGroups(pages),
      allPages: pages,
    };

    const summaryPath = resolvePagespeedSummaryPath();
    writeJson(summaryPath, summary);
    const alerts = syncPagespeedAlerts(pages, runId);
    if (alerts.alerts.length > 0) {
      console.warn(
        `[pagespeed] ${alerts.alerts.length} performance alert(s) (${alerts.newAlertCount} new, ${alerts.resolvedCount} resolved)`
      );
    }
    pruneOldRuns(3);

    writeStatus({
      inProgress: false,
      completedAt: new Date().toISOString(),
      runId,
    });

    return {
      ok: true,
      summary,
      summaryPath,
      pagesAudited: pages.length - failed,
      pagesFailed: failed,
      durationMs: Date.now() - startedAt,
    };
  } catch (err) {
    writeStatus({
      inProgress: false,
      error: err instanceof Error ? err.message : "Audit failed",
    });
    throw err;
  } finally {
    if (!options.skipLock) releasePagespeedLock();
  }
}
