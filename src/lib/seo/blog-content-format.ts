import "server-only";

export type BlogContentFormat = "standard" | "narrative";

const DEFAULT_NARRATIVE_SHARE = 0.25;

export function getBlogNarrativeFormatShare(): number {
  const raw = process.env.BLOG_NARRATIVE_FORMAT_SHARE?.trim();
  const parsed = raw ? Number.parseFloat(raw) : DEFAULT_NARRATIVE_SHARE;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_NARRATIVE_SHARE;
  return Math.min(0.5, parsed);
}

/** 25% narrative by default; explicit override wins. */
export function pickBlogContentFormat(
  explicit?: BlogContentFormat | null
): BlogContentFormat {
  if (explicit === "narrative" || explicit === "standard") {
    return explicit;
  }
  return Math.random() < getBlogNarrativeFormatShare() ? "narrative" : "standard";
}

export function isNarrativeBlogFormat(
  format?: BlogContentFormat | null
): boolean {
  return format === "narrative";
}
