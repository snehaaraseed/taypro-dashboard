import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/sitemap-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/blog/add", "/blog/db/", "/_next/data/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
