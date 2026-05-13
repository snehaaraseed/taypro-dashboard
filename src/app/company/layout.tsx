import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "About Taypro | Solar Panel Cleaning Robot Manufacturer in India",
  description:
    "Learn how Taypro Private Limited engineers Made-in-India autonomous solar panel cleaning robots—including Model-A, Model-B, Model-T, Taypro Opex, and Taypro Console—for utility-scale and commercial PV. Vision, leadership, manufacturing scale in Pune, and nationwide service.",
  keywords: [
    "About Taypro",
    "Taypro Private Limited",
    "Solar Panel Cleaning Robot manufacturer India",
    "Made in India solar cleaning robot",
    "autonomous solar panel cleaning",
    "Taypro founders",
    "Taypro team Chakan Pune",
    "robotic solar cleaning company",
    "utility-scale solar O&M",
    "waterless solar panel cleaning",
    "Taypro Console",
  ],
  openGraph: {
    title: "About Taypro | Solar Panel Cleaning Robot Manufacturer in India",
    description:
      "Company story, vision, and leadership behind Taypro’s autonomous and semi-automatic solar cleaning robots, dual-pass waterless technology, and pan-India deployment support.",
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
    title: "About Taypro | Solar Panel Cleaning Robot Manufacturer in India",
    description:
      "Made-in-India solar panel cleaning robots, nationwide warehouses, and cloud fleet monitoring—built for utility-scale asset owners and O&M teams.",
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
