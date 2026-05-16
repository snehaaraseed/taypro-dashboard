import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const SOLAR_SYSTEM_PATH = "/solar-panel-cleaning-system";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolarSystemPage.meta" });
  const keywords = t.raw("keywords") as string[];

  return withHreflang(SOLAR_SYSTEM_PATH, locale, {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      siteName: t("openGraphSiteName"),
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${SOLAR_SYSTEM_PATH}`,
      type: "website",
      locale: t("openGraphLocale"),
      images: [
        {
          url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
          width: 1200,
          height: 630,
          alt: t("openGraphImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
    },
  });
}

export default function CleaningRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
