import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { MINY_PRODUCT_PATH } from "@/lib/product-coming-soon";

const siteUrl = SITE_URL;
const minyOg = socialImagesFromPreset("helyx");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MinyPage.meta" });

  return withHreflang(MINY_PRODUCT_PATH, locale, {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: true },
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${MINY_PRODUCT_PATH}`,
      type: "website",
      ...minyOg.openGraph,
    },
    twitter: {
      ...minyOg.twitter,
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  });
}

export default function MinyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
