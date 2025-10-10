import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Sustainable Projects Disrupting the energy-industry.",
  description:
    "Sustainable Projects Disrupting the energy-industry. We deliver high ROI and 99% cleaning efficiency. The core objective is to ensure regular and efficient cleaning of solar panels and enhance the performance ratio",
  keywords:
    "solar projects, sustainable energy, solar panels, taypro solar plants, maximum power generation",
  openGraph: {
    title: "Taypro - Sustainable Projects Disrupting the energy-industry.",
    description:
      "Sustainable Projects Disrupting the energy-industry. We deliver high ROI and 99% cleaning efficiency. The core objective is to ensure regular and efficient cleaning of solar panels and enhance the performance ratio",
    url: "https://taypro.com/projects",
    type: "website",
  },
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
