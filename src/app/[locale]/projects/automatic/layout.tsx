import type { Metadata } from "next";
import { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("modelA");

export const generateMetadata = defineLocalizedMetadata("/projects/automatic", () => ({
  title: "Automatic Solar Panel Cleaning Robot Projects | Taypro",
  description:
    "Explore Taypro automatic Solar Panel Cleaning Robot installations, autonomous waterless fleets on utility-scale plants in India, with site-dependent recovery of generation lost to soiling.",
  keywords: [
    "Automatic Solar Panel Cleaning Robot projects",
    "automatic solar cleaning robot installations",
    "solar panel cleaning robot projects",
    "autonomous solar cleaning systems",
    "AI-powered solar panel cleaning",
    "Taypro automatic robot projects",
  ],
  openGraph: {
    title: "Automatic Solar Panel Cleaning Robot Projects | Taypro",
    description:
      "Automatic Solar Panel Cleaning Robot installation projects. AI-enabled autonomous cleaning systems with highest ROI.",
    url: `${siteUrl}/projects/automatic`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "Automatic Solar Panel Cleaning Robot Projects | Taypro",
    description: "Automatic Solar Panel Cleaning Robot installation projects with AI-powered systems.",
    ...og.twitter,
  }}));

export default function AutomaticProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
