import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { getTranslatedLocalesForModule } from "@/lib/seo/locale-page-quality";
import {
  getBuyerIntentConfig,
  type BuyerIntentPageId,
} from "@/lib/seo/buyer-intent-pages-config";

export async function generateBuyerIntentMetadata(
  pageId: BuyerIntentPageId,
  locale: string
): Promise<Metadata> {
  const config = getBuyerIntentConfig(pageId);
  const t = await getTranslations({
    locale,
    namespace: `${config.namespace}.meta`,
  });

  const translatedLocales = getTranslatedLocalesForModule(config.messageModule);
  const usesEnglishFallback =
    locale !== routing.defaultLocale &&
    !translatedLocales.includes(locale as (typeof translatedLocales)[number]);
  const canonicalLocale = usesEnglishFallback ? routing.defaultLocale : locale;

  const ogTitle = t("openGraphTitle");
  const ogDescription = t("openGraphDescription");

  // Dynamic OG card per buyer-intent page — tailored social card for
  // each commercial intent page rather than the generic projects fallback.
  const shareImages = socialImagesFromMedia(null, "", "projects", {
    title: ogTitle,
    meta: "Solar Panel Cleaning Robots — Taypro",
    author: "Taypro",
    type: "landing",
  });

  return withHreflang(
    config.path,
    locale,
    {
      title: t("title"),
      description: t("description"),
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: "website",
        ...shareImages.openGraph,
      },
      twitter: {
        title: ogTitle,
        description: ogDescription,
        ...shareImages.twitter,
      },
    },
    {
      canonicalLocale,
      locales: translatedLocales,
    }
  );
}
