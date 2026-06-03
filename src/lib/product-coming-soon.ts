/** Coming-soon product routes and shared metadata keys. */
export { CRADYL_PRODUCT_PATH } from "@/lib/product-cradyl";

export const MINY_PRODUCT_PATH =
  "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot";

export const ORION_PRODUCT_PATH =
  "/solar-panel-cleaning-system/orion-plant-intelligence-platform";

export type ComingSoonProductId = "miny" | "orion";

export type ComingSoonProductConfig = {
  id: ComingSoonProductId;
  model: string;
  path: string;
  /** i18n namespace root, e.g. MinyPage */
  namespace: "MinyPage" | "OrionPage";
  heroImagePath: string;
  relatedHrefs: string[];
  /** When false, the page omits hardware model cards at the bottom (software products). */
  showRobotModelCards?: boolean;
};

export const comingSoonProducts: ComingSoonProductConfig[] = [
  {
    id: "miny",
    model: "MINY",
    path: MINY_PRODUCT_PATH,
    namespace: "MinyPage",
    heroImagePath: "/tayprorobots/taypro-modelBcopy.png",
    relatedHrefs: [
      "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
      "/solar-panel-cleaning-system",
    ],
  },
  {
    id: "orion",
    model: "ORION",
    path: ORION_PRODUCT_PATH,
    namespace: "OrionPage",
    heroImagePath: "/tayproasset/taypro-console.png",
    showRobotModelCards: false,
    relatedHrefs: [
      "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      "/solar-panel-cleaning-system",
    ],
  },
];
