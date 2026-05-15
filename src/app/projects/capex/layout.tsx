import type { Metadata } from "next";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;
const og = socialImagesFromPreset("opex");

export const metadata: Metadata = {
  title: "CAPEX Solar Panel Cleaning Robot Projects | Taypro",
  description:
    "Explore Taypro's CAPEX model Solar Panel Cleaning Robot projects. Capital expenditure projects with automatic and semi-automatic robotic cleaning systems for solar farms.",
  keywords: [
    "CAPEX Solar Panel Cleaning Robot projects",
    "capex solar cleaning robot",
    "capital expenditure solar projects",
    "solar panel cleaning robot capex model",
    "Taypro CAPEX projects",
    "solar cleaning robot investment",
  ],
  openGraph: {
    title: "CAPEX Solar Panel Cleaning Robot Projects | Taypro",
    description:
      "CAPEX model Solar Panel Cleaning Robot projects with automatic and semi-automatic robotic cleaning systems.",
    url: `${siteUrl}/projects/capex`,
    type: "website",
    ...og.openGraph,
  },
  twitter: {
    title: "CAPEX Solar Panel Cleaning Robot Projects | Taypro",
    description: "CAPEX model Solar Panel Cleaning Robot projects for solar farms.",
    ...og.twitter,
  },
  alternates: {
    canonical: `${siteUrl}/projects/capex`,
  },
};

export default function CapexProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
