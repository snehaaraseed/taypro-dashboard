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
  const t = await getTranslations({ locale, namespace: "ContactPage.meta" });

  return withHreflang("/contact", locale, {
    title: t("title"),
    description: t("description"),
    keywords: [
      "Solar Panel Cleaning Robot",
      "contact Taypro",
      "solar panel cleaning robot quote",
      "automatic solar panel cleaning robot",
      "semi-automatic solar panel cleaning robot",
      "solar cleaning robot contact",
      "taypro contact",
      "solar panel cleaning service",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${siteUrl}/contact`,
      type: "website",
      images: [
        {
          url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
          width: 1200,
          height: 630,
          alt: "Contact Taypro for Solar Panel Cleaning Robot Solutions",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
    },
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
