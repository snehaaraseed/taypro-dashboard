export type ComparisonPageId =
  | "robotVsManual"
  | "indianCompetitors"
  | "tayproVsSolabot"
  | "tayproVsSkilancer"
  | "tayproVsAegeus"
  | "tayproVsVayu"
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
    indianCompetitors: {
      id: "indianCompetitors",
      slug: "taypro-vs-indian-solar-cleaning-robot-companies",
      path: "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
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
    tayproVsAegeus: {
      id: "tayproVsAegeus",
      slug: "taypro-vs-aegeus",
      path: "/compare/taypro-vs-aegeus",
    },
    tayproVsVayu: {
      id: "tayproVsVayu",
      slug: "taypro-vs-vayu-solar",
      path: "/compare/taypro-vs-vayu-solar",
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
