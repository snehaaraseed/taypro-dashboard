import HomePage from "./home/page";
import type { Metadata } from "next";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const homeOg = socialImagesFromPreset("default");

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
  description:
    "Autonomous and semi-automatic waterless solar panel cleaning robots for utility-scale plants in India. Dual-pass dry cleaning, fleet monitoring, and pan-India service by Taypro.",
  keywords: [
    "Solar Panel Cleaning Robot",
    "solar panel cleaning robot",
    "automatic solar panel cleaning robot",
    "robotic solar panel cleaner",
    "solar panel cleaning automation",
    "solar farm cleaning robot",
    "waterless solar panel cleaning",
    "autonomous solar cleaning robot",
    "solar panel maintenance robot",
    "Taypro solar cleaning robot",
    "solar panel cleaning system",
    "solar cleaning robots India",
    "automatic solar robot",
    "semi-automatic solar robots",
    "capex",
    "opex",
    "cleaning robots",
  ],
  openGraph: {
    title: "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
    description:
      "Autonomous waterless solar panel cleaning robots for utility-scale plants in India—dual-pass dry cleaning and Taypro Console fleet monitoring.",
    url: siteUrl,
    type: "website",
    ...homeOg.openGraph,
  },
  twitter: {
    title: "Solar Panel Cleaning Robot | Taypro",
    description:
      "Autonomous and semi-automatic waterless solar panel cleaning robots for utility-scale solar farms in India.",
    ...homeOg.twitter,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  return <HomePage />;
}
