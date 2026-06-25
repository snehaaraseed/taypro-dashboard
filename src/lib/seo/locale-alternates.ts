import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { ACTIVE_LOCALES, type TayproLocale } from "@/i18n/markets";
import { SITE_URL } from "./sitemap-config";

/** Internal path without locale prefix, always leading slash (e.g. `/blog`, `/company`). */
export function normalizeInternalPath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

/** Strip `/hi`, `/ar`, etc. from a request pathname. */
export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizeInternalPath(pathname);
  for (const locale of ACTIVE_LOCALES) {
    if (locale === routing.defaultLocale) continue;
    const prefix = `/${locale}`;
    if (normalized === prefix) return "/";
    if (normalized.startsWith(`${prefix}/`)) {
      return normalized.slice(prefix.length) || "/";
    }
  }
  return normalized;
}

/** Public URL for a locale + internal path (English has no `/en` prefix). */
export function localizedUrl(
  internalPath: string,
  locale: string
): string {
  const path = normalizeInternalPath(internalPath);
  if (locale === routing.defaultLocale) {
    return `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL;
  }
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

export type LocaleAlternatesOptions = {
  /** When false, only default locale + x-default (e.g. untranslated blog posts). */
  includeAllLocales?: boolean;
  /** When set, hreflang lists only these locales (e.g. CMS rows actually published). */
  locales?: TayproLocale[];
  /** Appended to every locale URL (e.g. `?page=2` on blog index). */
  canonicalSuffix?: string;
  /** When set, canonical URL uses this locale instead of the page locale (English fallback). */
  canonicalLocale?: string;
};

export function buildLocaleAlternates(
  internalPath: string,
  currentLocale: string,
  options: LocaleAlternatesOptions = { includeAllLocales: true }
): NonNullable<Metadata["alternates"]> {
  const path = normalizeInternalPath(internalPath);
  const includeAll = options.includeAllLocales !== false;
  const suffix = options.canonicalSuffix ?? "";
  const canonicalLocale = options.canonicalLocale ?? currentLocale;
  const explicitLocales = options.locales?.filter((locale) =>
    (routing.locales as readonly string[]).includes(locale)
  );

  const languages: Record<string, string> = {};

  if (explicitLocales && explicitLocales.length > 0) {
    for (const locale of explicitLocales) {
      languages[hreflangTagForLocale(locale)] =
        localizedUrl(path, locale) + suffix;
    }
  } else if (includeAll) {
    for (const locale of routing.locales) {
      languages[hreflangTagForLocale(locale)] =
        localizedUrl(path, locale) + suffix;
    }
  } else {
    languages[hreflangTagForLocale(routing.defaultLocale)] = localizedUrl(
      path,
      routing.defaultLocale
    );
  }

  const xDefaultLocale =
    explicitLocales && explicitLocales.length > 0
      ? explicitLocales.includes(routing.defaultLocale as TayproLocale)
        ? routing.defaultLocale
        : explicitLocales[0]
      : routing.defaultLocale;

  languages["x-default"] = localizedUrl(path, xDefaultLocale) + suffix;

  return {
    canonical: localizedUrl(path, canonicalLocale) + suffix,
    languages,
  };
}

export function mergePageAlternates(
  internalPath: string,
  currentLocale: string,
  existing?: Metadata["alternates"],
  options?: LocaleAlternatesOptions
): Metadata["alternates"] {
  const built = buildLocaleAlternates(internalPath, currentLocale, options);
  return {
    ...existing,
    canonical: built.canonical,
    languages: built.languages,
  };
}

export function isTayproLocale(value: string): value is TayproLocale {
  return (ACTIVE_LOCALES as readonly string[]).includes(value);
}

/** Open Graph locale tags aligned with Taypro site locales. */
export function openGraphLocaleForSite(locale: string): string {
  switch (locale) {
    case "hi":
      return "hi_IN";
    case "ar":
      return "ar_AE";
    case "ja":
      return "ja_JP";
    case "bn":
      return "bn_BD";
    default:
      return "en_IN";
  }
}

/** Hreflang attribute values (language-REGION). */
export function hreflangTagForLocale(locale: string): string {
  switch (locale) {
    case "hi":
      return "hi-IN";
    case "ar":
      return "ar-AE";
    case "ja":
      return "ja-JP";
    case "bn":
      return "bn-BD";
    default:
      return "en-IN";
  }
}

/** Sitemap path for one locale (English has no `/en` prefix). */
export function sitemapPathForLocale(
  internalPath: string,
  locale: TayproLocale
): string {
  const path = normalizeInternalPath(internalPath);
  if (locale === routing.defaultLocale) {
    return path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Expand sitemap paths for every active locale. */
export function sitemapPathsForAllLocales(internalPath: string): string[] {
  return routing.locales.map((locale) =>
    sitemapPathForLocale(internalPath, locale)
  );
}
