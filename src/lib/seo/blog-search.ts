import type { DynamicBlog } from "@/app/api/blog/list/route";

/** Normalize for case-insensitive blog title/description/slug search. */
function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

/** Filter published blogs by `?q=` search (title, description, slug, seo keyword). */
export function filterBlogsByQuery(
  blogs: DynamicBlog[],
  rawQuery: string | undefined
): DynamicBlog[] {
  const query = normalizeQuery(rawQuery ?? "");
  if (!query) return blogs;

  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return blogs;

  return blogs.filter((blog) => {
    const haystack = [
      blog.title,
      blog.description,
      blog.slug,
      blog.seoKeyword,
      blog.author,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });
}

export function parseBlogSearchQuery(
  raw: string | string[] | undefined
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

/** Build `?page=2&q=foo` suffix for blog list canonicals. */
export function blogListQuerySuffix(
  page: number,
  searchQuery?: string
): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (searchQuery?.trim()) params.set("q", searchQuery.trim());
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
