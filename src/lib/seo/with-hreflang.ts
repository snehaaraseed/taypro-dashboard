import type { Metadata } from "next";
import {
  mergePageAlternates,
  openGraphLocaleForSite,
  type LocaleAlternatesOptions,
} from "./locale-alternates";

type LocaleParams = { params: Promise<{ locale: string }> };

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

  const openGraph =
    metadata.openGraph && canonicalUrl
      ? {
          ...metadata.openGraph,
          url: canonicalUrl,
          locale:
            metadata.openGraph.locale ?? openGraphLocaleForSite(locale),
        }
      : metadata.openGraph;

  return {
    ...metadata,
    alternates,
    openGraph,
  };
}
