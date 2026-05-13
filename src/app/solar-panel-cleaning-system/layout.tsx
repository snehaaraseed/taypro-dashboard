import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  // Primary intent: category landing for "solar panel cleaning robot in India".
  // Child URLs own model-specific intent (automatic / semi-automatic / tracker / service / monitoring).
  title:
    "Solar Panel Cleaning Robot in India — Compare Taypro Models & Services",
  description:
    "Compare every Taypro Solar Panel Cleaning Robot in one place. Choose between Model-A (automatic), Model-B (semi-automatic, pick-and-place), Model-T (single-axis tracker), or Taypro OPEX as a service. Waterless dual-pass cleaning, AI/ML scheduling, TÜV NORD certified, same-day pan-India breakdown support.",
  keywords: [
    "solar panel cleaning robot",
    "solar panel cleaning robot India",
    "solar panel cleaning robot manufacturer India",
    "solar panel cleaning robot company India",
    "buy solar panel cleaning robot",
    "best solar panel cleaning robot",
    "utility scale solar panel cleaning robot",
    "robotic solar panel cleaning system",
    "solar panel cleaning robot for solar farm",
    "Taypro solar cleaning robot",
    "Taypro Model-A vs Model-B vs Model-T",
    "CAPEX vs OPEX solar cleaning",
  ],
  openGraph: {
    siteName: "Taypro",
    title:
      "Solar Panel Cleaning Robot | Automatic, Semi-Automatic & Tracker Models — Taypro",
    description:
      "Choose the right Solar Panel Cleaning Robot for your solar plant — autonomous Model-A, semi-automatic pick-and-place Model-B, single-axis tracker Model-T, plus Taypro OPEX (pay per panel cleaned) and Taypro Console fleet software.",
    url: `${siteUrl}/solar-panel-cleaning-system`,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Panel Cleaning Robots — Model-A, Model-B and Model-T for Indian solar plants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robot | Taypro — Made in India",
    description:
      "Automatic, semi-automatic and tracker-ready Solar Panel Cleaning Robots with waterless cleaning, AI scheduling and same-day pan-India breakdown support.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system`,
  },
};

export default function CleaningRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
