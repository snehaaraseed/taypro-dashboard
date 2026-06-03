import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { CRADYL_PRODUCT_PATH } from "@/lib/product-cradyl";

const siteUrl = SITE_URL;
const cradylOgImage = `${siteUrl}/tayprorobots/cradyl-field.png`;

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
      images: [
        {
          url: cradylOgImage,
          width: 1200,
          height: 630,
          alt: t("openGraphImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [cradylOgImage],
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
