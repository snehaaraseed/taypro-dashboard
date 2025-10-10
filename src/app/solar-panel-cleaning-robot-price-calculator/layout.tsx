import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI Calculator | Taypro – Estimate Your Solar Cleaning Robot Savings",
  description: "Calculate how much Solar power saves significant costs.",
  keywords: "sitemap-xml, sitemap taypro, taypro",
  openGraph: {
    title:
      "ROI Calculator | Taypro – Estimate Your Solar Cleaning Robot Savings",
    description: "Calculate how much Solar power saves significant costs.",
    url: "http://localhost:3000/solar-panel-cleaning-robot-price-calculator",
    type: "website",
  },
};

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
