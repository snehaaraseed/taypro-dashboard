import "server-only";

import fs from "node:fs";
import path from "node:path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import {
  fetchSearchAnalyticsPages,
  inspectGscUrl,
  type GscUrlInspectionResult,
} from "@/lib/gsc/search-console-client";
import { getGscSiteUrl } from "@/lib/gsc/google-service-account";
import { isGscConfigured } from "@/lib/gsc/gsc-auth";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";
import { normalizePath } from "@/lib/url-recovery/normalize";

export type GscNotFoundPageRow = {
  pathname: string;
  source: "runtime_404_hits" | "gsc_analytics_probe" | "gsc_inspection";
  impressions: number;
  clicks: number;
  runtimeHits: number;
  pageFetchState?: string;
  indexingState?: string;
  verdict?: string;
};

export type GscNotFoundSyncResult = {
  updatedAt: string;
  siteUrl: string;
  lookbackDays: number;
  pagesChecked: number;
  inspectionsRun: number;
  notFoundCount: number;
  outputPath: string;
  pages: GscNotFoundPageRow[];
};

function resolveNotFoundPagesPath(): string {
  const envPath = process.env.GSC_NOT_FOUND_PAGES_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "gsc-not-found-pages.json");
}

function resolve404HitsPath(): string {
  return path.join(getDeploymentRoot(), "data", "404-hits.json");
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse GSC full URL → site pathname (no locale stripping for probe URL). */
export function parseGscPageToPathname(pageUrl: string): string | null {
  try {
    const url = new URL(pageUrl);
    const host = url.hostname.replace(/^www\./, "");
    const siteHost = new URL(SITE_URL).hostname.replace(/^www\./, "");
    if (host !== siteHost) return null;
    return pathnameWithoutLocale(normalizePath(url.pathname));
  } catch {
    return null;
  }
}

function isNotFoundInspection(result: GscUrlInspectionResult): boolean {
  const fetchState = result.pageFetchState.toUpperCase();
  const verdict = result.verdict.toUpperCase();
  return (
    fetchState === "NOT_FOUND" ||
    fetchState === "SOFT_404" ||
    verdict.includes("NOT_FOUND") ||
    verdict.includes("SOFT_404")
  );
}

function readRuntime404Paths(): Map<string, number> {
  const map = new Map<string, number>();
  try {
    const raw = JSON.parse(
      fs.readFileSync(resolve404HitsPath(), "utf8")
    ) as { hits?: Record<string, { path: string; count: number }> };
    for (const hit of Object.values(raw.hits ?? {})) {
      map.set(normalizePath(hit.path), hit.count);
    }
  } catch {
    // no runtime log yet
  }
  return map;
}

async function probePathReturns404(pathname: string): Promise<boolean> {
  const base = process.env.GSC_PROBE_BASE_URL?.trim() || SITE_URL;
  const url = `${base.replace(/\/$/, "")}${pathname}`;

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    return response.status === 404;
  } catch {
    return false;
  }
}

function mergeRow(
  map: Map<string, GscNotFoundPageRow>,
  row: GscNotFoundPageRow
): void {
  const existing = map.get(row.pathname);
  if (!existing) {
    map.set(row.pathname, row);
    return;
  }

  map.set(row.pathname, {
    ...existing,
    impressions: Math.max(existing.impressions, row.impressions),
    clicks: Math.max(existing.clicks, row.clicks),
    runtimeHits: Math.max(existing.runtimeHits, row.runtimeHits),
    source:
      existing.source === row.source
        ? existing.source
        : row.source === "gsc_inspection"
          ? "gsc_inspection"
          : existing.source === "runtime_404_hits"
            ? "runtime_404_hits"
            : row.source,
    pageFetchState: row.pageFetchState ?? existing.pageFetchState,
    indexingState: row.indexingState ?? existing.indexingState,
    verdict: row.verdict ?? existing.verdict,
  });
}

/**
 * Weekly GSC feed: pages with search impressions that return 404, plus runtime 404 hits
 * confirmed via URL Inspection when quota allows.
 */
export async function syncGscNotFoundPages(): Promise<GscNotFoundSyncResult> {
  if (!isGscConfigured()) {
    throw new Error("GSC API not configured");
  }

  const lookbackDays = envInt("GSC_LOOKBACK_DAYS", 28);
  const maxProbes = envInt("GSC_NOT_FOUND_MAX_PROBES", 120);
  const maxInspections = envInt("GSC_NOT_FOUND_MAX_INSPECTIONS", 40);
  const probeDelayMs = envInt("GSC_NOT_FOUND_PROBE_DELAY_MS", 80);

  const analyticsPages = await fetchSearchAnalyticsPages({ lookbackDays });
  const runtimeHits = readRuntime404Paths();
  const merged = new Map<string, GscNotFoundPageRow>();

  for (const [pathname, count] of runtimeHits) {
    mergeRow(merged, {
      pathname,
      source: "runtime_404_hits",
      impressions: 0,
      clicks: 0,
      runtimeHits: count,
    });
  }

  const probeCandidates: Array<{
    pathname: string;
    impressions: number;
    clicks: number;
  }> = [];

  for (const row of analyticsPages) {
    const pathname = parseGscPageToPathname(row.page);
    if (!pathname || pathname === "/") continue;
    probeCandidates.push({
      pathname,
      impressions: row.impressions,
      clicks: row.clicks,
    });
  }

  probeCandidates.sort((a, b) => b.impressions - a.impressions);

  let pagesChecked = 0;
  for (const candidate of probeCandidates.slice(0, maxProbes)) {
    pagesChecked += 1;
    const is404 = await probePathReturns404(candidate.pathname);
    if (is404) {
      mergeRow(merged, {
        pathname: candidate.pathname,
        source: "gsc_analytics_probe",
        impressions: candidate.impressions,
        clicks: candidate.clicks,
        runtimeHits: runtimeHits.get(candidate.pathname) ?? 0,
      });
    }
    if (probeDelayMs > 0) await sleep(probeDelayMs);
  }

  const inspectionTargets = [...merged.keys()].slice(0, maxInspections);
  let inspectionsRun = 0;

  for (const pathname of inspectionTargets) {
    const inspectionUrl = `${SITE_URL.replace(/\/$/, "")}${pathname}`;
    const inspection = await inspectGscUrl(inspectionUrl);
    inspectionsRun += 1;
    if (!inspection) continue;

    if (isNotFoundInspection(inspection)) {
      const analytics = probeCandidates.find((c) => c.pathname === pathname);
      mergeRow(merged, {
        pathname,
        source: "gsc_inspection",
        impressions: analytics?.impressions ?? 0,
        clicks: analytics?.clicks ?? 0,
        runtimeHits: runtimeHits.get(pathname) ?? 0,
        pageFetchState: inspection.pageFetchState,
        indexingState: inspection.indexingState,
        verdict: inspection.verdict,
      });
    }

    await sleep(250);
  }

  const pages = [...merged.values()].sort(
    (a, b) =>
      b.impressions +
      b.runtimeHits * 5 -
      (a.impressions + a.runtimeHits * 5)
  );

  const updatedAt = new Date().toISOString();
  const outputPath = resolveNotFoundPagesPath();
  const siteUrl = getGscSiteUrl();

  const payload = {
    description:
      "GSC + runtime 404 signals for redirect-candidate merge (npm run seo:merge-404-candidates).",
    updatedAt,
    siteUrl,
    lookbackDays,
    summary: {
      analyticsPagesFetched: analyticsPages.length,
      pagesChecked,
      inspectionsRun,
      notFoundCount: pages.length,
    },
    pages,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  return {
    updatedAt,
    siteUrl,
    lookbackDays,
    pagesChecked,
    inspectionsRun,
    notFoundCount: pages.length,
    outputPath,
    pages,
  };
}
