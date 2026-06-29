import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AugmentIntlMessages } from "@/app/components/AugmentIntlMessages";
import { pickMessages } from "@/i18n/pick-messages";
import { loadMessagesForClient } from "@/i18n/load-messages";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const CALCULATOR_PATH = "/solar-panel-cleaning-robot-price-calculator";
const og = socialImagesFromPreset("calculator");

const CALCULATOR_CLIENT_NAMESPACES = ["PriceCalculatorPage"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PriceCalculatorPage.meta" });

  return withHreflang(CALCULATOR_PATH, locale, {
    title: t("title"),
    description: t("description"),
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

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function CalculatorLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const catalog = await loadMessagesForClient(locale);
  const pageMessages = pickMessages(catalog, [...CALCULATOR_CLIENT_NAMESPACES]);

  return (
    <AugmentIntlMessages messages={pageMessages}>{children}</AugmentIntlMessages>
  );
}
