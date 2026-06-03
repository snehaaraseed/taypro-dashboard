/** Authors excluded from automation / random blog assignment. */
export const BLOG_AUTHOR_POOL_EXCLUDED_NAMES = new Set([
  "taypro team",
  "taypro",
  "suraj kadam",
]);

export const BLOG_AUTHOR_POOL_EXCLUDED_SLUGS = new Set([
  "taypro-team",
  "suraj-kadam",
]);

export function isEligibleBlogAuthor(author: {
  name: string;
  slug?: string;
}): boolean {
  const normalized = author.name.trim().toLowerCase();
  if (!normalized || BLOG_AUTHOR_POOL_EXCLUDED_NAMES.has(normalized)) {
    return false;
  }
  if (author.slug && BLOG_AUTHOR_POOL_EXCLUDED_SLUGS.has(author.slug)) {
    return false;
  }
  return true;
}
