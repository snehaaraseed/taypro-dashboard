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
    keywords: [
      "About Taypro",
      "Taypro Private Limited",
      "Solar Panel Cleaning Robot manufacturer India",
      "Made in India solar cleaning robot",
      "autonomous solar panel cleaning",
      "Taypro founders",
      "Taypro team Chakan Pune",
      "robotic solar cleaning company",
      "utility-scale solar O&M",
      "waterless solar panel cleaning",
      "Taypro Console",
    ],
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
