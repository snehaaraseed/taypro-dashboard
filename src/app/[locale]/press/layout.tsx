import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withModulePageHreflang } from "@/lib/seo/localized-module-metadata";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { PRESS_PAGE_PATH } from "@/lib/seo/press-coverage";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("company");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PressPage.meta" });

  return withModulePageHreflang(PRESS_PAGE_PATH, "press", locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      type: "website",
      ...og.openGraph,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      ...og.twitter,
    },
  });
}

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Taypro Press Releases"
        href={`${siteUrl}/feed/press.xml`}
      />
      {children}
    </>
  );
}
