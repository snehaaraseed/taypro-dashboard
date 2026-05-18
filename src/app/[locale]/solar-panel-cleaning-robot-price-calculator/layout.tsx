import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const CALCULATOR_PATH = "/solar-panel-cleaning-robot-price-calculator";
const og = socialImagesFromPreset("calculator");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PriceCalculatorPage.meta" });

  const keywords = [
    t("keyword0"),
    t("keyword1"),
    t("keyword2"),
    t("keyword3"),
    t("keyword4"),
    t("keyword5"),
    t("keyword6"),
    t("keyword7"),
    t("keyword8"),
    t("keyword9"),
    t("keyword10"),
  ];

  return withHreflang(CALCULATOR_PATH, locale, {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${CALCULATOR_PATH}`,
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

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
