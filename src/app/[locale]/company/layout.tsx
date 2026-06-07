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
  const t = await getTranslations({ locale, namespace: "CompanyPage.meta" });

  return withHreflang("/company", locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("openGraphDescription"),
      url: `${siteUrl}/company`,
      type: "website",
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
      title: t("title"),
      description: t("twitterDescription"),
      images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
    },
  });
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
