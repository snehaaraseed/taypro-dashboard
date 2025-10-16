import HomePage from "./home/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro is a Solar Panel Cleaning Company.",
  description:
    "Taypro is a Solar Panel Cleaning Company. We provide end to end ROI Solar Cleaning Service to improve Solar Plant Efficiency.",
  keywords:
    "solar panel cleaning robots, automatic solar robot, semi-automatic solar robots, capex, opex, cleaning robots, taypro",
  openGraph: {
    title: "Taypro is a Solar Panel Cleaning Company",
    description:
      "Taypro is a Solar Panel Cleaning Company. We provide end to end ROI Solar Cleaning Service to improve Solar Plant Efficiency.",
    url: "https://taypro-dashboard.vercel.app/",
    type: "website",
  },
};

export default function Home() {
  return <HomePage />;
}
