/** Shared author pool for project import / reassignment. */

export const PROJECT_AUTHOR_EXCLUDED = new Set([
  "taypro team",
  "taypro",
  "",
  "suraj kadam",
]);

export function isEligibleProjectAuthor(name) {
  return !PROJECT_AUTHOR_EXCLUDED.has(String(name || "").trim().toLowerCase());
}

export function loadProjectAuthorPool(db) {
  const hasAuthors = db
    .prepare(
      "SELECT 1 FROM sqlite_master WHERE type='table' AND name='authors'"
    )
    .get();
  if (!hasAuthors) return ["Taypro Team"];

  const rows = db.prepare("SELECT name FROM authors ORDER BY name").all();
  const pool = rows
    .map((r) => r.name?.trim())
    .filter((n) => n && isEligibleProjectAuthor(n));
  return pool.length ? pool : ["Taypro Team"];
}

/** Stable author per slug (same result on any machine with the same pool). */
export function pickAuthorForSlug(slug, pool) {
  if (!pool.length) return "Taypro Team";
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return pool[h % pool.length];
}
