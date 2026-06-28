import {
  projectFilterForPage,
  type ProjectPageFilterKey,
} from "@/lib/cms/project-page-filters";
import {
  PRODUCT_PAGE_HERO_PROJECT_SLUG,
  PRODUCT_PAGE_HERO_STATIC,
  PRODUCT_PAGE_HERO_VARIANT_STATIC,
  HUB_PAGE_HERO_PROJECT_SLUG,
  HUB_PAGE_HERO_STATIC,
} from "@/lib/cms/product-page-hero-config";
import { getFilteredFileProjects, getProjectsBySlugs } from "@/lib/cms/projectService";
import type { ProjectListFilter } from "@/lib/cms/project-products";
import { PROJECT_HERO_IMAGE_PATH } from "@/lib/site-images";

export type ProductPageHeroBackground = {
  src: string;
  alt: string;
  projectTitle?: string;
  projectHref?: string;
};

const FALLBACK_ALT = "Taypro utility-scale solar project";

/** Stable slot per product page when falling back to the filtered project pool. */
const PRODUCT_HERO_BG_SLOT: Record<ProjectPageFilterKey, number> = {
  glyde: 0,
  nyuma: 1,
  glydeX: 0,
  nyumaX: 1,
  helyx: 0,
  opex: 2,
  console: 3,
  cradyl: 1,
};

const COMING_SOON_BG_SLOT: Record<string, number> = {
  miny: 4,
  orion: 5,
};

const MAX_PROJECT_POOL = 12;

function pickFromPool(
  projects: Awaited<ReturnType<typeof getFilteredFileProjects>>,
  slot: number
): ProductPageHeroBackground | null {
  if (projects.length === 0) return null;
  const index = slot % projects.length;
  const project = projects[index];
  if (!project?.img?.trim()) return null;

  return {
    src: project.img.trim(),
    alt: project.imageAlt?.trim() || project.title || FALLBACK_ALT,
    projectTitle: project.title,
    projectHref: project.href,
  };
}

async function pickProjectHeroBackground(
  filter: ProjectListFilter,
  slot: number,
  locale?: string
): Promise<ProductPageHeroBackground | null> {
  const projects = await getFilteredFileProjects(filter, locale, MAX_PROJECT_POOL);
  return pickFromPool(projects, slot);
}

async function resolvePinnedProjectBackground(
  slug: string,
  locale?: string
): Promise<ProductPageHeroBackground | null> {
  const projects = await getProjectsBySlugs([slug], locale);
  const project = projects[0];
  if (!project?.img?.trim()) return null;

  return {
    src: project.img.trim(),
    alt: project.imageAlt?.trim() || project.title || FALLBACK_ALT,
    projectTitle: project.title,
    projectHref: project.href,
  };
}

function resolveBackgroundSlot(
  filterKey: ProjectPageFilterKey | null,
  variant?: string
): number {
  if (filterKey) {
    return PRODUCT_HERO_BG_SLOT[filterKey] ?? 0;
  }
  if (variant && variant in COMING_SOON_BG_SLOT) {
    return COMING_SOON_BG_SLOT[variant] ?? 0;
  }
  return 0;
}

export type ProductPageHeroBackgroundOptions = {
  /** Distinguishes pages without a project filter (e.g. miny, orion). */
  variant?: string;
};

/**
 * Resolves the hero background for a product page.
 * Prefers curated project slugs / static assets, then filtered CMS pool, then site fallback.
 */
export async function resolveProductPageHeroBackground(
  filterKey: ProjectPageFilterKey | null,
  locale?: string,
  options?: ProductPageHeroBackgroundOptions
): Promise<ProductPageHeroBackground> {
  if (filterKey) {
    const staticHero = PRODUCT_PAGE_HERO_STATIC[filterKey];
    if (staticHero) {
      return { src: staticHero.src, alt: staticHero.alt };
    }

    const pinnedSlug = PRODUCT_PAGE_HERO_PROJECT_SLUG[filterKey];
    if (pinnedSlug) {
      const pinned = await resolvePinnedProjectBackground(pinnedSlug, locale);
      if (pinned) return pinned;
    }

    const slot = resolveBackgroundSlot(filterKey, options?.variant);
    const match = await pickProjectHeroBackground(
      projectFilterForPage(filterKey),
      slot,
      locale
    );
    if (match) return match;
  } else {
    const variantHero =
      options?.variant && PRODUCT_PAGE_HERO_VARIANT_STATIC[options.variant];
    if (variantHero) {
      return { src: variantHero.src, alt: variantHero.alt };
    }

    const slot = resolveBackgroundSlot(null, options?.variant);
    const automatic = await pickProjectHeroBackground(
      { category: "automatic" },
      slot,
      locale
    );
    if (automatic) return automatic;
  }

  return {
    src: PROJECT_HERO_IMAGE_PATH,
    alt: FALLBACK_ALT,
  };
}

/** Hub page hero — pinned Agar 200 MW deployment photo. */
export async function resolveHubPageHeroBackground(
  locale?: string
): Promise<ProductPageHeroBackground> {
  const pinned = await resolvePinnedProjectBackground(
    HUB_PAGE_HERO_PROJECT_SLUG,
    locale
  );
  if (pinned) return pinned;

  return {
    src: HUB_PAGE_HERO_STATIC.src,
    alt: HUB_PAGE_HERO_STATIC.alt,
    projectTitle: "Agar 200 MW Solar Plant",
    projectHref: `/projects/${HUB_PAGE_HERO_PROJECT_SLUG}`,
  };
}
