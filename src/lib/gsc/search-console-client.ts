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
