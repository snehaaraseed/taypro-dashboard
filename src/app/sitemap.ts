import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/seo/build-sitemap";

export const revalidate = 86400; // Cache for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
