import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import {
  formatInr,
  getIndicativeCapexBands,
  PRICE_GUIDE_PATH,
} from "@/lib/seo/robot-price-guide";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("calculator");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RobotPriceIndiaPage.meta" });

  return withHreflang(PRICE_GUIDE_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${PRICE_GUIDE_PATH}`,
      type: "website",
      ...og.openGraph,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      ...og.twitter,
    },
  });
}

export default function RobotPriceIndiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
