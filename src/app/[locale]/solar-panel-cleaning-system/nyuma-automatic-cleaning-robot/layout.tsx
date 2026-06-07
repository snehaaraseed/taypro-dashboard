import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = SITE_URL;
const NYUMA_PATH =
  "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot";
const nyumaOg = socialImagesFromPreset("nyuma");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NyumaPage.meta" });

  return withHreflang(NYUMA_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${NYUMA_PATH}`,
      type: "website",
      ...nyumaOg.openGraph,
    },
    twitter: {
      ...nyumaOg.twitter,
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  });
}

export default function AutomaticRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
