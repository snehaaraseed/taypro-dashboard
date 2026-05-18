import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const modelBOg = socialImagesFromPreset("modelB");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ModelBPage.meta" });
  const keywords = t.raw("keywords") as string[];

  return withHreflang(
    "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    locale,
    {
      title: t("title"),
      description: t("description"),
      keywords,
      openGraph: {
        title: t("title"),
        description: t("openGraphDescription"),
        url: `${siteUrl}/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system`,
        type: "website",
        ...modelBOg.openGraph,
        images: modelBOg.openGraph?.images?.map((img) =>
          typeof img === "object" && img !== null && "url" in img
            ? { ...img, alt: t("openGraphImageAlt") }
            : img
        ),
      },
      twitter: {
        title: t("title"),
        description: t("twitterDescription"),
        ...modelBOg.twitter,
      },
    }
  );
}

export default function SemiAutomaticRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
