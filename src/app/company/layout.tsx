import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "About Taypro - Made-in-India Solar Panel Cleaning Robot Manufacturer",
  description:
    "Taypro is a Made-in-India manufacturer of autonomous Solar Panel Cleaning Robots. Meet the founders, engineering team, and the values behind India's most deployed waterless robotic cleaning systems for utility-scale solar plants.",
  keywords: [
    "About Taypro",
    "Taypro company",
    "Solar Panel Cleaning Robot manufacturer",
    "Made in India solar cleaning robot",
    "Taypro founders",
    "Taypro team",
    "robotic solar cleaning company",
    "utility-scale solar O&M",
  ],
  openGraph: {
    title: "About Taypro - Made-in-India Solar Panel Cleaning Robot Manufacturer",
    description:
      "Meet the team building India's most deployed Solar Panel Cleaning Robots. Made-in-India manufacturing, patented dual-pass waterless cleaning, and pan-India service.",
    url: `${siteUrl}/company`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "About Taypro - Solar Panel Cleaning Robot Manufacturer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Taypro - Solar Panel Cleaning Robot Manufacturer",
    description:
      "Made-in-India manufacturer of autonomous Solar Panel Cleaning Robots. Meet the team behind utility-scale robotic cleaning across India.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/company`,
  },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
