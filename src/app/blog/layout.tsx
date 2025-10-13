import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro Blogs – Expert Articles on Solar Cleaning Robots.",
  description:
    "Discover the Future of Solar Automation, Sustainability, and Smart Cleaning Solutions & reach out to Taypro for solar automation solutions and support.",
  keywords:
    "solar panel cleaning robots, blogs, articles, energy resources, solar robot, taypro",
  openGraph: {
    title: "Taypro Blogs – Expert Articles on Solar Cleaning Robots.",
    description:
      "Discover the Future of Solar Automation, Sustainability, and Smart Cleaning Solutions & reach out to Taypro for solar automation solutions and support.",
    url: "http://localhost:3000/blog",
    type: "website",
  },
};

export default function TayproBlog({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
