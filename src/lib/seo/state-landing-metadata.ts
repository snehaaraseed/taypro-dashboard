import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromMedia } from "@/lib/seo/open-graph";
import { getTranslatedLocalesForModule } from "@/lib/seo/locale-page-quality";
import {
  getStateLandingConfig,
  type StateLandingId,
} from "@/lib/seo/state-landing-config";

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

  const ogTitle = t(`${stateId}.meta.openGraphTitle`);
  const ogDescription = t(`${stateId}.meta.openGraphDescription`);

  // Dynamic OG card per state — each state gets a branded social card instead
  // of the generic projects image, improving social CTR for state-specific shares.
  const shareImages = socialImagesFromMedia(null, "", "projects", {
    title: ogTitle,
    meta: `Solar Panel Cleaning Robots — ${config.addressRegion}`,
    author: "Taypro",
    type: "state",
  });

  return withHreflang(
    config.path,
    locale,
    {
      title: t(`${stateId}.meta.title`),
      description: t(`${stateId}.meta.description`),
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
