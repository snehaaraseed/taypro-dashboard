import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Yadgir Solar Project – 50 MW",
  description:
    "TAYPRO deployed 96 fully automatic waterless cleaning robot and 19 semi-automatic robots at the Yadgir Solar Project Karnataka. The objective was to achieve optimal solar panel efficiency and a consistent performance ratio.",
  keywords:
    "soyegaon solar, soyegaon maharashtra, taypro solar projects, solar panel efficiency, power generation, cutting-edge technology",
  openGraph: {
    title: `Taypro - Yadgir Solar Project`,
    description:
      "TAYPRO deployed 96 fully automatic waterless cleaning robot and 19 semi-automatic robots at the Yadgir Solar Project Karnataka. The objective was to achieve optimal solar panel efficiency and a consistent performance ratio.",
    url: `https://taypro-dashboard.vercel.app/projects/yadgir-solar-project`,
    type: "website",
  },
};

export default function YadgirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
