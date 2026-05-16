import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const BLOG_PATH = "/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.meta" });

  const keywords = [
    t("keyword0"),
    t("keyword1"),
    t("keyword2"),
    t("keyword3"),
    t("keyword4"),
    t("keyword5"),
    t("keyword6"),
    t("keyword7"),
    t("keyword8"),
    t("keyword9"),
  ];

  return withHreflang(BLOG_PATH, locale, {
    title: {
      template: "%s",
      default: t("title"),
    },
    description: t("description"),
    keywords,
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${BLOG_PATH}`,
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
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
    },
  });
}

export default function TayproBlog({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
