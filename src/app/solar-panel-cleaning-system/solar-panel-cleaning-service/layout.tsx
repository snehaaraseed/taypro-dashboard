import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title:
    "Taypro OPEX | Robotic Solar Panel Cleaning Service — Pay Per Panel Cleaned | Taypro",
  description:
    "Taypro OPEX is a monthly robotic solar panel cleaning service for utility-scale plants (typically 50 MW+). We deploy Model-A, Model-B or Model-T as needed, recommend 3–10 waterless dry cycles per month from a full plant soiling study, and bill only for panels cleaned. Includes cleaning SOPs, robot paths, idle/rest zones, dedicated parking, and daily reports via Taypro Console.",
  keywords: [
    "Taypro OPEX",
    "solar panel cleaning service",
    "robotic solar panel cleaning service",
    "OPEX solar cleaning India",
    "pay per panel solar cleaning",
    "monthly solar panel cleaning service",
    "utility scale solar cleaning service",
    "solar farm cleaning service India",
    "waterless solar cleaning service",
    "automatic solar panel cleaning service",
    "solar panel cleaning robot service",
    "solar plant soiling study",
    "solar O&M cleaning contract",
    "TAYPRO Private Limited solar cleaning",
    "50 MW solar plant cleaning",
    "dry solar panel cleaning cycles",
    "solar panel cleaning service price India",
    "robotic solar O&M service",
  ],
  openGraph: {
    title:
      "Taypro OPEX | Robotic Solar Panel Cleaning Service — Pay Per Panel Cleaned",
    description:
      "Monthly waterless robotic cleaning: plant-specific 3–10 cycles, detailed cleaning plans, daily reports, billing per panels cleaned. Model-A, B or T.",
    url: `${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`,
        width: 1200,
        height: 630,
        alt: "Taypro OPEX robotic solar panel cleaning service at utility-scale solar plant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taypro OPEX | Robotic Solar Panel Cleaning Service",
    description:
      "Pay per panel cleaned monthly. Plant study, 3–10 dry cycles, SOPs, paths, rest zones, Taypro Console reports.",
    images: [`${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`,
  },
};

export default function CleaningServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
