const BRAND_SUFFIX = "| Taypro";
const BRAND_SUFFIX_RE = /\s*\|\s*Taypro\s*$/i;

/** Strip trailing "| Taypro" so layout template or formatBrandTitle does not double-brand. */
export function normalizePageTitle(title: string): string {
  return title.trim().replace(BRAND_SUFFIX_RE, "").trim();
}

/** Primary SERP title with single Taypro suffix (use with title.absolute when needed). */
export function formatBrandTitle(segment: string): string {
  const base = normalizePageTitle(segment);
  return base ? `${base} | Taypro` : "Taypro";
}

export function hasBrandSuffix(title: string): boolean {
  return BRAND_SUFFIX_RE.test(title.trim());
}
