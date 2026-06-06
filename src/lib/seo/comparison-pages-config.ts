export type ComparisonPageId =
  | "robotVsManual"
  | "tayproVsSolabot"
  | "tayproVsSkilancer"
  | "waterlessVsWater";

export type ComparisonPageConfig = {
  id: ComparisonPageId;
  slug: string;
  path: string;
};

export const COMPARISON_PAGES: Record<ComparisonPageId, ComparisonPageConfig> =
  {
    robotVsManual: {
      id: "robotVsManual",
      slug: "solar-panel-cleaning-robot-vs-manual-cleaning",
      path: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
    },
    tayproVsSolabot: {
      id: "tayproVsSolabot",
      slug: "taypro-vs-solabot",
      path: "/compare/taypro-vs-solabot",
    },
    tayproVsSkilancer: {
      id: "tayproVsSkilancer",
      slug: "taypro-vs-skilancer",
      path: "/compare/taypro-vs-skilancer",
    },
    waterlessVsWater: {
      id: "waterlessVsWater",
      slug: "waterless-vs-water-based-solar-cleaning",
      path: "/compare/waterless-vs-water-based-solar-cleaning",
    },
  };

export const COMPARISON_PAGE_LIST = Object.values(COMPARISON_PAGES);

export function getComparisonBySlug(
  slug: string
): ComparisonPageConfig | undefined {
  return COMPARISON_PAGE_LIST.find((p) => p.slug === slug);
}
