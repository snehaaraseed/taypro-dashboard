import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  // Primary intent: "Solar Panel Cleaning Robot for Single-Axis Trackers".
  // Title omits trailing "| Taypro" because the root layout template appends it.
  title:
    "Solar Panel Cleaning Robot for Single-Axis Trackers — Taypro Model-T",
  description:
    "Taypro Model-T is an AI- and ML-powered, waterless autonomous Solar Panel Cleaning Robot purpose-built for single-axis tracker solar farms. 99%+ dust removal per dual-pass run, up to 3,600 modules per charge, ±15° flex between tables, NEXTracker and Gamechanger compatible (-52° to +52° module tilt), TÜV NORD certified.",
  keywords: [
    "solar panel cleaning robot for single-axis trackers",
    "single axis tracker cleaning robot",
    "tracker solar panel cleaning robot",
    "solar tracker cleaning robot India",
    "tracker farm cleaning automation",
    "NEXTracker cleaning robot",
    "Nextracker solar cleaning robot",
    "Gamechanger tracker cleaning robot",
    "solar panel cleaning robot for trackers India",
    "utility scale tracker plant cleaning",
    "flexible body solar cleaning robot",
    "tracker bridge solar cleaning",
    "Taypro Model-T",
  ],
  openGraph: {
    title:
      "Solar Panel Cleaning Robot for Single-Axis Trackers — Taypro Model-T",
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
      "Solar Panel Cleaning Robot for Single-Axis Trackers — Taypro Model-T",
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
