/** CRADYL: launched row-transfer docking station. */
export const CRADYL_PRODUCT_PATH =
  "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station";

export const cradylProductConfig = {
  id: "cradyl" as const,
  model: "CRADYL",
  path: CRADYL_PRODUCT_PATH,
  namespace: "CradylPage" as const,
  heroImagePath: "/tayprorobots/cradyl-field.png",
  aerialImagePath: "/tayprorobots/cradyl-aerial.png",
  relatedHrefs: [
    "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  ],
};
