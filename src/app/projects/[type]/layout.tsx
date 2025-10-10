import type { Metadata } from "next";

interface Props {
  params: { type: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const validTypes = ["automatic", "capex", "semi-automatic"];
  const type = params.type;

  if (!type || !validTypes.includes(type.toLowerCase())) {
    return {
      title: "404 - Project Type Not Found",
      description: "The requested project type was not found.",
    };
  }

  const formattedType =
    type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");

  return {
    title: `${formattedType} - Taypro Solar Projects`,
    description:
      "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
    keywords:
      "taypro projects, solar projects, automatic, semi-automatic, capex, energy industry",
    openGraph: {
      title: `${formattedType} - Taypro Solar Projects`,
      description:
        "Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems.",
      url: `https://taypro.com/${type}`,
      type: "website",
    },
  };
}

export default function ProjectTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
