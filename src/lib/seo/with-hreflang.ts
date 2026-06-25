import type { Metadata } from "next";
import {
  mergePageAlternates,
  openGraphLocaleForSite,
  type LocaleAlternatesOptions,
} from "./locale-alternates";
import {
  formatBrandTitle,
  hasBrandSuffix,
  normalizePageTitle,
  SERP_TITLE_MAX,
  trimSerpTitle,
} from "./page-title";
import { trimSerpDescription } from "./serp-description";

type LocaleParams = { params: Promise<{ locale: string }> };

function trimAbsoluteTitle(absolute: string): string {
  const trimmed = absolute.trim();
  if (trimmed.length <= SERP_TITLE_MAX) return trimmed;
  return trimSerpTitle(trimmed, {
    includeBrand: hasBrandSuffix(trimmed),
    max: SERP_TITLE_MAX,
  });
}

function resolveTitle(metadata: Metadata): Metadata["title"] {
  const { title } = metadata;
  if (!title) return title;
  if (typeof title === "string") {
    return { absolute: formatBrandTitle(title) };
  }
  if ("absolute" in title && title.absolute) {
    return { absolute: trimAbsoluteTitle(title.absolute) };
  }
  if ("default" in title && title.default) {
    return { absolute: formatBrandTitle(title.default) };
  }
  return title;
}

function resolveDescription(description: Metadata["description"]): Metadata["description"] {
  if (typeof description === "string") {
    return trimSerpDescription(description);
  }
  return description;
}

function resolveOpenGraph(
  openGraph: Metadata["openGraph"],
  canonicalUrl?: string,
  locale?: string
): Metadata["openGraph"] {
  if (!openGraph) return openGraph;
  const og = typeof openGraph === "object" ? { ...openGraph } : openGraph;
  if (typeof og !== "object" || og === null) return openGraph;

  if (typeof og.title === "string") {
    og.title = formatBrandTitle(og.title);
  }
  if (typeof og.description === "string") {
    og.description = trimSerpDescription(og.description);
  }
  if (canonicalUrl) {
    og.url = canonicalUrl;
    og.locale = og.locale ?? (locale ? openGraphLocaleForSite(locale) : undefined);
  }
  return og;
}

function resolveTwitter(twitter: Metadata["twitter"]): Metadata["twitter"] {
  if (!twitter || typeof twitter !== "object") return twitter;
  const tw = { ...twitter };
  if (typeof tw.title === "string") {
    tw.title = formatBrandTitle(tw.title);
  }
  if (typeof tw.description === "string") {
    tw.description = trimSerpDescription(tw.description);
  }
  return tw;
}

/** Build generateMetadata for layouts/pages with hreflang from a fixed internal path. */
export function defineLocalizedMetadata(
  internalPath: string,
  build: () => Metadata,
  options?: LocaleAlternatesOptions
): (props: LocaleParams) => Promise<Metadata> {
  return async ({ params }) => {
    const { locale } = await params;
    const base = build();
    return withHreflang(internalPath, locale, base, options);
  };
}

/** Attach canonical + hreflang alternates to page metadata. */
export function withHreflang(
  internalPath: string,
  locale: string,
  metadata: Metadata,
  options?: LocaleAlternatesOptions
): Metadata {
  const alternates = mergePageAlternates(
    internalPath,
    locale,
    metadata.alternates,
    options
  );
  const canonicalUrl =
    typeof alternates?.canonical === "string" ? alternates.canonical : undefined;

  return {
    ...metadata,
    title: resolveTitle(metadata),
    description: resolveDescription(metadata.description),
    alternates,
    openGraph: resolveOpenGraph(metadata.openGraph, canonicalUrl, locale),
    twitter: resolveTwitter(metadata.twitter),
  };
}

export { normalizePageTitle, formatBrandTitle };
