import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Reach out to us and let's contribute together.",
  description:
    "Reach out to Taypro for advanced Solar Power Plant Cleaning Services. Our innovative robotic solutions deliver up to 99% cleaning efficiency, maximize energy generation, and ensure a high return on investment for your solar assets",
  keywords:
    "solar panel cleaning robots, contact taypro, email, automatic solar robot, semi-automatic solar robot, taypro",
  openGraph: {
    title: "Taypro - Reach out to us and let's contribute together.",
    description:
      "Reach out to Taypro for advanced Solar Power Plant Cleaning Services. Our innovative robotic solutions deliver up to 99% cleaning efficiency, maximize energy generation, and ensure a high return on investment for your solar assets",
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
