import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "CAPEX Solar Panel Cleaning Robot Projects by Taypro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CAPEX Solar Panel Cleaning Robot Projects | Taypro",
    description: "CAPEX model Solar Panel Cleaning Robot projects for solar farms.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
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
