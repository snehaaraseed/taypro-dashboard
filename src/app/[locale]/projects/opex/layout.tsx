import type { Metadata } from "next";
import { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("opex");

export const generateMetadata = defineLocalizedMetadata("/projects/opex", () => ({
  title: "Opex Solar Panel Cleaning Robot Projects",
  description:
    "Explore Opex Solar Panel Cleaning Robot projects. Operator-led cleaning as a service with pay-per-panel delivery, fleet ownership, and SLA-backed cycles on utility-scale plants.",
  openGraph: {
    title: "Opex Solar Panel Cleaning Robot Projects",
    description:
      "Opex model Solar Panel Cleaning Robot projects with operator-led cycles and service SLAs.",
    url: `${siteUrl}/projects/opex`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "Opex Solar Panel Cleaning Robot Projects",
    description:
      "Opex model Solar Panel Cleaning Robot projects with Taypro-operated fleets.",
    ...og.twitter,
  },
}));

export default function OpexProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
