import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/seo/build-sitemap";

/** Regenerate from CMS on every request (admin publish also calls revalidateSitemap). */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
