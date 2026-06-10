import type { DynamicBlog } from "@/app/api/blog/list/route";
import { scoreSlugSimilarity } from "@/lib/url-recovery/slug-match";
import { normalizeSlug } from "@/lib/url-recovery/normalize";

/** Rank published blogs by slug similarity when the requested post does not exist. */
export function findSimilarBlogsForMissingSlug(
  inputSlug: string,
  blogs: DynamicBlog[],
  limit = 5
): DynamicBlog[] {
  const needle = normalizeSlug(inputSlug);
  if (!needle) return blogs.slice(0, limit);

  return [...blogs]
    .map((blog) => ({
      blog,
      score: scoreSlugSimilarity(needle, blog.slug),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.blog.publishDate).getTime() -
        new Date(a.blog.publishDate).getTime()
      );
    })
    .slice(0, limit)
    .map((row) => row.blog);
}
