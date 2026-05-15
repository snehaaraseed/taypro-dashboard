import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Taypro Solar Projects - Solar Panel Cleaning Robot Installations",
  description:
    "Explore Taypro utility-scale solar projects with autonomous and semi-automatic cleaning robots across India—field deployments with site-dependent soiling recovery and O&M outcomes.",
  keywords: [
    "Solar Panel Cleaning Robot projects",
    "solar panel cleaning robot installations",
    "solar projects with cleaning robots",
    "sustainable solar energy projects",
    "Taypro solar panel cleaning robot",
    "solar farm cleaning projects",
    "robotic solar cleaning installations",
    "solar panel maintenance projects",
    "taypro projects",
    "maximum power generation",
  ],
  openGraph: {
    title: "Taypro Solar Projects - Solar Panel Cleaning Robot Installations",
    description:
      "Taypro solar projects with robotic dry cleaning—utility-scale installations across India with measurable O&M outcomes (site-dependent).",
    url: `${siteUrl}/projects`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-project.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Projects with Solar Panel Cleaning Robot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taypro Solar Projects - Solar Panel Cleaning Robot Installations",
    description:
      "Utility-scale solar projects using Taypro cleaning robots—autonomous and semi-automatic deployments across India.",
    images: [`${siteUrl}/tayproasset/taypro-project.png`],
  },
  alternates: {
    canonical: `${siteUrl}/projects`,
  },
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
