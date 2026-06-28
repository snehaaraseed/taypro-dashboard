import { listAllBlogs } from "@/lib/cms/blogService";
import { canonicalBlogHref } from "@/lib/seo/redirected-blog-slugs";
import { DynamicBlog } from "../api/blog/list/route";

export async function getAllBlogsForSimilar(): Promise<DynamicBlog[]> {
  try {
    const rows = await listAllBlogs(false);
    return rows.map((metadata) => ({
      ...metadata,
      href: canonicalBlogHref(metadata.slug),
      source: "db" as const,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}
