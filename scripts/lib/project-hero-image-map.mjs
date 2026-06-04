/**
 * Canonical hero images for known case-study slugs (real site photos).
 * Import/refresh scripts must prefer these over random pool picks.
 */
export const PROJECT_HERO_IMAGE_BY_SLUG = {
  "agar-solar-project": "/tayprosolarfirm/agar-solar.jpg",
  "banda-solar-project": "/tayprosolarfirm/banda-solar.jpg",
  "soyegaon-solar-project": "/tayprosolarfirm/soyegaon-solar.jpg",
  "yadgir-solar-project-50-mw": "/tayprosolarfirm/yadgir-solar.jpg",
};

/** Valid generic hero when no slug-specific photo exists. */
export const PROJECT_HERO_FALLBACK = "/tayprobglayout/taypro-project.png";

export function resolveProjectHeroForSlug(slug) {
  return PROJECT_HERO_IMAGE_BY_SLUG[slug] ?? null;
}
