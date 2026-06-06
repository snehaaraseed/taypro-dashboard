import type { Metadata } from "next";
import { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("opex");

export const generateMetadata = defineLocalizedMetadata("/projects/opex", () => ({
  title: "Opex Solar Panel Cleaning Robot Projects | Taypro",
  description:
    "Explore Taypro Opex Solar Panel Cleaning Robot projects. Operator-led cleaning as a service with pay-per-panel delivery, fleet ownership, and SLA-backed cycles on utility-scale plants.",
  keywords: [
    "Opex Solar Panel Cleaning Robot projects",
    "Taypro Opex solar cleaning",
    "solar panel cleaning as a service",
    "pay per panel solar cleaning",
    "operator-led robotic cleaning",
    "Taypro Opex projects",
    "solar cleaning service India",
  ],
  openGraph: {
    title: "Opex Solar Panel Cleaning Robot Projects | Taypro",
    description:
      "Taypro Opex model Solar Panel Cleaning Robot projects with operator-led cycles and service SLAs.",
    url: `${siteUrl}/projects/opex`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "Opex Solar Panel Cleaning Robot Projects | Taypro",
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
