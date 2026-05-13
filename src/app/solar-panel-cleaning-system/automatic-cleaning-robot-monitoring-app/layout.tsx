import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  // Primary intent: "Solar cleaning robot fleet monitoring software" / "solar O&M portal".
  // Root layout uses title.template "%s | Taypro" — do not append "| Taypro" here.
  title:
    "Solar Cleaning Robot Fleet Monitoring Software — Taypro Console",
  description:
    "Taypro Console is the secure web portal for monitoring and managing Taypro Solar Panel Cleaning Robot fleets: site dashboards, weather-aware scheduling, block-wise coverage, cleaning logs and exportable reports, gateway and robot health, statistics, support tickets, and role-based access — provisioned privately for each customer.",
  keywords: [
    "solar cleaning robot fleet monitoring software",
    "solar O&M portal",
    "solar O&M cleaning reports",
    "solar panel cleaning robot monitoring",
    "solar cleaning robot fleet management",
    "robotic solar cleaning dashboard",
    "solar panel cleaning robot control portal",
    "solar farm robot monitoring India",
    "cleaning robot scheduling software",
    "solar robot telemetry dashboard",
    "autonomous solar cleaning monitoring",
    "weather-aware solar cleaning scheduling",
    "solar plant cleaning analytics",
    "Taypro Console",
    "Taypro fleet portal",
  ],
  openGraph: {
    siteName: "Taypro",
    title:
      "Solar Cleaning Robot Fleet Monitoring Software — Taypro Console",
    description:
      "Fleet dashboards, schedules, logs, statistics, tickets, and secure robot oversight for Taypro cleaning robots.",
    url: `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-dashboard.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Console — solar cleaning robot fleet monitoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taypro Console — Solar Cleaning Robot Fleet Monitoring",
    description:
      "Secure web portal for Taypro robot fleets: dashboards, schedules, reports, and support.",
    images: [`${siteUrl}/tayproasset/taypro-dashboard.png`],
  },
  alternates: {
    canonical: `${siteUrl}/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app`,
  },
};

export default function TayproConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
