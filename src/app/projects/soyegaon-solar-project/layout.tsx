import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Soyegaon Solar Project.",
  description:
    "The Soygaon Solar Project required a solution to maximise the power generation and performance ratio. TAYPRO’s automatic and semi-automatic robots were meticulously deployed to deliver high-speed cleaning for autonomous cleaning for large-scale panel areas.",
  keywords:
    "soyegaon solar, soyegaon maharashtra, taypro solar projects, solar panel efficiency, power generation, cutting-edge technology",
  openGraph: {
    title: `Taypro - Soyegaon Solar Project.`,
    description:
      "The Soygaon Solar Project required a solution to maximise the power generation and performance ratio. TAYPRO’s automatic and semi-automatic robots were meticulously deployed to deliver high-speed cleaning for autonomous cleaning for large-scale panel areas.",
    url: `http://localhost:3000/projects/soyegaon-solar-project`,
    type: "website",
  },
};

export default function SoyegaonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
