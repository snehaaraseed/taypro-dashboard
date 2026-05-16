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

  return withHreflang(
    "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    locale,
    {
      title: t("title"),
      description: t("description"),
      keywords: [
        "semi-automatic solar panel cleaning robot",
        "semi automatic solar cleaning robot",
        "pick and place solar cleaning robot",
        "lift and shift solar cleaning robot",
        "portable solar panel cleaning robot",
        "manual deployment solar cleaning robot",
        "rooftop solar cleaning robot",
        "fixed tilt solar panel cleaning",
        "seasonal tilt solar panel cleaning",
        "PBT brush solar cleaning robot",
        "counter-rotating brush solar cleaning",
        "dry solar panel cleaning robot",
        "Taypro Model-B",
        "Taypro Loop",
      ],
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
