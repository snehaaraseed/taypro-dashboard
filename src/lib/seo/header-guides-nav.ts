import { COMPARISON_PAGES } from "@/lib/seo/comparison-pages-config";
import {
  STATE_LANDING_PAGES,
  type StateLandingId,
} from "@/lib/seo/state-landing-config";

/** High-intent comparison pages surfaced in header/footer nav. */
export const HEADER_COMPARE_IDS = [
  "tayproVsSolabot",
  "indianCompetitors",
  "robotVsManual",
  "waterlessVsWater",
] as const;

export const HEADER_STATE_IDS: StateLandingId[] = [
  "rajasthan",
  "gujarat",
  "karnataka",
  "maharashtra",
];

export const HEADER_GUIDE_LINKS = {
  compare: HEADER_COMPARE_IDS.map((id) => ({
    id,
    href: COMPARISON_PAGES[id].path,
    labelKey: `compare${id.charAt(0).toUpperCase()}${id.slice(1)}` as const,
  })),
  states: HEADER_STATE_IDS.map((id) => ({
    id,
    href: STATE_LANDING_PAGES[id].path,
    labelKey: `state${id.charAt(0).toUpperCase()}${id.slice(1)}` as const,
  })),
  hubLinks: {
    allCompare: "/solar-panel-cleaning-system#compare-guides",
    allStates: "/solar-panel-cleaning-system#state-guides",
    priceGuide: "/solar-panel-cleaning-robot-price-india",
    cleaningMachine: "/solar-panel-cleaning-machine",
  },
} as const;

export function isGuidesNavActive(pathname: string): boolean {
  if (pathname.startsWith("/compare/")) return true;
  return HEADER_STATE_IDS.some((id) =>
    pathname.startsWith(STATE_LANDING_PAGES[id].path)
  );
}
