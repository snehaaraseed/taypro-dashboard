/** Pre-deploy rules: canonical slugs, redirects, unpublish list. */

/** Alias / duplicate URLs → canonical tier-1 or primary slug (301 in next.config). */
export const PROJECT_SLUG_REDIRECTS = [
  { from: "akhadana-360-mw", to: "akhadana-rajasthan-360-mw" },
  { from: "bhadla-300-mw", to: "bhadlarajasthan-300-mw" },
  { from: "apex-13-mw", to: "apex-nagpur-13-mw" },
  { from: "hariwansh-07-mw", to: "hariwansh-nagpur-07-mw" },
];

/** Slugs to unpublish (not indexable until renamed or removed from admin). */
export const UNPUBLISH_SLUGS = new Set([
  ...PROJECT_SLUG_REDIRECTS.map((r) => r.from),
  "maharashtra-1-mw",
]);

/** Rename in SQLite + handwritten file (old → new). */
export const SLUG_RENAMES = [
  { from: "-12-mw", to: "kuber-agro-12-mw" },
  { from: "-03-mw", to: "shri-ganesh-industries-03-mw" },
];

/** 301 after SLUG_RENAMES (old malformed URL → new slug). */
export const SLUG_RENAME_REDIRECTS = SLUG_RENAMES.map(({ from, to }) => ({
  from,
  to,
}));

export const LEGACY_PROJECT_SLUGS = [
  "agar-solar-project",
  "banda-solar-project",
  "soyegaon-solar-project",
  "yadgir-solar-project-50-mw",
];
