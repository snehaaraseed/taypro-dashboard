import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Banda Solar Project. Banda Solar Project – 70 MW",
  description:
    "At the Banda Solar Power plant TAYPRO integrated high-tech robotics to enhance the operational efficiency of the plant. A total of 160 solar cleaning robots helped to achieve exceptional energy generation.",
  keywords:
    "banda solar, taypro solar projects, solar panel, power generation, key metrics, maximum energy generation, performance drive",
  openGraph: {
    title: `Taypro - Banda Solar Project. Banda Solar Project – 70 MW`,
    description:
      "At the Banda Solar Power plant TAYPRO integrated high-tech robotics to enhance the operational efficiency of the plant. A total of 160 solar cleaning robots helped to achieve exceptional energy generation.",
    url: `https://taypro-dashboard.vercel.app/projects/agar-solar-project`,
    type: "website",
  },
};

export default function BandaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
