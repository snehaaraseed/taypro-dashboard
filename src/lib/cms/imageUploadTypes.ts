/** Upload destination, drives filename prefix and compression profile. */
export const UPLOAD_CONTEXTS = {
  "blog-featured": { prefix: "blog-featured", maxWidth: 1920, quality: 80 },
  "blog-inline": { prefix: "blog-inline", maxWidth: 1400, quality: 78 },
  "blog-generated-hero": { prefix: "blog-hero", maxWidth: 1920, quality: 82 },
  "blog-generated-inline": { prefix: "blog-inline", maxWidth: 1400, quality: 78 },
  "project-hero": { prefix: "project-hero", maxWidth: 1920, quality: 80 },
  "project-inline": { prefix: "project-inline", maxWidth: 1400, quality: 78 },
  "author-avatar": { prefix: "author-avatar", maxWidth: 512, quality: 82 },
  general: { prefix: "upload", maxWidth: 1920, quality: 80 },
} as const;

export type UploadContext = keyof typeof UPLOAD_CONTEXTS;

const CONTEXT_SET = new Set<string>(Object.keys(UPLOAD_CONTEXTS));

export function isUploadContext(value: string): value is UploadContext {
  return CONTEXT_SET.has(value);
}

/** Blog images from Imagen / Pollinations: strip embedded provenance before publish. */
export function isAiGeneratedUploadContext(context: UploadContext): boolean {
  return context === "blog-generated-hero" || context === "blog-generated-inline";
}

/** Slug-safe label for filenames (lowercase, hyphenated). */
export function sanitizeUploadLabel(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  );
}

/** Basename without extension, e.g. `blog-featured-solar-tips-1734567890123`. */
export function buildUploadFileName(
  context: UploadContext,
  label: string
): string {
  const prefix = UPLOAD_CONTEXTS[context].prefix;
  const slug = sanitizeUploadLabel(label);
  return `${prefix}-${slug}-${Date.now()}`;
}

/** Client-side slug from title (matches server createSlug). */
export function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
