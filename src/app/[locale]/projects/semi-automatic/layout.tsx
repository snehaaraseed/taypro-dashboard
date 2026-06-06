import type { Metadata } from "next";
import { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("modelB");

export const generateMetadata = defineLocalizedMetadata("/projects/semi-automatic", () => ({
  title: "Semi-Automatic Solar Panel Cleaning Robot Projects",
  description:
    "Explore Taypro's semi-automatic Solar Panel Cleaning Robot installation projects. Cost-effective pick-and-place robotic cleaning systems with fastest ROI for solar farms.",
  keywords: [
    "Semi-Automatic Solar Panel Cleaning Robot projects",
    "semi-automatic solar cleaning robot installations",
    "pick-and-place solar panel cleaning robot",
    "cost-effective solar cleaning robot",
    "Taypro semi-automatic robot projects",
    "Model-B solar cleaning robot projects",
  ],
  openGraph: {
    title: "Semi-Automatic Solar Panel Cleaning Robot Projects",
    description:
      "Semi-automatic Solar Panel Cleaning Robot installation projects with pick-and-place robotic cleaning systems.",
    url: `${siteUrl}/projects/semi-automatic`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "Semi-Automatic Solar Panel Cleaning Robot Projects",
    description: "Semi-automatic Solar Panel Cleaning Robot installation projects.",
    ...og.twitter,
  }}));

export default function SemiautomaticProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
