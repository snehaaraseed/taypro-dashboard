/** Canonical utility-scale project hero used on projects, state landings, and OG. */
export const PROJECT_HERO_IMAGE_PATH = "/tayprobglayout/taypro-project.png";

/** Skip Next.js image optimizer for external URLs and CMS uploads (pre-sized WebP; avoids 502 on large legacy files). */
export function shouldServeImageUnoptimized(src: string): boolean {
  if (!src) return false;
  return (
    src.startsWith("http") ||
    src.startsWith("//") ||
    src.startsWith("/uploads/")
  );
}
