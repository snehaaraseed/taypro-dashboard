import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/seo/build-sitemap";

export const revalidate = 86400; // Cache for 24 hours

export async function generateSitemaps() {
  return [
    { id: "static" },
    { id: "blog" },
    { id: "projects" },
    { id: "insights" },
    { id: "press" },
    { id: "authors" },
    { id: "careers" },
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries(id);
}
