import type { Metadata } from "next";
import { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("opex");

export const generateMetadata = defineLocalizedMetadata("/projects/capex", () => ({
  title: "CAPEX Solar Panel Cleaning Robot Projects",
  description:
    "Explore Taypro's CAPEX model Solar Panel Cleaning Robot projects. Capital expenditure projects with automatic and semi-automatic robotic cleaning systems for solar farms.",
  openGraph: {
    title: "CAPEX Solar Panel Cleaning Robot Projects",
    description:
      "CAPEX model Solar Panel Cleaning Robot projects with automatic and semi-automatic robotic cleaning systems.",
    url: `${siteUrl}/projects/capex`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "CAPEX Solar Panel Cleaning Robot Projects",
    description: "CAPEX model Solar Panel Cleaning Robot projects for solar farms.",
    ...og.twitter,
  }}));

export default function CapexProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
