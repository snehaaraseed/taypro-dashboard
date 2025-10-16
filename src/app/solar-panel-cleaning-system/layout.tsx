import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Panel Cleaning Robot | Taypro",
  description:
    "Solar Module Cleaning System by Taypro has highest Uptime and Return on Investment by using Solar Panel Cleaning Robots for efficiency. Enquire Today!",
  keywords:
    "solar panel cleaning robot, automatic solar robot, taypro, predictive solar cleaning, battery efficiency, semi automatic, capex",
  openGraph: {
    title: "Solar Panel Cleaning Robot | Taypro",
    description:
      "Solar Module Cleaning System by Taypro has highest Uptime and Return on Investment by using Solar Panel Cleaning Robots for efficiency. Enquire Today!",
    url: "https://taypro-dashboard.vercel.app/solar-panel-cleaning-system",
    type: "website",
  },
};

export default function CleaningRobotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
