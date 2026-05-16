import type { Metadata } from "next";
import {
  mergePageAlternates,
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
  return {
    ...metadata,
    alternates: mergePageAlternates(
      internalPath,
      locale,
      metadata.alternates,
      options
    ),
  };
}
