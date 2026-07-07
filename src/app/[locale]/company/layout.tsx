import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const companyOg = socialImagesFromPreset("company");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CompanyPage.meta" });

  return withHreflang("/company", locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("openGraphDescription"),
      url: `${siteUrl}/company`,
      type: "website",
      ...companyOg.openGraph,
    },
    twitter: {
      ...companyOg.twitter,
      title: t("title"),
      description: t("twitterDescription"),
    },
  });
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
