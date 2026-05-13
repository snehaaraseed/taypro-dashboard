import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Semi-Automatic Solar Panel Cleaning Robot | Model-B | Taypro",
  description:
    "Model-B: Semi-automatic, pick-and-place Solar Panel Cleaning Robot for fixed tilt, seasonal tilt and horizontal single-axis trackers. Waterless cleaning, long battery life, scratch-free microfiber technology, and the fastest ROI for utility-scale solar power plants.",
  keywords: [
    "Semi-Automatic Solar Panel Cleaning Robot",
    "solar panel cleaning robot",
    "Model-B solar cleaning robot",
    "pick and place solar cleaning robot",
    "portable solar panel cleaning robot",
    "waterless solar panel cleaning robot",
    "fixed tilt solar cleaning",
    "seasonal tilt solar cleaning",
    "taypro semi-automatic robot",
    "solar farm cleaning",
  ],
  openGraph: {
    title: "Semi-Automatic Solar Panel Cleaning Robot | Model-B | Taypro",
    description:
      "Model-B: Pick-and-place Solar Panel Cleaning Robot with waterless cleaning, scratch-free microfiber and fastest ROI. Perfect for fixed tilt and seasonal tilt plants.",
    url: `${siteUrl}/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayprorobots/taypro-modelBcopy.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Semi-Automatic Solar Panel Cleaning Robot Model-B",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Semi-Automatic Solar Panel Cleaning Robot | Model-B | Taypro",
    description:
      "Pick-and-place Solar Panel Cleaning Robot with waterless cleaning, scratch-free microfiber and fastest ROI.",
    images: [`${siteUrl}/tayprorobots/taypro-modelBcopy.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system`,
  },
};

export default function SemiAutomaticRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
