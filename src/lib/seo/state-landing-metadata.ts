import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { getTranslatedLocalesForModule } from "@/lib/seo/locale-page-quality";
import {
  getStateLandingConfig,
  type StateLandingId,
} from "@/lib/seo/state-landing-config";

const og = socialImagesFromPreset("projects");

export async function generateStateLandingMetadata(
  stateId: StateLandingId,
  locale: string
): Promise<Metadata> {
  const config = getStateLandingConfig(stateId);
  const t = await getTranslations({ locale, namespace: "StateLandingsPage" });

  const translatedLocales = getTranslatedLocalesForModule("state-landings");
  const usesEnglishFallback =
    locale !== routing.defaultLocale &&
    !translatedLocales.includes(locale as (typeof translatedLocales)[number]);
  const canonicalLocale = usesEnglishFallback ? routing.defaultLocale : locale;

  return withHreflang(
    config.path,
    locale,
    {
      title: t(`${stateId}.meta.title`),
      description: t(`${stateId}.meta.description`),
      openGraph: {
        title: t(`${stateId}.meta.openGraphTitle`),
        description: t(`${stateId}.meta.openGraphDescription`),
        type: "website",
        ...og.openGraph,
      },
      twitter: {
        title: t(`${stateId}.meta.openGraphTitle`),
        description: t(`${stateId}.meta.openGraphDescription`),
        ...og.twitter,
      },
    },
    {
      canonicalLocale,
      locales: translatedLocales,
    }
  );
}
