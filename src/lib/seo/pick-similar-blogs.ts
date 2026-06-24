import type { DynamicBlog } from "@/app/api/blog/list/route";
import {
  calculateBlogSimilarity,
  type BlogSimilarityInput,
} from "@/lib/seo/blog-similarity-scoring";

/** Pick up to `limit` related posts by keyword similarity (server-side). */
export function pickSimilarBlogs(
  current: BlogSimilarityInput & { slug: string },
  candidates: DynamicBlog[],
  limit = 5
): DynamicBlog[] {
  const pool = candidates.filter((b) => b.slug !== current.slug);
  if (pool.length === 0) return [];

  const scored = pool
    .map((blog) => ({
      blog,
      score: calculateBlogSimilarity(current, blog),
      publishDate: new Date(blog.publishDate).getTime(),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.publishDate - a.publishDate;
    });

  const picked = scored.slice(0, limit).map((row) => row.blog);

  if (picked.length >= limit) return picked;

  const pickedSlugs = new Set(picked.map((b) => b.slug));
  const recent = pool
    .filter((b) => !pickedSlugs.has(b.slug))
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    )
    .slice(0, limit - picked.length);

  return [...picked, ...recent];
}
