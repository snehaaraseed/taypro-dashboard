/** Shared href helpers for handwritten case-study generators (keep in sync with draft-project-slugs.ts). */

export const PERFORMANCE_METHODOLOGY_HREF = "/performance-and-test-methodology";

const DRAFT_PEER_SLUGS = new Set([
  "ahmadnagar-masale-10-mw",
  "ahmadnagar-nimgaon-5-mw",
  "ahmadnagar-ranjanwadi-5-mw",
  "ahmadnagar-velapur-7-mw",
  "ahmadnagar-wadner-bk-7-mw",
  "beed-babhal-gaon-7-mw",
  "bu-bhandari-nashik-3-mw",
  "chakan-vi-25-mw",
  "chakan-vii-2-mw",
  "dharashiv-naldurg-8-mw",
  "hingoli-shiwani-bk-6-mw",
  "khopoli-25-mw",
  "nashik-boygaon-6-mw",
  "nashik-dongagaon-8-mw",
  "nashik-hiswal-bk-7-mw",
  "nashik-kolam-bk-8-mw",
  "nashik-satyagaon-9-mw",
  "nashik-shinde-10-mw",
  "sangali-benapurarenavi-9-mw",
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
  "wardhamana-02-mw",
  "yavatmal-adegaon-5-mw",
  "yavatmal-mhasola-5-mw",
  "yavatmal-sarfali-3-mw",
  "yavatmal-undarni-7-mw",
]);

const PUBLISHED_SLUG_ALIASES = {
  "bu-bhandari-nashik-3-mw": "bu-bhandari-satana-nashik-3-mw",
  "panshina-gujrat-250-mw": "panshina-gujrat-75-mw",
};

/** href for cross-links between project case studies. */
export function projectPeerHref(slug) {
  if (DRAFT_PEER_SLUGS.has(slug)) return "/projects";
  const canonical = PUBLISHED_SLUG_ALIASES[slug];
  if (canonical) return `/projects/${canonical}`;
  return `/projects/${slug}`;
}
