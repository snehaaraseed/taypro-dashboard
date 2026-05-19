import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { CRADYL_PRODUCT_PATH } from "@/lib/product-coming-soon";

const siteUrl = SITE_URL;
const cradylOg = socialImagesFromPreset("modelB");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CradylPage.meta" });
  const keywords = t.raw("keywords") as string[];

  return withHreflang(CRADYL_PRODUCT_PATH, locale, {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${CRADYL_PRODUCT_PATH}`,
      type: "website",
      ...cradylOg.openGraph,
    },
    twitter: {
      ...cradylOg.twitter,
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  });
}

export default function CradylLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
