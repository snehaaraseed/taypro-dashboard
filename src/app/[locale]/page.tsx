import HomePageContent from "./home/HomePageContent";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const homeOg = socialImagesFromPreset("default");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.meta" });

  return withHreflang("/", locale, {
    title: { absolute: t("title") },
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: siteUrl,
      type: "website",
      ...homeOg.openGraph,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      ...homeOg.twitter,
    },
  });
}

export default function Home() {
  return <HomePageContent />;
}
