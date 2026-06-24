import { STATIC_SITEMAP_ROUTES } from "@/lib/seo/sitemap-config";
import { buildLegacyAliasMap } from "@/lib/seo/legacy-path-redirects";
import { normalizePath } from "@/lib/url-recovery/normalize";

/** Hand-curated aliases — safe, deterministic 301 targets. */
export const MANUAL_ALIASES: Record<string, string> = {
  ...buildLegacyAliasMap(),
  "/contacts": "/contact",
  "/contact-us": "/contact",
  "/contactus": "/contact",
  "/about": "/company",
  "/about-us": "/company",
  "/aboutus": "/company",
  "/blogs": "/blog",
  "/news": "/blog",
  "/sitemap": "/site-map",
  "/site-map.html": "/site-map",
  "/privacy": "/privacy-policy",
  "/terms": "/terms-of-service",
  "/cookies": "/cookie-policy",
  "/cookie": "/cookie-policy",
  "/calculator": "/solar-panel-cleaning-robot-price-calculator",
  "/roi-calculator": "/solar-panel-cleaning-robot-price-calculator",
  "/price-calculator": "/solar-panel-cleaning-robot-price-calculator",
  "/solar-panel-cleaning-systems": "/solar-panel-cleaning-system",
  "/technology": "/technology/ai-intelligence",
  "/ai-intelligence": "/technology/ai-intelligence",
  "/compare": "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
};

function pluralizeLastSegment(path: string): string | null {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1]!;
  if (last.endsWith("s") || last.length <= 3) return null;
  return `/${[...parts.slice(0, -1), `${last}s`].join("/")}`;
}

/** Build alias map from manual entries + auto-generated plurals for sitemap routes. */
export function buildAliasMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const [from, to] of Object.entries(MANUAL_ALIASES)) {
    map.set(normalizePath(from), normalizePath(to));
  }

  for (const route of STATIC_SITEMAP_ROUTES) {
    const canonical = normalizePath(route.path);
    const plural = pluralizeLastSegment(canonical);
    if (plural && !map.has(plural)) {
      map.set(plural, canonical);
    }
  }

  return map;
}

const ALIAS_MAP = buildAliasMap();

export function resolveAlias(path: string): string | null {
  const normalized = normalizePath(path);
  return ALIAS_MAP.get(normalized) ?? null;
}
