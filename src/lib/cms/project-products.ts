import type { ProductId } from "@/lib/products/catalog";
import { PRODUCT_CATALOG } from "@/lib/products/catalog";
import type { ProjectCategoryFilter } from "@/lib/cms/project-categories";
import {
  listMatchedCategories,
  projectHasCategoryTag,
  projectMatchesCategory,
} from "@/lib/cms/project-categories";

export type ProjectListFilter = {
  /** Match projects tagged with these products (GLYDE, HELYX, etc.). */
  products?: ProductId[];
  /** Used when a project has no product tag but has Automatic / Semi-Automatic / Capex. */
  category?: ProjectCategoryFilter;
  /** Match if title, description, or any detail chip contains a keyword (e.g. NECTYR, CRADYL). */
  keywords?: string[];
};

const PRODUCT_ORDER: ProductId[] = [
  "glydeX",
  "nyumaX",
  "glyde",
  "nyuma",
  "helyx",
];

/** Detail-chip and legacy names → product id (longer ids first). */
const PRODUCT_TAG_RULES: { id: ProductId; patterns: string[] }[] = [
  {
    id: "glydeX",
    patterns: ["glydexus", "glydex", "glyde-x", "glyde-x"],
  },
  {
    id: "nyumaX",
    patterns: ["nyumax", "nyuma-x"],
  },
  {
    id: "glyde",
    patterns: ["glyde", "glyde", "glyde"],
  },
  {
    id: "nyuma",
    patterns: ["nyuma"],
  },
  {
    id: "helyx",
    patterns: ["helyx", "helyx", "helyx"],
  },
];

function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/[\s_-]+/g, "");
}

function tagMatchesPattern(normalized: string, pattern: string): boolean {
  const p = normalizeTag(pattern);
  return normalized === p || normalized.startsWith(p);
}

export function getProductForDetailTag(tag: string): ProductId | null {
  const n = normalizeTag(tag);
  for (const rule of PRODUCT_TAG_RULES) {
    if (rule.patterns.some((pattern) => tagMatchesPattern(n, pattern))) {
      return rule.id;
    }
  }
  return null;
}

export function isProjectProductDetailTag(tag: string): boolean {
  return getProductForDetailTag(tag) !== null;
}

export function canonicalProductLabel(productId: ProductId): string {
  return PRODUCT_CATALOG[productId].itemName;
}

export function listMatchedProducts(details: string[]): ProductId[] {
  const found = new Set<ProductId>();
  for (const tag of details) {
    const product = getProductForDetailTag(tag);
    if (product) found.add(product);
  }
  return PRODUCT_ORDER.filter((id) => found.has(id));
}

export function projectMatchesProduct(
  details: string[],
  productId: ProductId
): boolean {
  return listMatchedProducts(details).includes(productId);
}

function textMentionsProduct(text: string, productId: ProductId): boolean {
  const lower = text.toLowerCase();
  const name = PRODUCT_CATALOG[productId].itemName.toLowerCase();
  if (lower.includes(name)) return true;
  const rule = PRODUCT_TAG_RULES.find((r) => r.id === productId);
  return (
    rule?.patterns.some((p) => lower.includes(normalizeTag(p))) ?? false
  );
}

function projectMentionsProduct(
  project: { title: string; description: string; details: string[] },
  productId: ProductId
): boolean {
  if (projectMatchesProduct(project.details, productId)) return true;
  return (
    textMentionsProduct(project.title, productId) ||
    textMentionsProduct(project.description, productId)
  );
}

function projectMentionsKeyword(
  project: { title: string; description: string; details: string[] },
  keyword: string
): boolean {
  const kw = keyword.toLowerCase();
  const blob = [project.title, project.description, ...project.details]
    .join(" ")
    .toLowerCase();
  return blob.includes(kw);
}

export function projectMatchesListFilter(
  project: { title: string; description: string; details: string[] },
  filter: ProjectListFilter
): boolean {
  const hasProductFilter = (filter.products?.length ?? 0) > 0;
  const hasCategoryFilter = filter.category != null;
  const hasKeywordFilter = (filter.keywords?.length ?? 0) > 0;

  if (!hasProductFilter && !hasCategoryFilter && !hasKeywordFilter) {
    return true;
  }

  if (hasKeywordFilter) {
    if (
      filter.keywords!.some((kw) => projectMentionsKeyword(project, kw))
    ) {
      return true;
    }
  }

  if (hasProductFilter) {
    if (filter.products!.some((id) => projectMentionsProduct(project, id))) {
      return true;
    }

    if (listMatchedProducts(project.details).length > 0) {
      return false;
    }

    if (hasCategoryFilter && projectHasCategoryTag(project.details)) {
      return projectMatchesCategory(project.details, filter.category!);
    }

    return false;
  }

  if (hasCategoryFilter) {
    return projectMatchesCategory(project.details, filter.category!);
  }

  return false;
}

/** Related projects: same product tags first, else same category tags. */
export function relatedProjectsFilterFromDetails(
  details: string[]
): ProjectListFilter {
  const products = listMatchedProducts(details);
  if (products.length > 0) {
    return { products };
  }
  const categories = listMatchedCategories(details);
  if (categories.length > 0) {
    return { category: categories[0] };
  }
  return {};
}
