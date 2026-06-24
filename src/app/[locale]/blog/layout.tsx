import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const BLOG_PATH = "/blog";

/**
 * Blog layout metadata is intentionally minimal: no canonical or hreflang here.
 * `/blog`, `/blog/[slug]`, and `/blog/author/*` each set their own alternates so
 * posts never inherit the hub canonical (Ahrefs non-canonical organic traffic).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.meta" });

  return {
    title: {
      template: "%s",
      default: t("title"),
    },
    description: t("description"),
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
  };
}

export default function TayproBlog({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
