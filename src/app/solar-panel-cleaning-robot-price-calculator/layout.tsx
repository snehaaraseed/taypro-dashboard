import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro – Estimate Your Solar Cleaning Robot Savings",
  description:
    "Calculate your potential savings with Taypro’s ROI Calculator. Discover how our solar panel cleaning robots can boost efficiency, reduce maintenance costs, and maximize your solar power output.",
  keywords: "sitemap-xml, sitemap taypro, taypro",
  openGraph: {
    title:
      "ROI Calculator | Taypro – Estimate Your Solar Cleaning Robot Savings",
    description:
      "Calculate your potential savings with Taypro’s ROI Calculator. Discover how our solar panel cleaning robots can boost efficiency, reduce maintenance costs, and maximize your solar power output.",
    url: "https://taypro-dashboard.vercel.app/solar-panel-cleaning-robot-price-calculator",
    type: "website",
  },
};

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
