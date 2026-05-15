import { BLOG_LIST_PAGE_SIZE } from "./sitemap-config";

export { BLOG_LIST_PAGE_SIZE };

/** Absolute URL for a blog index page (page 1 = /blog without query). */
export function blogListPageUrl(siteUrl: string, page: number): string {
  const base = siteUrl.replace(/\/$/, "");
  if (page <= 1) return `${base}/blog`;
  return `${base}/blog?page=${page}`;
}

/** Relative href for in-app pagination links. */
export function blogListPagePath(page: number): string {
  if (page <= 1) return "/blog";
  return `/blog?page=${page}`;
}

export function blogListPaginationLinks(
  siteUrl: string,
  page: number,
  totalPages: number
): { previous?: string; next?: string } {
  const links: { previous?: string; next?: string } = {};
  if (page > 1) links.previous = blogListPageUrl(siteUrl, page - 1);
  if (page < totalPages) links.next = blogListPageUrl(siteUrl, page + 1);
  return links;
}
