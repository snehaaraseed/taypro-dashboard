import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const NYUMA_X_PATH =
  "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot";
const nyumaXOg = socialImagesFromPreset("nyumaX");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NyumaXPage.meta" });
  const keywords = t.raw("keywords") as string[];

  return withHreflang(NYUMA_X_PATH, locale,
    {
      title: t("title"),
      description: t("description"),
      keywords,
      openGraph: {
        title: t("title"),
        description: t("openGraphDescription"),
        url: `${siteUrl}${NYUMA_X_PATH}`,
        type: "website",
        ...nyumaXOg.openGraph,
        images: nyumaXOg.openGraph?.images?.map((img) =>
          typeof img === "object" && img !== null && "url" in img
            ? { ...img, alt: t("openGraphImageAlt") }
            : img
        ),
      },
      twitter: {
        title: t("title"),
        description: t("twitterDescription"),
        ...nyumaXOg.twitter,
      },
    }
  );
}

export default function ModelTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
