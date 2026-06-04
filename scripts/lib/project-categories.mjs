/** Mirror of src/lib/cms/project-categories.ts for import scripts. */

const CANONICAL = {
  automatic: "Automatic",
  semiAutomatic: "Semi-Automatic",
  capex: "Capex",
};

function normalizeDetailTag(tag) {
  return tag.toLowerCase().replace(/[\s_-]+/g, "");
}

export function canonicalCategoryLabel(tag) {
  const n = normalizeDetailTag(tag);
  if (n === "capex" || n.startsWith("capex")) return CANONICAL.capex;
  if (
    n === "semiautomatic" ||
    n.startsWith("semiautomatic") ||
    n === "semiauto"
  ) {
    return CANONICAL.semiAutomatic;
  }
  if (n === "automatic" || (n.startsWith("automatic") && !n.includes("semi"))) {
    return CANONICAL.automatic;
  }
  return null;
}

export function canonicalizeCategoryDetailTags(details) {
  const seen = new Set();
  const result = [];
  for (const raw of details) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) continue;
    const canonical = canonicalCategoryLabel(trimmed);
    const value = canonical ?? trimmed;
    const dedupeKey = canonical
      ? `cat:${canonical}`
      : `fact:${value.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(value);
  }
  return result;
}

export function parseCategoryTagsFromCell(cell) {
  const raw = String(cell || "");
  const tags = [];
  if (/automatic/i.test(raw) && !/semi/i.test(raw)) tags.push("Automatic");
  if (/semi/i.test(raw)) tags.push("Semi-Automatic");
  if (/capex/i.test(raw)) tags.push("Capex");
  return tags;
}
