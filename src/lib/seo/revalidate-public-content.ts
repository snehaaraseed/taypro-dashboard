import { revalidatePath } from "next/cache";
import type { TayproLocale } from "@/i18n/markets";
import {
  normalizeInternalPath,
  stripLocalePrefix,
} from "@/lib/seo/locale-alternates";
import { purgeCloudflarePaths } from "@/lib/seo/purge-cloudflare-cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";

/** Index/listing paths — revalidate on Next.js but do not purge at Cloudflare by default. */
const LISTING_ONLY_PATHS = new Set([
  "/",
  "/blog",
  "/projects",
  "/insights",
  "/press",
  "/authors",
]);

function normalizePaths(paths: string[]): string[] {
  return [
    ...new Set(
      paths.map((path) => stripLocalePrefix(normalizeInternalPath(path)))
    ),
  ];
}

function defaultCloudflarePaths(internal: string[]): string[] {
  return internal.filter((path) => !LISTING_ONLY_PATHS.has(path));
}

export type RevalidatePublicContentOptions = {
  /** Refresh sitemap.xml in Next.js ISR (no Cloudflare purge). */
  sitemap?: boolean;
  /** Cloudflare purge targets. Defaults to detail paths only (excludes listing hubs). */
  cloudflarePaths?: string[];
  /** Locales to purge at Cloudflare. Defaults to English only. */
  cloudflareLocales?: TayproLocale[];
};

/**
 * Revalidate Next.js ISR paths and purge only the matching Cloudflare URLs.
 * Never throws — CMS publish should succeed even if Cloudflare purge fails.
 */
export async function revalidatePublicContent(
  paths: string[],
  options: RevalidatePublicContentOptions = {}
): Promise<void> {
  const internal = normalizePaths(paths);
  for (const path of internal) {
    revalidatePath(path);
  }
  if (options.sitemap) {
    revalidateSitemap();
  }

  const cfPaths =
    options.cloudflarePaths !== undefined
      ? normalizePaths(options.cloudflarePaths)
      : defaultCloudflarePaths(internal);
  if (cfPaths.length === 0) return;

  const cfLocales = options.cloudflareLocales ?? (["en"] as TayproLocale[]);

  try {
    await purgeCloudflarePaths(cfPaths, cfLocales);
  } catch (err) {
    console.error("[revalidate-public-content] Cloudflare purge failed:", err);
  }
}
