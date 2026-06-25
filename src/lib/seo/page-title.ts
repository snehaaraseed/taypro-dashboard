const BRAND_SUFFIX = "| Taypro";
const BRAND_SUFFIX_RE = /\s*\|\s*Taypro\s*$/i;
const BRAND_WITH_SPACES = ` ${BRAND_SUFFIX}`;

export const SERP_TITLE_MAX = 60;

/** Strip trailing "| Taypro" so layout template or formatBrandTitle does not double-brand. */
export function normalizePageTitle(title: string): string {
  return title.trim().replace(BRAND_SUFFIX_RE, "").trim();
}

/**
 * Trim a title segment for SERP display without cutting mid-word when possible.
 * When includeBrand is true, reserves room for the " | Taypro" suffix.
 */
export function trimSerpTitle(
  segment: string,
  options?: { includeBrand?: boolean; max?: number }
): string {
  const includeBrand = options?.includeBrand !== false;
  const maxTotal = options?.max ?? SERP_TITLE_MAX;
  const maxBase = includeBrand
    ? maxTotal - BRAND_WITH_SPACES.length
    : maxTotal;

  const normalized = normalizePageTitle(segment).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxBase) return normalized;

  const slice = normalized.slice(0, maxBase);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxBase * 0.6) {
    return `${slice.slice(0, lastSpace).trim()}…`;
  }
  return `${slice.trim()}…`;
}

/** Primary SERP title with single Taypro suffix (use with title.absolute when needed). */
export function formatBrandTitle(segment: string): string {
  const base = trimSerpTitle(segment, { includeBrand: true });
  return base ? `${base}${BRAND_WITH_SPACES}` : "Taypro";
}

export function hasBrandSuffix(title: string): boolean {
  return BRAND_SUFFIX_RE.test(title.trim());
}
