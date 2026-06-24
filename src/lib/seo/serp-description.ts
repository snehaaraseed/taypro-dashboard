export const SERP_DESCRIPTION_MAX = 155;

/**
 * Trim meta descriptions for SERP display without cutting mid-word when possible.
 */
export function trimSerpDescription(
  text: string,
  max = SERP_DESCRIPTION_MAX
): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;

  const slice = normalized.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > max * 0.6) {
    return `${slice.slice(0, lastSpace).trim()}…`;
  }
  return `${slice.trim()}…`;
}
