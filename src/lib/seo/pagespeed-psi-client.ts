import type { PagespeedStrategy } from "@/lib/seo/pagespeed-types";
import { parsePsiResponse } from "@/lib/seo/pagespeed-parse";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function resolveApiKey(): string {
  const key =
    process.env.PAGESPEED_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "PAGESPEED_API_KEY (or GOOGLE_API_KEY) is not set in environment"
    );
  }
  return key;
}

function envRateLimitMs(): number {
  const raw = process.env.PAGESPEED_RATE_LIMIT_MS?.trim();
  if (!raw) return 1200;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 1200;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPageSpeedInsights(
  url: string,
  strategy: PagespeedStrategy = "mobile"
): Promise<ReturnType<typeof parsePsiResponse>> {
  const apiKey = resolveApiKey();
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
    key: apiKey,
  });

  const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  const payload = (await response.json()) as {
    error?: { message?: string };
    lighthouseResult?: unknown;
    loadingExperience?: unknown;
  };

  if (!response.ok) {
    const message =
      payload.error?.message ||
      `PageSpeed API error (${response.status}) for ${url}`;
    throw new Error(message);
  }

  return parsePsiResponse(payload);
}

let lastCallAt = 0;

export async function fetchPageSpeedInsightsRateLimited(
  url: string,
  strategy: PagespeedStrategy = "mobile"
): Promise<ReturnType<typeof parsePsiResponse>> {
  const limitMs = envRateLimitMs();
  const now = Date.now();
  const waitMs = Math.max(0, lastCallAt + limitMs - now);
  if (waitMs > 0) await sleep(waitMs);

  const result = await fetchPageSpeedInsights(url, strategy);
  lastCallAt = Date.now();
  return result;
}

export function isPagespeedConfigured(): boolean {
  return Boolean(
    process.env.PAGESPEED_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()
  );
}
