import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title:
    "Automatic Solar Panel Cleaning Robot India | Model-A — Waterless, AI | Taypro",
  description:
    "Automatic Solar Panel Cleaning Robot for utility-scale plants: Taypro Model-A is fully autonomous and waterless. AI/ML dual-pass dry cleaning removes 99%+ dust per cycle, cleans up to 3,600 modules per charge, Taypro Console connectivity via LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, and LoRaWAN, TÜV NORD certified, 72-hour pan-India service.",
  keywords: [
    "Automatic Solar Panel Cleaning Robot",
    "automatic solar panel cleaning robot",
    "automatic solar panel cleaning robot India",
    "automatic solar panel cleaning robot manufacturer",
    "automatic solar panel cleaning robot manufacturer India",
    "automatic solar panel cleaning robot price",
    "automatic solar panel cleaning robot cost",
    "buy automatic solar panel cleaning robot",
    "best automatic solar panel cleaning robot",
    "automatic solar panel cleaning system",
    "automatic solar module cleaning robot",
    "fully automatic solar panel cleaning robot",
    "autonomous solar panel cleaning robot",
    "solar panel cleaning robot",
    "solar panel cleaning robot India",
    "solar panel cleaning robot manufacturer India",
    "utility scale automatic solar cleaning robot",
    "solar farm automatic cleaning robot",
    "robotic solar panel cleaning system",
    "AI automatic solar panel cleaning robot",
    "waterless automatic solar panel cleaning robot",
    "dual pass automatic solar cleaning robot",
    "fixed tilt automatic solar cleaning robot",
    "solar plant performance ratio improvement",
    "soiling loss reduction solar",
    "LoRa solar robot",
    "LoRaWAN solar monitoring",
    "RF mesh solar cleaning robot",
    "TÜV NORD certified solar cleaning robot",
    "taypro Model-A",
    "taypro automatic solar panel cleaning robot",
  ],
  openGraph: {
    title:
      "Automatic Solar Panel Cleaning Robot India | Model-A — Waterless, AI | Taypro",
    description:
      "Taypro Model-A: Automatic Solar Panel Cleaning Robot for utility-scale plants. Autonomous waterless dual-pass cleaning, 99%+ dust removal per cycle, up to 3,600 modules per charge, LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN to Taypro Console, TÜV NORD certified.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Model-A — Automatic Solar Panel Cleaning Robot for utility-scale solar farms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Automatic Solar Panel Cleaning Robot India | Model-A — Waterless, AI | Taypro",
    description:
      "Taypro Model-A Automatic Solar Panel Cleaning Robot: autonomous, waterless, AI-driven. 99%+ dust removal per cycle, up to 3,600 modules per charge, LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN to Taypro Console.",
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
