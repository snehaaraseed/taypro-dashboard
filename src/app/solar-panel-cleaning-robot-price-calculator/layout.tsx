import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro solar panel cleaning robot ROI and price calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robot ROI Calculator | Taypro",
    description:
      "Estimate payback and savings for Taypro cleaning robots on your solar plant.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-robot-price-calculator`,
  },
};

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
