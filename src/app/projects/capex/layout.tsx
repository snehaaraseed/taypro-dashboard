import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Capex - Taypro Solar Projects`,
  description:
    "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
  keywords:
    "taypro projects, solar projects, automatic, semi-automatic, capex, energy industry",
  openGraph: {
    title: `Capex - Taypro Solar Projects`,
    description:
      "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
    url: `https://taypro.com/projects/capex`,
  },
};

export default function CapexProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
