import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import {
  getStateLandingConfig,
  type StateLandingId,
} from "@/lib/seo/state-landing-config";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const og = socialImagesFromPreset("projects");

export async function generateStateLandingMetadata(
  stateId: StateLandingId,
  locale: string
): Promise<Metadata> {
  const config = getStateLandingConfig(stateId);
  const t = await getTranslations({ locale, namespace: "StateLandingsPage" });

  return withHreflang(config.path, locale, {
    title: t(`${stateId}.meta.title`),
    description: t(`${stateId}.meta.description`),
    keywords: [
      `solar panel cleaning robot ${config.addressRegion}`,
      `solar cleaning robot ${config.addressRegion}`,
      `solar panel cleaning robot India ${config.addressRegion}`,
      "solar O&M robot",
      "waterless solar panel cleaning robot",
      "Taypro",
    ],
    openGraph: {
      title: t(`${stateId}.meta.openGraphTitle`),
      description: t(`${stateId}.meta.openGraphDescription`),
      url: `${SITE_URL}${config.path}`,
      type: "website",
      ...og.openGraph,
    },
  });
}
