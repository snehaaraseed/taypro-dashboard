import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Robot ROI Calculator | Taypro – Estimate Your Savings",
  description:
    "Calculate your potential savings with Taypro's Solar Panel Cleaning Robot ROI Calculator. Discover how our solar panel cleaning robots can boost efficiency up to 30%, reduce maintenance costs, and maximize your solar power output. Get an instant estimate!",
  keywords: [
    "Solar Panel Cleaning Robot ROI calculator",
    "solar panel cleaning robot price calculator",
    "solar cleaning robot ROI",
    "solar panel cleaning robot cost calculator",
    "calculate solar cleaning robot savings",
    "solar panel cleaning robot investment ROI",
    "automatic solar cleaning robot cost",
    "solar panel cleaning efficiency calculator",
    "taypro ROI calculator",
  ],
  openGraph: {
    title: "Solar Panel Cleaning Robot ROI Calculator | Taypro – Estimate Your Savings",
    description:
      "Calculate potential savings with Taypro's Solar Panel Cleaning Robot ROI Calculator. Boost efficiency up to 30% and reduce costs.",
    url: `${siteUrl}/solar-panel-cleaning-robot-price-calculator`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Panel Cleaning Robot ROI Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robot ROI Calculator | Taypro",
    description:
      "Calculate potential savings with our Solar Panel Cleaning Robot. Boost efficiency up to 30%.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-robot-price-calculator`,
  },
};

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
