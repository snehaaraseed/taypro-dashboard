import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Service: TAYPRO OPEX | Taypro",
  description:
    "Solar Panel Cleaning Service by Taypro, a solar cleaning company. We depoly range of robots for automatic, waterless and efficent ROI Power Cleaning Service. Call us today.",
  keywords:
    "solar panel cleaning service, environmental sustainability, solar panel safety, efficient cleaning, cost effective, taypro",
  openGraph: {
    title: "Solar Panel Cleaning Service: TAYPRO OPEX | Taypro",
    description:
      "Solar Panel Cleaning Service by Taypro, a solar cleaning company. We depoly range of robots for automatic, waterless and efficent ROI Power Cleaning Service. Call us today.",
    url: "https://taypro-dashboard.vercel.app/solar-robots/solar-panel-cleaning-service",
    type: "website",
  },
};

export default function CleaningServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
