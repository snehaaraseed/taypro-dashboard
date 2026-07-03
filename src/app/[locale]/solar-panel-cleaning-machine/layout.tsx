import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withModulePageHreflang } from "@/lib/seo/localized-module-metadata";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { CLEANING_MACHINE_PATH } from "@/lib/seo/cleaning-machine";

const og = socialImagesFromPreset("calculator");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CleaningMachinePage.meta" });

  return withModulePageHreflang(CLEANING_MACHINE_PATH, "cleaning-machine", locale, {
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

export default function CleaningMachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
