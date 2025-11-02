import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Banda Solar Project - Solar Panel Cleaning Robot Installation | 70 MW | Taypro",
  description:
    "Banda Solar Power Plant: 70 MW project with Taypro Solar Panel Cleaning Robot installation. A total of 160 Solar Panel Cleaning Robots integrated to enhance operational efficiency and achieve exceptional energy generation with high-tech robotic cleaning.",
  keywords: [
    "Banda solar project",
    "Solar Panel Cleaning Robot installation",
    "solar panel cleaning robot project",
    "70 MW solar project",
    "Taypro solar projects",
    "solar panel cleaning robots banda",
    "robotic solar cleaning installation",
    "solar power generation",
    "maximum energy generation",
    "performance drive",
  ],
  openGraph: {
    title: "Banda Solar Project - Solar Panel Cleaning Robot Installation | 70 MW | Taypro",
    description:
      "Banda 70 MW Solar Power Plant with 160 Solar Panel Cleaning Robots installed. Enhanced operational efficiency and exceptional energy generation.",
    url: `${siteUrl}/projects/banda-solar-project`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-project.png`,
        width: 1200,
        height: 630,
        alt: "Banda Solar Project with Solar Panel Cleaning Robot Installation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Banda Solar Project - Solar Panel Cleaning Robot Installation | 70 MW",
    description:
      "70 MW solar project with 160 Solar Panel Cleaning Robots. Enhanced efficiency and exceptional energy generation.",
    images: [`${siteUrl}/tayproasset/taypro-project.png`],
  },
  alternates: {
    canonical: `${siteUrl}/projects/banda-solar-project`,
  },
};

export default function BandaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
