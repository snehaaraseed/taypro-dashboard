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
    namespace: "CleaningServicePage.meta",
  });

  return withHreflang(
    "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    locale,
    {
      title: t("title"),
      description: t("description"),
      openGraph: {
        title: t("title"),
        description: t("openGraphDescription"),
        url: `${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`,
        type: "website",
        images: [
          {
            url: `${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`,
            width: 1200,
            height: 630,
            alt: t("openGraphImageAlt"),
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: t("title"),
        description: t("twitterDescription"),
        images: [`${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`],
      },
    }
  );
}

export default function CleaningServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
