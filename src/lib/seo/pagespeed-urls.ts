import { ACTIVE_LOCALES } from "@/i18n/markets";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import type { PagespeedAuditScope } from "@/lib/seo/pagespeed-types";

const LOCALE_PREFIXES = ACTIVE_LOCALES.filter((l) => l !== "en");

export function classifyTemplate(pathname: string): string {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/") return "home";

  const parts = p.split("/").filter(Boolean);
  if (parts.length === 0) return "home";

  if (parts[0] === "blog") {
    if (parts.length === 1) return "blog-list";
    if (parts[1] === "author") return "blog-author";
    return "blog-post";
  }
  if (parts[0] === "projects") {
    return parts.length > 1 ? "project" : "projects-list";
  }
  if (parts[0] === "insights") {
    return parts.length > 1 ? "insight" : "insights-list";
  }
  if (parts[0] === "press") {
    return parts.length > 1 ? "press-release" : "press-list";
  }
  if (parts[0] === "careers") {
    return parts.length > 1 ? "career-detail" : "careers-list";
  }
  if (parts[0] === "solar-panel-cleaning-system") {
    return parts.length > 1 ? "product-page" : "product-hub";
  }
  if (parts[0] === "compare") return "compare-page";
  if (parts[0] === "technology") return "technology-page";
  if (parts.length === 1) return parts[0];
  return `${parts[0]}-detail`;
}

export function pathnameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname || "/";
  } catch {
    return "/";
  }
}

function hasLocalePrefix(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  return LOCALE_PREFIXES.includes(parts[0] as (typeof LOCALE_PREFIXES)[number]);
}

function isPaginationUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.has("page");
  } catch {
    return false;
  }
}

export function filterAuditUrls(
  urls: string[],
  scope: PagespeedAuditScope
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of urls) {
    const url = raw.trim();
    if (!url) continue;
    if (isPaginationUrl(url)) continue;

    const pathname = pathnameFromUrl(url);
    if (scope === "english" && hasLocalePrefix(pathname)) continue;

    const normalized = url.replace(/\/$/, "") || SITE_URL;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(url);
  }

  return result.sort();
}

export async function fetchSitemapUrls(
  sitemapUrl = `${SITE_URL}/sitemap.xml`
): Promise<string[]> {
  const response = await fetch(sitemapUrl, {
    headers: { "User-Agent": "TayproPageSpeedAudit/1.0" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap (${response.status}): ${sitemapUrl}`);
  }

  const xml = await response.text();
  const urls: string[] = [];
  const locRe = /<loc>([^<]+)<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locRe.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

export function envAuditScope(): PagespeedAuditScope {
  const raw = process.env.PAGESPEED_AUDIT_SCOPE?.trim().toLowerCase();
  return raw === "full" ? "full" : "english";
}

export function envMaxUrls(): number | null {
  const raw = process.env.PAGESPEED_MAX_URLS?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
