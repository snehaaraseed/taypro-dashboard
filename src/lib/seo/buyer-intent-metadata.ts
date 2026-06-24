import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { getTranslatedLocalesForModule } from "@/lib/seo/locale-page-quality";
import {
  getBuyerIntentConfig,
  type BuyerIntentPageId,
} from "@/lib/seo/buyer-intent-pages-config";

const og = socialImagesFromPreset("projects");

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

  return withHreflang(
    config.path,
    locale,
    {
      title: t("title"),
      description: t("description"),
      openGraph: {
        title: t("openGraphTitle"),
        description: t("openGraphDescription"),
        type: "website",
        ...og.openGraph,
      },
      twitter: {
        title: t("openGraphTitle"),
        description: t("openGraphDescription"),
        ...og.twitter,
      },
    },
    {
      canonicalLocale,
      locales: translatedLocales,
    }
  );
}
