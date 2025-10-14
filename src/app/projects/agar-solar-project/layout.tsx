import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro - Agar Solar Project. Agar, Madhya Pradesh – 250 MW",
  description:
    "The Agar 250 MW Solar Project is a breakthrough in generating more power. For the Agar Solar Project, we integrated advanced robotics.",
  keywords:
    "agar solar, taypro solar projects, solar panel, advanced robotics, performance drive",
  openGraph: {
    title: `Taypro - Agar Solar Project. Agar, Madhya Pradesh – 250 MW`,
    description:
      "The Agar 250 MW Solar Project is a breakthrough in generating more power. For the Agar Solar Project, we integrated advanced robotics.",
    url: `https://taypro-dashboard.vercel.app/projects/agar-solar-project`,
    type: "website",
  },
};

export default function AgarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
