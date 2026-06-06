/** Matches CMS `details` tags to /projects category landing pages. */
export type ProjectCategoryFilter =
  | "automatic"
  | "semiAutomatic"
  | "capex"
  | "opex";

export const CANONICAL_CATEGORY_LABELS: Record<ProjectCategoryFilter, string> = {
  automatic: "Automatic",
  semiAutomatic: "Semi-Automatic",
  capex: "Capex",
  opex: "Opex",
};

export const CATEGORY_PAGE_HREFS: Record<ProjectCategoryFilter, string> = {
  automatic: "/projects/automatic",
  semiAutomatic: "/projects/semi-automatic",
  capex: "/projects/capex",
  opex: "/projects/opex",
};

const ALL_CATEGORIES: ProjectCategoryFilter[] = [
  "automatic",
  "semiAutomatic",
  "capex",
  "opex",
];

function normalizeDetailTag(tag: string): string {
  return tag.toLowerCase().replace(/[\s_-]+/g, "");
}

const SEMI_AUTO_ROBOT_TAG =
  /(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/i;
const AUTO_ROBOT_TAG = /(\d+)\s*auto\s*robots?/i;

function semiAutoRobotCount(tag: string): number {
  const match = tag.trim().match(SEMI_AUTO_ROBOT_TAG);
  return match ? Number(match[1]) : 0;
}

function autoRobotCount(tag: string): number {
  if (/semi[-\s]?auto/i.test(tag)) return 0;
  const match = tag.trim().match(AUTO_ROBOT_TAG);
  return match ? Number(match[1]) : 0;
}

/** Resolve a detail chip to a category filter, if any. */
export function getCategoryForDetailTag(tag: string): ProjectCategoryFilter | null {
  const trimmed = tag.trim();
  if (!trimmed) return null;

  const n = normalizeDetailTag(trimmed);
  if (n === "capex" || n.startsWith("capex")) {
    return "capex";
  }
  if (n === "opex" || n.startsWith("opex") || n === "tayproopex") {
    return "opex";
  }
  if (
    n === "semiautomatic" ||
    n.startsWith("semiautomatic") ||
    n === "semiauto"
  ) {
    return "semiAutomatic";
  }
  if (semiAutoRobotCount(trimmed) > 0) {
    return "semiAutomatic";
  }
  if (n === "automatic" || (n.startsWith("automatic") && !n.includes("semi"))) {
    return "automatic";
  }
  if (autoRobotCount(trimmed) > 0) {
    return "automatic";
  }
  return null;
}

export function isProjectCategoryDetailTag(tag: string): boolean {
  return getCategoryForDetailTag(tag) !== null;
}

export function canonicalCategoryLabel(tag: string): string | null {
  const trimmed = tag.trim();
  if (!trimmed) return null;
  // Keep operational robot-count chips; only normalize explicit category synonyms.
  if (semiAutoRobotCount(trimmed) > 0 || autoRobotCount(trimmed) > 0) {
    return null;
  }
  const category = getCategoryForDetailTag(trimmed);
  return category ? CANONICAL_CATEGORY_LABELS[category] : null;
}

export function getCategoryHrefForDetailTag(tag: string): string | null {
  const category = getCategoryForDetailTag(tag);
  return category ? CATEGORY_PAGE_HREFS[category] : null;
}

export function projectMatchesCategory(
  details: string[],
  category: ProjectCategoryFilter
): boolean {
  return details.some((tag) => getCategoryForDetailTag(tag) === category);
}

export function projectHasCategoryTag(details: string[]): boolean {
  return details.some((tag) => isProjectCategoryDetailTag(tag));
}

/** Normalize category chips to canonical English labels; leave other chips unchanged. */
export function canonicalizeCategoryDetailTags(details: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of details) {
    const trimmed = raw.trim();
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

/** Indices of chips that must stay in English for category filtering. */
export function partitionProjectDetailsForTranslation(details: string[]): {
  categoryByIndex: Map<number, string>;
  translatableIndices: number[];
} {
  const categoryByIndex = new Map<number, string>();
  const translatableIndices: number[] = [];

  details.forEach((item, index) => {
    const canonical = canonicalCategoryLabel(item);
    if (canonical) {
      categoryByIndex.set(index, canonical);
    } else {
      translatableIndices.push(index);
    }
  });

  return { categoryByIndex, translatableIndices };
}

export function mergeTranslatedProjectDetails(
  source: string[],
  translatedFacts: string[],
  translatableIndices: number[],
  categoryByIndex: Map<number, string>
): string[] {
  const merged = [...source];
  translatableIndices.forEach((index, i) => {
    if (translatedFacts[i] !== undefined) {
      merged[index] = translatedFacts[i];
    }
  });
  categoryByIndex.forEach((label, index) => {
    merged[index] = label;
  });
  return merged;
}

export function listMatchedCategories(
  details: string[]
): ProjectCategoryFilter[] {
  return ALL_CATEGORIES.filter((category) =>
    projectMatchesCategory(details, category)
  );
}
