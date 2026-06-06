import "server-only";

/**
 * Product-focused posts use the Taypro asset library (real robots, projects, OG presets).
 * Educational / O&M / soiling posts without a product angle use Pollinations (free tier + daily pollen).
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

function pollinationsImageEnabled(): boolean {
  return Boolean(process.env.POLLINATIONS_API_KEY?.trim());
}

function paidImagenEnabled(): boolean {
  return process.env.BLOG_IMAGE_ALLOW_PAID?.trim() === "true";
}

function aiHeroGenerationAvailable(): boolean {
  return pollinationsImageEnabled() || paidImagenEnabled();
}

/**
 * Default: `library` when no AI credentials.
 * With `POLLINATIONS_API_KEY`, defaults to `hybrid` (Pollinations for O&M posts, library for robot/product).
 * Set `BLOG_IMAGE_MODE=library` to force Taypro assets only.
 * Set `BLOG_IMAGE_MODE=generate` to AI-generate every hero (uses pollen on all posts).
 * `BLOG_IMAGE_ALLOW_PAID=true` additionally enables Google Imagen when provider=imagen.
 */
export function getBlogImageMode(): "hybrid" | "library" | "generate" {
  const explicit = process.env.BLOG_IMAGE_MODE?.trim().toLowerCase();

  if (explicit === "library") return "library";

  if (explicit === "generate") {
    return aiHeroGenerationAvailable() ? "generate" : "library";
  }

  if (explicit === "hybrid") {
    return aiHeroGenerationAvailable() ? "hybrid" : "library";
  }

  // Unset BLOG_IMAGE_MODE: auto-hybrid when Pollinations key is configured.
  if (pollinationsImageEnabled()) return "hybrid";

  return "library";
}
