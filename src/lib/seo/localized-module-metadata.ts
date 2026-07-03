import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { getTranslatedLocalesForModule } from "@/lib/seo/locale-page-quality";

/** Hreflang + canonical for static pages backed by a messages/pages module. */
export function withModulePageHreflang(
  internalPath: string,
  messageModule: string,
  locale: string,
  metadata: Metadata
): Metadata {
  const translatedLocales = getTranslatedLocalesForModule(messageModule);
  const usesEnglishFallback =
    locale !== routing.defaultLocale &&
    !translatedLocales.includes(locale as (typeof translatedLocales)[number]);
  const canonicalLocale = usesEnglishFallback ? routing.defaultLocale : locale;

  return withHreflang(internalPath, locale, metadata, {
    canonicalLocale,
    locales: translatedLocales,
  });
}
