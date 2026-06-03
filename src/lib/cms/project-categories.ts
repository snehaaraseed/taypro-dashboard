/** Matches CMS `details` tags to /projects category landing pages. */
export type ProjectCategoryFilter = "automatic" | "semiAutomatic" | "capex";

export const CANONICAL_CATEGORY_LABELS: Record<ProjectCategoryFilter, string> = {
  automatic: "Automatic",
  semiAutomatic: "Semi-Automatic",
  capex: "Capex",
};

export const CATEGORY_PAGE_HREFS: Record<ProjectCategoryFilter, string> = {
  automatic: "/projects/automatic",
  semiAutomatic: "/projects/semi-automatic",
  capex: "/projects/capex",
};

const ALL_CATEGORIES: ProjectCategoryFilter[] = [
  "automatic",
  "semiAutomatic",
  "capex",
];

function normalizeDetailTag(tag: string): string {
  return tag.toLowerCase().replace(/[\s_-]+/g, "");
}

/** Resolve a detail chip to a category filter, if any. */
export function getCategoryForDetailTag(tag: string): ProjectCategoryFilter | null {
  const n = normalizeDetailTag(tag);
  if (n === "capex" || n.startsWith("capex")) {
    return "capex";
  }
  if (
    n === "semiautomatic" ||
    n.startsWith("semiautomatic") ||
    n === "semiauto"
  ) {
    return "semiAutomatic";
  }
  if (n === "automatic" || (n.startsWith("automatic") && !n.includes("semi"))) {
    return "automatic";
  }
  return null;
}

export function isProjectCategoryDetailTag(tag: string): boolean {
  return getCategoryForDetailTag(tag) !== null;
}

export function canonicalCategoryLabel(tag: string): string | null {
  const category = getCategoryForDetailTag(tag);
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
