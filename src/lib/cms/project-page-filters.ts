import type { ProductId } from "@/lib/products/catalog";
import type { ProjectListFilter } from "@/lib/cms/project-products";
import type { ProjectCategoryFilter } from "@/lib/cms/project-categories";

/** Filters for product / service pages that embed `ProjectsCardServer`. */
export const PROJECT_PAGE_FILTERS = {
  glyde: {
    products: ["glyde"],
    category: "automatic",
  },
  glydeX: {
    products: ["glydeX"],
    category: "automatic",
  },
  helyx: {
    products: ["helyx"],
    category: "semiAutomatic",
  },
  nyuma: {
    products: ["nyuma"],
    category: "automatic",
  },
  nyumaX: {
    products: ["nyumaX"],
    category: "automatic",
  },
  opex: {
    category: "capex",
  },
  console: {
    category: "automatic",
  },
  cradyl: {
    keywords: ["cradyl", "mds", "docking"],
  },
} as const satisfies Record<string, ProjectListFilter>;

export type ProjectPageFilterKey = keyof typeof PROJECT_PAGE_FILTERS;

export function projectFilterForPage(
  key: ProjectPageFilterKey
): ProjectListFilter {
  const entry = PROJECT_PAGE_FILTERS[key] as ProjectListFilter;
  return {
    products: entry.products ? [...entry.products] : undefined,
    category: entry.category,
    keywords: entry.keywords ? [...entry.keywords] : undefined,
  };
}
