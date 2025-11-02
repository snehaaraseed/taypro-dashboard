import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Automatic Solar Panel Cleaning Robot Projects | Taypro",
  description:
    "Explore Taypro's automatic Solar Panel Cleaning Robot installation projects. Our AI-enabled autonomous cleaning systems deliver up to 30% efficiency increase and highest ROI for solar farms.",
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
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Automatic Solar Panel Cleaning Robot Projects by Taypro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Automatic Solar Panel Cleaning Robot Projects | Taypro",
    description: "Automatic Solar Panel Cleaning Robot installation projects with AI-powered systems.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/projects/automatic`,
  },
};

export default function AutomaticProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
