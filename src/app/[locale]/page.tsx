import HomePageContent from "./home/HomePageContent";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { preload } from "react-dom";

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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  preload("/tayproasset/cover-solar-hero.webp", { as: "image" });
  return <HomePageContent />;
}
