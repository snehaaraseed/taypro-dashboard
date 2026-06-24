/** Blog slugs that 301 to a canonical winner (SEO-020 cannibalization fix). */
export const REDIRECTED_BLOG_SLUGS = new Set([
  "what-is-the-solar-panel-efficiency-in-2025",
]);

export const REDIRECTED_BLOG_TARGETS: Record<string, string> = {
  "what-is-the-solar-panel-efficiency-in-2025":
    "/blog/what-is-solar-panel-efficiency",
};

export function isRedirectedBlogSlug(slug: string): boolean {
  return REDIRECTED_BLOG_SLUGS.has(slug);
}
