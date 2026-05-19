/** Coming-soon product routes and shared metadata keys. */
export const MINY_PRODUCT_PATH =
  "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot";

export const CRADYL_PRODUCT_PATH =
  "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station";

export type ComingSoonProductId = "miny" | "cradyl";

export type ComingSoonProductConfig = {
  id: ComingSoonProductId;
  model: string;
  path: string;
  /** i18n namespace root, e.g. MinyPage */
  namespace: "MinyPage" | "CradylPage";
  heroImagePath: string;
  relatedHrefs: string[];
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
    id: "cradyl",
    model: "CRADYL",
    path: CRADYL_PRODUCT_PATH,
    namespace: "CradylPage",
    heroImagePath: "/tayprorobots/taypro-modelBcopy.png",
    relatedHrefs: [
      "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
      "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    ],
  },
];
