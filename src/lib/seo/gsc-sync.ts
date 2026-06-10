import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import {
  fetchSearchAnalyticsPageQueries,
  fetchSearchAnalyticsQueries,
} from "@/lib/gsc/search-console-client";
import { syncGscNotFoundPages } from "@/lib/gsc/gsc-not-found-sync";
import { getGscSiteUrl } from "@/lib/gsc/google-service-account";
import { getGscAuthMethod, isGscConfigured } from "@/lib/gsc/gsc-auth";
import { invalidateGscBoostCache } from "@/lib/seo/gsc-keyword-boost";
import {
  invalidateGscBlogQueriesCache,
  writeGscBlogQueriesFile,
} from "@/lib/seo/gsc-blog-queries";
import {
  invalidateKeywordCampaignCache,
  refreshKeywordCampaignsFromGsc,
} from "@/lib/seo/keyword-campaign";
import { passesSeoKeywordFilters } from "@/lib/seo/keyword-filters";

/** Branded queries are not blog targets. */
const GSC_QUERY_EXCLUDE = /taypro$|^taypro /i;

export type GscOpportunity = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  score: number;
  reason: "striking_distance" | "low_ctr" | "high_impressions";
};

export type GscSyncResult = {
  ok: true;
  updatedAt: string;
  siteUrl: string;
  lookbackDays: number;
  rowsFetched: number;
  keywords: string[];
  opportunities: GscOpportunity[];
  boostPath: string;
  reportPath: string;
  blogQueriesPath?: string;
  notFoundPagesPath?: string;
  notFoundPagesCount?: number;
  authMethod: string;
};

function resolveBoostPath(): string {
  const envPath = process.env.SEO_GSC_BOOST_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-gsc-boost.json");
}

function resolveReportPath(): string {
  const envPath = process.env.GSC_LATEST_REPORT_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "gsc-latest-report.json");
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function scoreQuery(row: {
  impressions: number;
  ctr: number;
  position: number;
}): { score: number; reason: GscOpportunity["reason"] } {
  const imp = row.impressions;
  const pos = row.position;
  const ctr = row.ctr;

  if (pos >= 8 && pos <= 25 && imp >= 10) {
    return { score: imp * 4 + (25 - pos), reason: "striking_distance" };
  }
  if (imp >= 20 && ctr < 0.03) {
    return { score: imp * (0.05 - Math.min(ctr, 0.05)) * 100, reason: "low_ctr" };
  }
  return { score: imp * 0.5, reason: "high_impressions" };
}

function pickOpportunities(
  rows: Awaited<ReturnType<typeof fetchSearchAnalyticsQueries>>
): GscOpportunity[] {
  const minImpressions = envInt("GSC_MIN_IMPRESSIONS", 15);
  const maxKeywords = envInt("GSC_BOOST_MAX_KEYWORDS", 15);

  const scored: GscOpportunity[] = [];

  for (const row of rows) {
    if (row.impressions < minImpressions) continue;
    if (!passesSeoKeywordFilters(row.query)) continue;
    if (GSC_QUERY_EXCLUDE.test(row.query)) continue;

    const { score, reason } = scoreQuery(row);
    if (score <= 0) continue;

    scored.push({
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      score,
      reason,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxKeywords);
}

/**
 * Weekly closed-loop: pull GSC queries → update seo-gsc-boost.json + gsc-latest-report.json.
 */
export async function syncGscBoostFromSearchConsole(): Promise<GscSyncResult> {
  if (!isGscConfigured()) {
    throw new Error(
      "GSC API not configured. Connect Google Search Console in /admin/gsc (OAuth) or set GSC_SERVICE_ACCOUNT_PATH."
    );
  }

  const lookbackDays = envInt("GSC_LOOKBACK_DAYS", 28);
  const rows = await fetchSearchAnalyticsQueries({ lookbackDays });
  const pageQueryRows = await fetchSearchAnalyticsPageQueries({ lookbackDays });
  const opportunities = pickOpportunities(rows);
  const keywords = opportunities.map((o) => o.query);
  const updatedAt = new Date().toISOString();
  const siteUrl = getGscSiteUrl();
  const boostPath = resolveBoostPath();
  const reportPath = resolveReportPath();

  const boostPayload = {
    description:
      "Auto-updated from Google Search Console (weekly sync). Blog automation prefers these after the editorial queue.",
    updatedAt,
    siteUrl,
    lookbackDays,
    keywords,
    opportunities,
  };

  const reportPayload = {
    updatedAt,
    siteUrl,
    lookbackDays,
    summary: {
      rowsFetched: rows.length,
      opportunitiesSelected: opportunities.length,
    },
    topOpportunities: opportunities,
    topQueriesByImpressions: [...rows]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 30),
  };

  fs.mkdirSync(path.dirname(boostPath), { recursive: true });
  fs.writeFileSync(boostPath, `${JSON.stringify(boostPayload, null, 2)}\n`, "utf8");
  fs.writeFileSync(reportPath, `${JSON.stringify(reportPayload, null, 2)}\n`, "utf8");
  const blogQueriesPath = writeGscBlogQueriesFile({
    siteUrl,
    lookbackDays,
    rows: pageQueryRows,
  });

  invalidateGscBoostCache();
  invalidateGscBlogQueriesCache();
  refreshKeywordCampaignsFromGsc(opportunities);
  invalidateKeywordCampaignCache();

  let notFoundPagesPath: string | undefined;
  let notFoundPagesCount: number | undefined;
  try {
    const notFoundSync = await syncGscNotFoundPages();
    notFoundPagesPath = notFoundSync.outputPath;
    notFoundPagesCount = notFoundSync.notFoundCount;
  } catch (error) {
    console.warn(
      "[gsc] Not-found page sync skipped:",
      error instanceof Error ? error.message : error
    );
  }

  return {
    ok: true,
    updatedAt,
    siteUrl,
    lookbackDays,
    rowsFetched: rows.length,
    keywords,
    opportunities,
    boostPath,
    reportPath,
    blogQueriesPath,
    notFoundPagesPath,
    notFoundPagesCount,
    authMethod: getGscAuthMethod(),
  };
}

/** Short block for Gemini editorial prompts (no API call). */
export function loadGscEditorialHint(): string {
  const reportPath = resolveReportPath();
  if (!fs.existsSync(reportPath)) return "";

  try {
    const raw = JSON.parse(fs.readFileSync(reportPath, "utf8")) as {
      updatedAt?: string;
      topOpportunities?: GscOpportunity[];
    };
    const ops = raw.topOpportunities ?? [];
    if (ops.length === 0) return "";

    const lines = ops.slice(0, 6).map((o) => {
      const ctrPct = (o.ctr * 100).toFixed(1);
      return `  - "${o.query}" (pos ${o.position.toFixed(1)}, ${o.impressions} imp, ${ctrPct}% CTR, ${o.reason})`;
    });

    return `GSC LIVE DATA (synced ${raw.updatedAt?.slice(0, 10) ?? "recently"}; prioritize fresh content for these queries):
${lines.join("\n")}`;
  } catch {
    return "";
  }
}
