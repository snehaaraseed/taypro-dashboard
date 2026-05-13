import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  // Primary intent: "Automatic Solar Panel Cleaning Robot" (waterless, autonomous).
  // Title omits trailing "| Taypro" because the root layout template appends it.
  title:
    "Automatic Solar Panel Cleaning Robot — Taypro Model-A (Waterless, AI)",
  description:
    "Taypro Model-A is a fully autonomous, waterless Automatic Solar Panel Cleaning Robot. AI/ML dual-pass dry cleaning removes 99%+ dust per cycle, runs up to 3,600 modules per charge, connects to Taypro Console via LTE / Wi-Fi / RF mesh / LoRa / LoRaWAN, and is TÜV NORD certified with same-day pan-India breakdown support.",
  keywords: [
    "automatic solar panel cleaning robot",
    "automatic solar panel cleaning robot India",
    "automatic solar panel cleaning robot manufacturer",
    "automatic solar panel cleaning robot price",
    "automatic solar panel cleaning robot cost",
    "buy automatic solar panel cleaning robot",
    "best automatic solar panel cleaning robot",
    "automatic solar panel cleaning system",
    "fully automatic solar panel cleaning robot",
    "autonomous solar panel cleaning robot",
    "waterless automatic solar panel cleaning robot",
    "dual pass automatic solar cleaning robot",
    "fixed tilt automatic solar cleaning robot",
    "AI automatic solar panel cleaning robot",
    "TÜV NORD certified solar cleaning robot",
    "Taypro Model-A",
  ],
  openGraph: {
    title:
      "Automatic Solar Panel Cleaning Robot — Taypro Model-A (Waterless, AI)",
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
      "Automatic Solar Panel Cleaning Robot — Taypro Model-A (Waterless, AI)",
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
