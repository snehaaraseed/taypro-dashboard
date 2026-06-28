import type { ProjectPageFilterKey } from "@/lib/cms/project-page-filters";

/** Curated case-study hero for each hardware product page. */
export const PRODUCT_PAGE_HERO_PROJECT_SLUG: Partial<
  Record<ProjectPageFilterKey, string>
> = {
  glyde: "bachau-dvc-gujrat-300-mw",
  helyx: "sonar-bangla-14-mw",
  glydeX: "neneva-gujrat-250-mw",
  nyuma: "ahmadnagar-nagalwadi-8-mw",
};

/** Static hero when no CMS project slug is pinned. */
export const PRODUCT_PAGE_HERO_STATIC: Partial<
  Record<ProjectPageFilterKey, { src: string; alt: string }>
> = {
  nyumaX: {
    src: "/tayprobglayout/product-hero-backgrounds/nyuma-x-hero.png",
    alt: "NYUMA-X solar panel cleaning robot on a utility-scale solar plant",
  },
};

/** Static hero for coming-soon product pages (no project filter key). */
export const PRODUCT_PAGE_HERO_VARIANT_STATIC: Record<
  string,
  { src: string; alt: string }
> = {
  miny: {
    src: "/tayprobglayout/product-hero-backgrounds/miny-hero.png",
    alt: "Taypro MINY waterless rooftop solar panel cleaning robot on commercial panels",
  },
};

/** Solar robots hub (`/solar-panel-cleaning-system`) hero background. */
export const HUB_PAGE_HERO_PROJECT_SLUG = "agar-solar-project";

export const HUB_PAGE_HERO_STATIC = {
  src: "/uploads/2026/06/Agar_Automatic_Photo-1781176079128.jpg",
  alt: "Agar 200 MW solar plant in Madhya Pradesh with Taypro cleaning robots",
};
