/** Mirror of src/lib/cms/project-categories.ts for import scripts. */

const CANONICAL = {
  automatic: "Automatic",
  semiAutomatic: "Semi-Automatic",
  capex: "Capex",
  opex: "Opex",
};

function normalizeDetailTag(tag) {
  return tag.toLowerCase().replace(/[\s_-]+/g, "");
}

const SEMI_AUTO_ROBOT_TAG =
  /(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/i;
const AUTO_ROBOT_TAG = /(\d+)\s*auto\s*robots?/i;

function semiAutoRobotCount(tag) {
  const match = String(tag || "").trim().match(SEMI_AUTO_ROBOT_TAG);
  return match ? Number(match[1]) : 0;
}

function autoRobotCount(tag) {
  const trimmed = String(tag || "").trim();
  if (/semi[-\s]?auto/i.test(trimmed)) return 0;
  const match = trimmed.match(AUTO_ROBOT_TAG);
  return match ? Number(match[1]) : 0;
}

function getCategoryForDetailTag(tag) {
  const trimmed = String(tag || "").trim();
  if (!trimmed) return null;

  const n = normalizeDetailTag(trimmed);
  if (n === "capex" || n.startsWith("capex")) return "capex";
  if (n === "opex" || n.startsWith("opex") || n === "tayproopex") return "opex";
  if (
    n === "semiautomatic" ||
    n.startsWith("semiautomatic") ||
    n === "semiauto"
  ) {
    return "semiAutomatic";
  }
  if (semiAutoRobotCount(trimmed) > 0) return "semiAutomatic";
  if (n === "automatic" || (n.startsWith("automatic") && !n.includes("semi"))) {
    return "automatic";
  }
  if (autoRobotCount(trimmed) > 0) return "automatic";
  return null;
}

export function canonicalCategoryLabel(tag) {
  const trimmed = String(tag || "").trim();
  if (!trimmed) return null;
  if (semiAutoRobotCount(trimmed) > 0 || autoRobotCount(trimmed) > 0) {
    return null;
  }
  const category = getCategoryForDetailTag(trimmed);
  return category ? CANONICAL[category] : null;
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
  if (/opex/i.test(raw)) tags.push("Opex");

  if (semiAutoRobotCount(raw) > 0 && !tags.includes("Semi-Automatic")) {
    tags.push("Semi-Automatic");
  }
  if (autoRobotCount(raw) > 0 && !tags.includes("Automatic")) {
    tags.push("Automatic");
  }

  return tags;
}
