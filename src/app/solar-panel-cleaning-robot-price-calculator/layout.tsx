import type { Metadata } from "next";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("calculator");

export const metadata: Metadata = {
  title:
    "Solar Panel Cleaning Robot Price & ROI Calculator | Taypro India",
  description:
    "Free solar panel cleaning robot price and ROI calculator for utility-scale and commercial PV plants. Estimate payback, annual savings, water avoided, investment, and CO₂ impact—then request a tailored Taypro quote.",
  keywords: [
    "solar panel cleaning robot price calculator",
    "solar panel cleaning robot ROI calculator",
    "solar cleaning robot cost calculator India",
    "automatic solar panel cleaning robot investment",
    "solar panel cleaning robot payback period",
    "utility scale solar cleaning robot price",
    "taypro ROI calculator",
    "solar O&M robot savings calculator",
  ],
  openGraph: {
    title:
      "Solar Panel Cleaning Robot Price & ROI Calculator | Taypro",
    description:
      "Estimate robot investment, payback, labour savings, and generation gain for your solar plant. Free online tool by Taypro.",
    url: `${siteUrl}/solar-panel-cleaning-robot-price-calculator`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "Solar Panel Cleaning Robot ROI Calculator | Taypro",
    description:
      "Estimate payback and savings for Taypro cleaning robots on your solar plant.",
    ...og.twitter,
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-robot-price-calculator`,
  },
};

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
