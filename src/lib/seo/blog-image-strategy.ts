import "server-only";

/**
 * Product-focused posts use the Taypro asset library (real robots, projects, OG presets).
 * Educational / O&M / soiling posts without a product angle use Pollinations or Imagen.
 */
export function shouldUseProductLibraryImage(input: {
  title: string;
  description?: string;
  seoKeyword?: string;
  category?: string;
}): boolean {
  const text = [
    input.title,
    input.description ?? "",
    input.seoKeyword ?? "",
    input.category ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const productPatterns = [
    /\bmodel[- ]?[abt]\b/,
    /\btaypro\s+(model|console)\b/,
    /\b(cleaning|panel cleaning)\s+robot\b/,
    /\bsolar panel cleaning robot\b/,
    /\bautomatic solar panel cleaning\b/,
    /\bsemi[- ]?automatic solar\b/,
    /\bwaterless\s+(cleaning\s+)?robot\b/,
    /\bmodel-a\b|\bmodel-b\b|\bmodel-t\b/,
    /\brobotic cleaning service\b/,
    /\bopex\s+(service|cleaning)\b/,
    /\btaypro\s+console\b/,
    /\bbrush\s+vs\.?\s+robot\b/,
    /\brobot\s+vs\.?\s+brush\b/,
    /\brobot\b.*\bmanual\b/,
    /\bmanual\b.*\brobot\b/,
    /\btracker\b.*\b(robot|clean)/,
    /\b(robot|clean).*\btracker\b/,
  ];

  if (productPatterns.some((p) => p.test(text))) {
    return true;
  }

  const category = input.category ?? "";
  if (
    /\brobot models?\b|product features|cleaning methods|technology\b/i.test(
      category
    )
  ) {
    return true;
  }

  return false;
}

export function getBlogImageMode(): "hybrid" | "library" | "generate" {
  const mode = process.env.BLOG_IMAGE_MODE?.trim().toLowerCase();
  if (mode === "library" || mode === "generate") return mode;
  return "hybrid";
}
