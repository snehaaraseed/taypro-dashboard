import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Contact Taypro - Get Your Solar Panel Cleaning Robot Quote",
  description:
    "Contact Taypro for solar panel cleaning robot quotes. Waterless autonomous and semi-automatic platforms for utility-scale plants in India—field-validated dust removal per cycle (site-dependent). Pan-India commissioning and support.",
  keywords: [
    "Solar Panel Cleaning Robot",
    "contact Taypro",
    "solar panel cleaning robot quote",
    "automatic solar panel cleaning robot",
    "semi-automatic solar panel cleaning robot",
    "solar cleaning robot contact",
    "taypro contact",
    "solar panel cleaning service",
  ],
  openGraph: {
    title: "Contact Taypro - Get Your Solar Panel Cleaning Robot Quote",
    description:
      "Contact Taypro for solar panel cleaning robot solutions. Waterless robotic cleaning with site-dependent dust removal and generation recovery—get a quote for your plant.",
    url: `${siteUrl}/contact`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Contact Taypro for Solar Panel Cleaning Robot Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Taypro - Get Your Solar Panel Cleaning Robot Quote",
    description:
      "Get a quote for Taypro solar panel cleaning robots—autonomous and semi-automatic waterless platforms for utility-scale plants in India.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
