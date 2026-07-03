import { routing } from "@/i18n/routing";
import type { TayproLocale } from "@/i18n/markets";
import {
  localizedUrl,
  normalizeInternalPath,
  stripLocalePrefix,
} from "@/lib/seo/locale-alternates";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const CF_API = "https://api.cloudflare.com/client/v4";
const PURGE_BATCH_SIZE = 30;

let cachedZoneId: string | null | undefined;

function getToken(): string | undefined {
  return (
    process.env.Cloudflare_API_Token ||
    process.env.CLOUDFLARE_API_TOKEN ||
    process.env.CF_API_TOKEN
  );
}

function getZoneName(): string {
  return process.env.CF_ZONE_NAME || "taypro.in";
}

async function cfApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) {
    throw new Error("Missing Cloudflare API token");
  }
  const res = await fetch(`${CF_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = (await res.json()) as {
    success: boolean;
    result?: T;
    errors?: unknown;
  };
  if (!data.success) {
    throw new Error(JSON.stringify(data.errors ?? data));
  }
  return data as T;
}

async function resolveZoneId(): Promise<string | null> {
  if (cachedZoneId !== undefined) return cachedZoneId;
  if (!getToken()) {
    cachedZoneId = null;
    return null;
  }
  try {
    const data = await cfApi<{ result: { id: string }[] }>(
      `/zones?name=${encodeURIComponent(getZoneName())}`
    );
    cachedZoneId = data.result?.[0]?.id ?? null;
  } catch {
    cachedZoneId = null;
  }
  return cachedZoneId;
}

/** Expand internal paths to public URLs for the given locales (default: all active). */
export function expandPathsToLocalizedUrls(
  paths: string[],
  locales: readonly string[] = routing.locales
): string[] {
  const urls = new Set<string>();
  for (const raw of paths) {
    const internal = stripLocalePrefix(normalizeInternalPath(raw));
    for (const locale of locales) {
      urls.add(localizedUrl(internal, locale));
    }
  }
  return [...urls];
}

/** Purge specific public URLs from Cloudflare edge cache. */
export async function purgeCloudflareUrls(urls: string[]): Promise<boolean> {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return true;

  const zoneId = await resolveZoneId();
  if (!zoneId) {
    console.warn(
      `[cloudflare-purge] Skipped: no API token or zone not found for ${getZoneName()}`
    );
    return false;
  }

  try {
    for (let i = 0; i < unique.length; i += PURGE_BATCH_SIZE) {
      const batch = unique.slice(i, i + PURGE_BATCH_SIZE);
      await cfApi(`/zones/${zoneId}/purge_cache`, {
        method: "POST",
        body: JSON.stringify({ files: batch }),
      });
    }
    return true;
  } catch (err) {
    console.error("[cloudflare-purge] Failed:", err);
    return false;
  }
}

/** Purge locale variants of internal marketing paths at Cloudflare edge. */
export async function purgeCloudflarePaths(
  paths: string[],
  locales?: readonly TayproLocale[]
): Promise<boolean> {
  const localeList = locales?.length ? locales : routing.locales;
  return purgeCloudflareUrls(expandPathsToLocalizedUrls(paths, localeList));
}

/** Purge entire zone — use after full code deploy when static pages may have changed. */
export async function purgeCloudflareEverything(): Promise<boolean> {
  const zoneId = await resolveZoneId();
  if (!zoneId) {
    console.warn(
      `[cloudflare-purge] Skipped full purge: no API token or zone for ${getZoneName()}`
    );
    return false;
  }
  try {
    await cfApi(`/zones/${zoneId}/purge_cache`, {
      method: "POST",
      body: JSON.stringify({ purge_everything: true }),
    });
    return true;
  } catch (err) {
    console.error("[cloudflare-purge] Full purge failed:", err);
    return false;
  }
}

export async function purgeCloudflareSitemap(): Promise<boolean> {
  return purgeCloudflareUrls([`${SITE_URL}/sitemap.xml`]);
}
