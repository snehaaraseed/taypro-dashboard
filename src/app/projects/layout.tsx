import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Taypro Solar Projects - Solar Panel Cleaning Robot Installations",
  description:
    "Explore Taypro's sustainable solar projects using our Solar Panel Cleaning Robot systems. We deliver high ROI and 99% cleaning efficiency. See how our robotic cleaning solutions enhance solar panel performance ratio across India.",
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
      "Explore Taypro's sustainable solar projects using our Solar Panel Cleaning Robot systems. 99% cleaning efficiency with high ROI.",
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
      "Sustainable solar projects with Solar Panel Cleaning Robot systems. 99% cleaning efficiency.",
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
