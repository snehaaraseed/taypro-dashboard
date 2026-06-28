import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";

const siteUrl = SITE_URL;
const orionOg = socialImagesFromPreset("console");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OrionPage.meta" });

  return withHreflang(ORION_PRODUCT_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${ORION_PRODUCT_PATH}`,
      type: "website",
      ...orionOg.openGraph,
    },
    twitter: {
      ...orionOg.twitter,
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  });
}

export default function OrionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
