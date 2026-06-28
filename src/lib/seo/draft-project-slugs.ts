/**
 * English project slugs that exist in CMS but are unpublished (draft).
 * Sourced from production cms.sqlite, do not 301 these; fix inlink sources instead.
 * Used to avoid auto-linking / sitemap surfacing draft peers.
 */
export const DRAFT_PROJECT_PEER_SLUGS = new Set([
  "ahmadnagar-masale-10-mw",
  "ahmadnagar-ranjanwadi-5-mw",
  "ahmadnagar-velapur-7-mw",
  "bu-bhandari-nashik-3-mw",
  "chakan-vii-2-mw",
  "dharashiv-naldurg-8-mw",
  "hingoli-shiwani-bk-6-mw",
  "khopoli-25-mw",
  "nashik-boygaon-6-mw",
  "nashik-hiswal-bk-7-mw",
  "nashik-kolam-bk-8-mw",
  "nashik-shinde-10-mw",
  "sangali-benapurarenavi-9-mw",
  "wardhamana-02-mw",
  "yavatmal-adegaon-5-mw",
  "yavatmal-sarfali-3-mw",
  "yavatmal-undarni-7-mw",
]);

/** Additional draft slugs linked from case studies (not in Ahrefs top-17). */
export const DRAFT_PROJECT_CASE_STUDY_SLUGS = new Set([
  "ahmadnagar-nimgaon-5-mw",
  "ahmadnagar-wadner-bk-7-mw",
  "beed-babhal-gaon-7-mw",
  "chakan-vi-25-mw",
  "nashik-dongagaon-8-mw",
  "nashik-satyagaon-9-mw",
  "sangali-bhagyanagarbhakuchwadi-5-mw",
  "sangali-karewadi-5-mw",
  "sangali-kognoli-9-mw",
  "sangali-kontya-bobladtikondi-10-mw",
  "sangali-lingivare-5-mw",
  "sangali-madgule-5-mw",
  "sangali-morale-ped-5-mw",
  "sangali-palaskhel-9-mw",
  "sangali-shirasgaon-5-mw",
  "sangli-madgyal-5-mw",
  "snagali-belondgi-bellundagi-5-mw",
  "yavatmal-mhasola-5-mw",
]);

export const ALL_DRAFT_PROJECT_SLUGS = new Set([
  ...DRAFT_PROJECT_PEER_SLUGS, ...DRAFT_PROJECT_CASE_STUDY_SLUGS,
]);

export function isDraftProjectSlug(slug: string): boolean {
  return ALL_DRAFT_PROJECT_SLUGS.has(slug);
}
