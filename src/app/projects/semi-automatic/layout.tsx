import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Semi-Automatic Solar Panel Cleaning Robot Projects | Taypro",
  description:
    "Explore Taypro's semi-automatic Solar Panel Cleaning Robot installation projects. Cost-effective pick-and-place robotic cleaning systems with fastest ROI for solar farms.",
  keywords: [
    "Semi-Automatic Solar Panel Cleaning Robot projects",
    "semi-automatic solar cleaning robot installations",
    "pick-and-place solar panel cleaning robot",
    "cost-effective solar cleaning robot",
    "Taypro semi-automatic robot projects",
    "Model-B solar cleaning robot projects",
  ],
  openGraph: {
    title: "Semi-Automatic Solar Panel Cleaning Robot Projects | Taypro",
    description:
      "Semi-automatic Solar Panel Cleaning Robot installation projects with pick-and-place robotic cleaning systems.",
    url: `${siteUrl}/projects/semi-automatic`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Semi-Automatic Solar Panel Cleaning Robot Projects by Taypro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Semi-Automatic Solar Panel Cleaning Robot Projects | Taypro",
    description: "Semi-automatic Solar Panel Cleaning Robot installation projects.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/projects/semi-automatic`,
  },
};

export default function SemiautomaticProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
