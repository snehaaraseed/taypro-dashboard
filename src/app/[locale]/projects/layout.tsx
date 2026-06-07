import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PROJECT_HERO_IMAGE_PATH } from "@/lib/site-images";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const PROJECTS_PATH = "/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectsPage.meta" });

  return withHreflang(PROJECTS_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${PROJECTS_PATH}`,
      type: "website",
      images: [
        {
          url: `${siteUrl}${PROJECT_HERO_IMAGE_PATH}`,
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
      images: [`${siteUrl}${PROJECT_HERO_IMAGE_PATH}`],
    },
  });
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
