import { listAllBlogs } from "@/lib/cms/blogService";
import { DynamicBlog } from "../api/blog/list/route";

export async function getAllBlogsForSimilar(): Promise<DynamicBlog[]> {
  try {
    const rows = await listAllBlogs(false);
    return rows.map((metadata) => ({
      ...metadata,
      href: `/blog/${metadata.slug}`,
      source: "db" as const,
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}
