import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Service - Solar Panel Cleaning Robot Services | Taypro OPEX",
  description:
    "Solar Panel Cleaning Service by Taypro using our advanced Solar Panel Cleaning Robot systems. We deploy automatic and semi-automatic robots for waterless, efficient ROI-focused cleaning services. OPEX model available. Contact us today!",
  keywords: [
    "Solar Panel Cleaning Robot service",
    "solar panel cleaning service",
    "solar panel cleaning robot OPEX",
    "automatic solar panel cleaning service",
    "robotic solar panel cleaning service",
    "solar panel cleaning robot maintenance",
    "solar farm cleaning service",
    "waterless solar cleaning service",
    "environmental sustainability",
    "cost effective solar cleaning",
    "taypro cleaning service",
  ],
  openGraph: {
    title: "Solar Panel Cleaning Service - Solar Panel Cleaning Robot Services | Taypro OPEX",
    description:
      "Solar Panel Cleaning Service using advanced Solar Panel Cleaning Robot systems. Automatic, waterless, and efficient. OPEX model available.",
    url: `${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Panel Cleaning Robot Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Service - Solar Panel Cleaning Robot Services | Taypro",
    description:
      "Advanced Solar Panel Cleaning Robot service with automatic, waterless cleaning. OPEX model available.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`,
  },
};

export default function CleaningServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
