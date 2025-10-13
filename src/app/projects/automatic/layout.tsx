import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Automatic - Taypro Solar Projects`,
  description:
    "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
  keywords:
    "taypro projects, solar projects, automatic, semi-automatic, capex, energy industry",
  openGraph: {
    title: `Automatic - Taypro Solar Projects`,
    description:
      "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
    url: `https://taypro.com/projects/automatic`,
  },
};

export default function AutomaticProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
