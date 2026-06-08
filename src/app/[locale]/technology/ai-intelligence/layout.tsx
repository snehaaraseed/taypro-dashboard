import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const AI_INTELLIGENCE_PATH = "/technology/ai-intelligence";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AiIntelligencePage.meta" });

  return withHreflang(AI_INTELLIGENCE_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${SITE_URL}${AI_INTELLIGENCE_PATH}`,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/tayproasset/nectyr.webp`,
          width: 1200,
          height: 630,
          alt: "Taypro AI intelligence layer for solar cleaning robots",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [`${SITE_URL}/tayproasset/nectyr.webp`],
    },
  });
}

export default function AiIntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
