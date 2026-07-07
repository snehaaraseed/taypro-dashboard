import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const contactOg = socialImagesFromPreset("contact");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage.meta" });

  return withHreflang("/contact", locale, {
    title: { absolute: t("title") },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${siteUrl}/contact`,
      type: "website",
      ...contactOg.openGraph,
    },
    twitter: {
      ...contactOg.twitter,
      title: t("title"),
      description: t("description"),
    },
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
