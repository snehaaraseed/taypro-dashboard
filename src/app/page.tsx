import HomePage from "./home/page";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
  description:
    "Taypro manufactures the best Solar Panel Cleaning Robots for solar farms in India. Our autonomous, waterless Solar Panel Cleaning Robot increases efficiency up to 30% with AI-powered scheduling. Get highest uptime guarantee and ROI.",
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
      "Taypro manufactures the best Solar Panel Cleaning Robots for solar farms. Our autonomous, waterless Solar Panel Cleaning Robot increases efficiency up to 30% with AI-powered scheduling.",
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
      "Autonomous, waterless Solar Panel Cleaning Robots for solar farms. Increase efficiency up to 30% with AI-powered robotic cleaning systems.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Home() {
  return <HomePage />;
}
