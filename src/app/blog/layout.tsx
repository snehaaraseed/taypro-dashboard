import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Taypro Blog – Expert Articles on Solar Panel Cleaning Robot",
  description:
    "Discover expert insights on Solar Panel Cleaning Robot technology, solar automation, sustainability, and smart cleaning solutions. Learn about automatic and semi-automatic solar panel cleaning robots.",
  keywords: [
    "Solar Panel Cleaning Robot",
    "solar panel cleaning robot blog",
    "solar panel cleaning robot articles",
    "solar panel cleaning automation",
    "automatic solar panel cleaning robot",
    "semi-automatic solar panel cleaning robot",
    "solar robot technology",
    "solar energy maintenance",
    "taypro",
    "blogs",
    "articles",
    "energy resources",
  ],
  openGraph: {
    title: "Taypro Blog – Expert Articles on Solar Panel Cleaning Robot",
    description:
      "Expert insights on Solar Panel Cleaning Robot technology, solar automation, and smart cleaning solutions for solar farms.",
    url: `${siteUrl}/blog`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Panel Cleaning Robot Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taypro Blog – Expert Articles on Solar Panel Cleaning Robot",
    description:
      "Expert insights on Solar Panel Cleaning Robot technology and solar automation.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
};

export default function TayproBlog({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
