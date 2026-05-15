import HomePage from "./home/page";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

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
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Panel Cleaning Robot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robot | Taypro",
    description:
      "Autonomous and semi-automatic waterless solar panel cleaning robots for utility-scale solar farms in India.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  return <HomePage />;
}
