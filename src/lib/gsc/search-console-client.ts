import "server-only";

import { getGscSiteUrl } from "./google-service-account";
import { getSearchConsoleAccessToken } from "./gsc-auth";

export type GscSearchAnalyticsRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type ApiRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/**
 * Query-level performance from Search Console (last N days, UTC dates).
 * @see https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 */
export async function fetchSearchAnalyticsQueries(options?: {
  lookbackDays?: number;
  rowLimit?: number;
}): Promise<GscSearchAnalyticsRow[]> {
  const lookbackDays = options?.lookbackDays ?? 28;
  const rowLimit = options?.rowLimit ?? 500;
  const siteUrl = getGscSiteUrl();
  const { token: accessToken } = await getSearchConsoleAccessToken();

  const endDate = daysAgo(3);
  const startDate = daysAgo(lookbackDays + 3);

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["query"],
      rowLimit,
      dataState: "final",
    }),
  });

  const payload = (await response.json()) as {
    rows?: ApiRow[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      `Search Console API error (${response.status}): ${payload.error?.message || response.statusText}`
    );
  }

  return (payload.rows ?? [])
    .map((row) => ({
      query: (row.keys?.[0] ?? "").trim().toLowerCase(),
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
    .filter((r) => r.query.length > 0);
}

export type GscPageQueryRow = {
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/**
 * Page + query rows for blog URLs (closed-loop metadata fallback).
 */
export async function fetchSearchAnalyticsPageQueries(options?: {
  lookbackDays?: number;
  rowLimit?: number;
}): Promise<GscPageQueryRow[]> {
  const lookbackDays = options?.lookbackDays ?? 28;
  const rowLimit = options?.rowLimit ?? 2500;
  const siteUrl = getGscSiteUrl();
  const { token: accessToken } = await getSearchConsoleAccessToken();

  const endDate = daysAgo(3);
  const startDate = daysAgo(lookbackDays + 3);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["page", "query"],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: "page",
              operator: "contains",
              expression: "/blog/",
            },
          ],
        },
      ],
      rowLimit,
      dataState: "final",
    }),
  });

  const payload = (await response.json()) as {
    rows?: ApiRow[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      `Search Console page query API error (${response.status}): ${payload.error?.message || response.statusText}`
    );
  }

  return (payload.rows ?? [])
    .map((row) => ({
      page: (row.keys?.[0] ?? "").trim(),
      query: (row.keys?.[1] ?? "").trim().toLowerCase(),
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
    .filter((r) => r.page.length > 0 && r.query.length > 0);
}

export type GscSearchAnalyticsPageRow = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/**
 * Page-level performance from Search Console (for 404 discovery + merge script).
 */
export async function fetchSearchAnalyticsPages(options?: {
  lookbackDays?: number;
  rowLimit?: number;
}): Promise<GscSearchAnalyticsPageRow[]> {
  const lookbackDays = options?.lookbackDays ?? 28;
  const rowLimit = options?.rowLimit ?? 2500;
  const siteUrl = getGscSiteUrl();
  const { token: accessToken } = await getSearchConsoleAccessToken();

  const endDate = daysAgo(3);
  const startDate = daysAgo(lookbackDays + 3);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["page"],
      rowLimit,
      dataState: "final",
    }),
  });

  const payload = (await response.json()) as {
    rows?: ApiRow[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      `Search Console page API error (${response.status}): ${payload.error?.message || response.statusText}`
    );
  }

  return (payload.rows ?? [])
    .map((row) => ({
      page: (row.keys?.[0] ?? "").trim(),
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
    .filter((r) => r.page.length > 0);
}

export type GscUrlInspectionResult = {
  inspectionUrl: string;
  pageFetchState: string;
  indexingState: string;
  verdict: string;
};

/**
 * URL Inspection API — confirms Not found / soft 404 in Google's index.
 * @see https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
 */
export async function inspectGscUrl(
  inspectionUrl: string
): Promise<GscUrlInspectionResult | null> {
  const siteUrl = getGscSiteUrl();
  const { token: accessToken } = await getSearchConsoleAccessToken();

  const response = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl,
        siteUrl,
        languageCode: "en-US",
      }),
    }
  );

  const payload = (await response.json()) as {
    inspectionResult?: {
      indexStatusResult?: {
        pageFetchState?: string;
        indexingState?: string;
        verdict?: string;
      };
    };
    error?: { message?: string };
  };

  if (!response.ok) {
    console.warn(
      `[gsc] URL inspection failed (${response.status}): ${payload.error?.message || response.statusText}`
    );
    return null;
  }

  const index = payload.inspectionResult?.indexStatusResult;
  if (!index) return null;

  return {
    inspectionUrl,
    pageFetchState: index.pageFetchState ?? "UNKNOWN",
    indexingState: index.indexingState ?? "UNKNOWN",
    verdict: index.verdict ?? "UNKNOWN",
  };
}
