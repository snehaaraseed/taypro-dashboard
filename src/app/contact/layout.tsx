import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Contact Taypro - Get Your Solar Panel Cleaning Robot Quote",
  description:
    "Contact Taypro for advanced Solar Panel Cleaning Robot solutions. Our innovative robotic cleaning systems deliver up to 99% cleaning efficiency, maximize energy generation, and ensure high ROI for your solar assets. Get a quote today!",
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
      "Contact Taypro for advanced Solar Panel Cleaning Robot solutions. Our robotic systems deliver 99% cleaning efficiency and maximize energy generation.",
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
      "Get a quote for our advanced Solar Panel Cleaning Robot solutions. 99% cleaning efficiency guaranteed.",
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
