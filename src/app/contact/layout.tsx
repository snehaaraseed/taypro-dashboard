import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Reach out to us and let's contribute together.",
  description:
    "Reach out to Taypro for Solar Power Plant Cleaning Services. We deliver high ROI and 99% cleaning efficiency.",
  keywords:
    "solar panel cleaning robots, contact taypro, email, automatic solar robot, semi-automatic solar robot, taypro",
  openGraph: {
    title: "Taypro - Reach out to us and let's contribute together.",
    description:
      "Reach out to Taypro for Solar Power Plant Cleaning Services. We deliver high ROI and 99% cleaning efficiency.",
    url: "https://taypro.com/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
