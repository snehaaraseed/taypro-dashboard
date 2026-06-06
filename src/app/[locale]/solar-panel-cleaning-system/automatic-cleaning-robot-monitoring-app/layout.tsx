import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "NectyrPage.meta",
  });

  return withHreflang(
    "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    locale,
    {
      title: t("title"),
      description: t("description"),
      keywords: [
        "solar cleaning robot fleet monitoring software",
        "solar O&M portal",
        "solar O&M cleaning reports",
        "solar panel cleaning robot monitoring",
        "solar cleaning robot fleet management",
        "robotic solar cleaning dashboard",
        "solar panel cleaning robot control portal",
        "solar farm robot monitoring India",
        "cleaning robot scheduling software",
        "solar robot telemetry dashboard",
        "autonomous solar cleaning monitoring",
        "weather-aware solar cleaning scheduling",
        "solar plant cleaning analytics",
        "NECTYR",
        "Taypro fleet portal",
      ],
      openGraph: {
        siteName: "Taypro",
        title: t("title"),
        description: t("openGraphDescription"),
        url: `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`,
        type: "website",
        locale: "en_IN",
        images: [
          {
            url: `${siteUrl}/tayproasset/taypro-dashboard.png`,
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
        images: [`${siteUrl}/tayproasset/taypro-dashboard.png`],
      },
    }
  );
}

export default function NectyrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
