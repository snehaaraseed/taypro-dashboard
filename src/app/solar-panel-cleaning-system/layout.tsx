import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Robot | Taypro - Automatic & Semi-Automatic Models",
  description:
    "Taypro's Solar Panel Cleaning Robot offers the highest uptime and ROI for solar farms. Choose from automatic and semi-automatic models with waterless cleaning technology and AI-powered scheduling. Enquire today!",
  keywords: [
    "Solar Panel Cleaning Robot",
    "solar panel cleaning robot",
    "automatic solar panel cleaning robot",
    "semi-automatic solar panel cleaning robot",
    "solar panel cleaning automation",
    "robotic solar panel cleaner",
    "solar farm cleaning robot",
    "waterless solar panel cleaning",
    "autonomous solar cleaning robot",
    "taypro",
    "predictive solar cleaning",
    "battery efficiency",
  ],
  openGraph: {
    title: "Solar Panel Cleaning Robot | Taypro - Automatic & Semi-Automatic Models",
    description:
      "Taypro's Solar Panel Cleaning Robot offers highest uptime and ROI for solar farms. Automatic and semi-automatic models with waterless cleaning and AI-powered scheduling.",
    url: `${siteUrl}/solar-panel-cleaning-system`,
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
      "Automatic and semi-automatic Solar Panel Cleaning Robots with highest uptime guarantee for solar farms.",
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
