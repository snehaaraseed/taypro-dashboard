import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title:
    "Solar Panel Cleaning Robot for Single-Axis Trackers — Model-T | AI, Waterless | Taypro",
  description:
    "Taypro Model-T is an AI- and ML-powered, waterless autonomous Solar Panel Cleaning Robot purpose-built for single-axis tracker solar farms. 99%+ dust removal in a single dual-pass run, cleans up to 3,600 modules per charge, flexes ±15° between tables, Taypro Console via LTE, Wi-Fi, hybrid self-healing RF mesh, LoRa, and LoRaWAN, compatible with NEXTracker and Gamechanger, module tilts -52° to +52°, TÜV NORD certified.",
  keywords: [
    "Solar Panel Cleaning Robot for Single-Axis Trackers",
    "single axis tracker cleaning robot",
    "single-axis tracker solar cleaning robot",
    "tracker solar panel cleaning robot",
    "solar tracker cleaning robot India",
    "tracker farm cleaning automation",
    "NEXTracker cleaning robot",
    "Nextracker solar cleaning robot",
    "Gamechanger tracker cleaning robot",
    "solar panel cleaning robot for trackers India",
    "solar panel cleaning robot price tracker",
    "Model-T solar cleaning robot",
    "Taypro Model-T",
    "autonomous solar panel cleaning robot",
    "AI solar cleaning robot",
    "ML based solar cleaning robot",
    "waterless solar panel cleaning robot",
    "dry solar panel cleaning robot",
    "dual pass solar cleaning robot",
    "cloud monitored solar cleaning robot",
    "remote monitored solar cleaning robot",
    "flexible body solar cleaning robot",
    "tracker bridge solar cleaning",
    "TÜV NORD certified solar cleaning robot",
    "robotic solar O&M India",
    "solar plant performance ratio improvement",
    "soiling loss reduction solar",
    "utility scale tracker plant cleaning",
    "LoRaWAN tracker cleaning robot",
    "RF mesh solar robot fleet",
  ],
  openGraph: {
    title:
      "Solar Panel Cleaning Robot for Single-Axis Trackers — Model-T | AI, Waterless | Taypro",
    description:
      "Autonomous AI-powered Solar Panel Cleaning Robot for single-axis tracker plants. 99%+ dust removal per cycle, up to 3,600 modules per charge, Taypro Console via LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN, NEXTracker & Gamechanger compatible, TÜV NORD certified.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayprorobots/taypro-modelT-img.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T — AI-powered, waterless",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Solar Panel Cleaning Robot for Single-Axis Trackers — Model-T | AI, Waterless | Taypro",
    description:
      "Autonomous Solar Panel Cleaning Robot for tracker plants. 3,600 modules per charge, LTE/Wi-Fi/RF mesh/LoRa/LoRaWAN, NEXTracker & Gamechanger compatible.",
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
