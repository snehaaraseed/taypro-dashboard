import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Automatic Solar Panel Cleaning Robot | Model-A | Taypro",
  description:
    "Model-A: Fully automatic Solar Panel Cleaning Robot with AI-enabled technology. Removes up to 100% dust and debris. Autonomous waterless cleaning for utility-scale solar power plants. Highest efficiency robotic cleaning system.",
  keywords: [
    "Automatic Solar Panel Cleaning Robot",
    "solar panel cleaning robot",
    "automatic solar panel cleaning robot",
    "Model-A solar cleaning robot",
    "AI-enabled solar panel cleaning",
    "autonomous solar cleaning robot",
    "waterless solar panel cleaning robot",
    "utility scale solar cleaning",
    "taypro automatic robot",
    "solar farm cleaning automation",
  ],
  openGraph: {
    title: "Automatic Solar Panel Cleaning Robot | Model-A | Taypro",
    description:
      "Model-A: Fully automatic Solar Panel Cleaning Robot with AI technology. Removes 100% dust, autonomous waterless cleaning for utility-scale solar plants.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Automatic Solar Panel Cleaning Robot Model-A",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Automatic Solar Panel Cleaning Robot | Model-A | Taypro",
    description:
      "Fully automatic AI-enabled Solar Panel Cleaning Robot for utility-scale solar farms. Waterless cleaning with highest efficiency.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system`,
  },
};

export default function AutomaticRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
