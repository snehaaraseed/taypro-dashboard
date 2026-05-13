import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title:
    "Solar Panel Cleaning Robot India | Automatic, Semi-Automatic & Tracker Models",
  description:
    "Taypro builds India's most deployed Solar Panel Cleaning Robots — fully Automatic Solar Panel Cleaning Robot (Model-A), pick-and-place semi-automatic (Model-B), and single-axis tracker cleaning robot (Model-T). Waterless dual-pass cleaning, AI/ML scheduling, TÜV NORD certified, 72-hour pan-India service. Choose CAPEX or OPEX (pay-per-panel) with monitoring on Taypro Console.",
  keywords: [
    "Solar Panel Cleaning Robot",
    "solar panel cleaning robot",
    "solar panel cleaning robot India",
    "Automatic Solar Panel Cleaning Robot",
    "automatic solar panel cleaning robot India",
    "best solar panel cleaning robot",
    "solar panel cleaning robot manufacturer",
    "solar panel cleaning robot manufacturer India",
    "solar panel cleaning robot price",
    "solar panel cleaning robot cost",
    "buy solar panel cleaning robot",
    "solar panel cleaning robot for solar farm",
    "utility scale solar panel cleaning robot",
    "waterless solar panel cleaning robot",
    "robotic solar panel cleaner",
    "robotic solar panel cleaning system",
    "AI solar panel cleaning robot",
    "autonomous solar panel cleaning robot",
    "semi-automatic solar panel cleaning robot",
    "single axis tracker solar panel cleaning robot",
    "solar panel cleaning robot company India",
    "Taypro solar cleaning robot",
    "Taypro Model-A",
    "Taypro Model-B",
    "Taypro Model-T",
    "solar panel cleaning service India",
    "solar panel cleaning OPEX",
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
      "Automatic, semi-automatic and tracker-ready Solar Panel Cleaning Robots with waterless cleaning, AI scheduling and 72-hour pan-India service.",
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
