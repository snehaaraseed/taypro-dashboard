/** Normalize a URL path for alias lookup and fuzzy matching. */
export function normalizePath(path: string): string {
  let normalized = path.trim();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // keep raw path when percent-encoding is invalid
  }

  normalized = normalized.toLowerCase().replace(/\\/g, "/");
  normalized = normalized.replace(/\/+/g, "/");
  normalized = normalized.replace(/_/g, "-");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

/** Normalize a slug segment (blog/project). */
export function normalizeSlug(slug: string): string {
  return normalizePath(`/${slug}`).slice(1);
}
