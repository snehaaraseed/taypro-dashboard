import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Robot for Single-Axis Trackers | Model-T | Taypro",
  description:
    "Model-T: Autonomous waterless Solar Panel Cleaning Robot purpose-built for single-axis tracker installations. AI-driven scheduling, cloud-based remote monitoring and a flexible 360 degree rotational bridge for utility-scale solar power plants.",
  keywords: [
    "Solar Panel Cleaning Robot for Single-Axis Trackers",
    "single axis tracker cleaning robot",
    "Model-T solar cleaning robot",
    "autonomous solar panel cleaning robot",
    "tracker solar farm cleaning",
    "waterless solar panel cleaning robot",
    "AI solar cleaning robot",
    "cloud monitored cleaning robot",
    "taypro Model-T",
    "robotic solar cleaning",
  ],
  openGraph: {
    title:
      "Solar Panel Cleaning Robot for Single-Axis Trackers | Model-T | Taypro",
    description:
      "Model-T: Autonomous waterless Solar Panel Cleaning Robot for single-axis tracker installations with AI scheduling and cloud monitoring.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayprorobots/taypro-modelT-img.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Solar Panel Cleaning Robot for Single-Axis Trackers | Model-T | Taypro",
    description:
      "Autonomous waterless Solar Panel Cleaning Robot for single-axis tracker installations with AI scheduling and cloud monitoring.",
    images: [`${siteUrl}/tayprorobots/taypro-modelT-img.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers`,
  },
};

export default function ModelTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
