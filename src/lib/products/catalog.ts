import type { OgPresetKey } from "@/lib/seo/open-graph";

export type ProductId = "helyx" | "glyde" | "glydeX" | "nyuma" | "nyumaX";

export type PlantType = "fixed_tilt" | "tracker" | "distributed";

export type CleaningTechnology = "single_pass_pbt" | "dual_pass_microfiber";

export type AutonomyLevel = "semi_automatic" | "fully_automatic";

export type ItemGroup = "Pick and Place Robots" | "Automatic Robot";

export type ProductCatalogEntry = {
  id: ProductId;
  itemName: string;
  itemGroup: ItemGroup;
  href: string;
  imagePath: string;
  i18nNamespace: string;
  ogPreset: OgPresetKey;
  plantType: PlantType;
  cleaningTechnology: CleaningTechnology;
  autonomy: AutonomyLevel;
  marketingName: string;
  description: string;
  relatedProductIds: ProductId[];
};

const HELYX_PATH =
  "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system";
const GLYDE_PATH =
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system";
const GLYDE_X_PATH =
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers";
const NYUMA_PATH =
  "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot";
const NYUMA_X_PATH =
  "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot";

export const PRODUCT_CATALOG: Record<ProductId, ProductCatalogEntry> = {
  helyx: {
    id: "helyx",
    itemName: "HELYX",
    itemGroup: "Pick and Place Robots",
    href: HELYX_PATH,
    imagePath: "/tayprorobots/taypro-modelBcopy.png",
    i18nNamespace: "ModelBPage",
    ogPreset: "helyx",
    plantType: "distributed",
    cleaningTechnology: "single_pass_pbt",
    autonomy: "semi_automatic",
    marketingName: "Semi-automatic solar panel cleaning robot",
    description:
      "Portable pick-and-place waterless cleaning with single-pass PBT brushes for scattered and distributed utility-scale plants.",
    relatedProductIds: ["glyde", "glydeX", "nyuma"],
  },
  glyde: {
    id: "glyde",
    itemName: "GLYDE",
    itemGroup: "Automatic Robot",
    href: GLYDE_PATH,
    imagePath: "/tayprorobots/glyde/glyde-tr150-top-view.png",
    i18nNamespace: "ModelAPage",
    ogPreset: "glyde",
    plantType: "fixed_tilt",
    cleaningTechnology: "dual_pass_microfiber",
    autonomy: "fully_automatic",
    marketingName: "Automatic solar panel cleaning robot",
    description:
      "Fully autonomous waterless cleaning with patented dual-pass airflow and microfiber for fixed and seasonal-tilt utility plants.",
    relatedProductIds: ["glydeX", "nyuma", "nyumaX"],
  },
  glydeX: {
    id: "glydeX",
    itemName: "GLYDE-X",
    itemGroup: "Automatic Robot",
    href: GLYDE_X_PATH,
    imagePath: "/tayprorobots/taypro-modelTcopy.png",
    i18nNamespace: "ModelTPage",
    ogPreset: "glydeX",
    plantType: "tracker",
    cleaningTechnology: "dual_pass_microfiber",
    autonomy: "fully_automatic",
    marketingName: "Tracker solar panel cleaning robot",
    description:
      "Autonomous waterless robot for single-axis trackers with patented dual-pass microfiber and a flexible 360° bridge.",
    relatedProductIds: ["glyde", "glydeX", "nyumaX"],
  },
  nyuma: {
    id: "nyuma",
    itemName: "NYUMA",
    itemGroup: "Automatic Robot",
    href: NYUMA_PATH,
    imagePath: "/tayprorobots/taypro-modelAcopy.png",
    i18nNamespace: "NyumaPage",
    ogPreset: "nyuma",
    plantType: "fixed_tilt",
    cleaningTechnology: "single_pass_pbt",
    autonomy: "fully_automatic",
    marketingName: "Automatic PBT solar cleaning robot",
    description:
      "Fully autonomous waterless cleaning with single-pass PBT brush technology for fixed and seasonal-tilt utility-scale plants.",
    relatedProductIds: ["glyde", "glydeX", "nyumaX"],
  },
  nyumaX: {
    id: "nyumaX",
    itemName: "NYUMA-X",
    itemGroup: "Automatic Robot",
    href: NYUMA_X_PATH,
    imagePath: "/tayprorobots/taypro-modelTcopy.png",
    i18nNamespace: "NyumaXPage",
    ogPreset: "nyumaX",
    plantType: "tracker",
    cleaningTechnology: "single_pass_pbt",
    autonomy: "fully_automatic",
    marketingName: "Tracker PBT solar cleaning robot",
    description:
      "Autonomous waterless robot for single-axis trackers with single-pass PBT cleaning and a flexible body for tracker tables.",
    relatedProductIds: ["glydeX", "glyde", "nyuma"],
  },
};

/** Display order: flagship GLYDE first, HELYX last among hardware. */
export const HARDWARE_PRODUCT_IDS: ProductId[] = [
  "glyde",
  "glydeX",
  "nyuma",
  "nyumaX",
  "helyx",
];

export function getProduct(id: ProductId): ProductCatalogEntry {
  return PRODUCT_CATALOG[id];
}

export function getRelatedProducts(id: ProductId): ProductCatalogEntry[] {
  return PRODUCT_CATALOG[id].relatedProductIds.map((pid) => PRODUCT_CATALOG[pid]);
}

export type RobotCardData = {
  label: string;
  image: string;
  href: string;
};

export function getRelatedProductCards(id: ProductId): RobotCardData[] {
  return getRelatedProducts(id).map((p) => ({
    label: p.itemName,
    image: p.imagePath,
    href: p.href,
  }));
}

export function productImagePresentation(
  imagePath: string
): "robot-standard" | "robot-wide" {
  if (imagePath.includes("modelB") || imagePath.includes("modelT")) {
    return "robot-wide";
  }
  return "robot-standard";
}

export function productAltText(itemName: string, marketingName?: string): string {
  const name = marketingName?.trim() || itemName;
  const lower = itemName.toLowerCase();
  if (lower.includes("helyx") || lower.includes("semi")) {
    return `Taypro ${name} semi-automatic solar panel cleaning robot`;
  }
  if (lower.includes("glyde-x") || lower.includes("tracker")) {
    return `Taypro ${name} solar panel cleaning robot for single-axis trackers`;
  }
  if (lower.includes("nyuma-x")) {
    return `Taypro ${name} PBT solar panel cleaning robot for single-axis trackers`;
  }
  if (lower.includes("nyuma")) {
    return `Taypro ${name} automatic PBT solar panel cleaning robot`;
  }
  if (lower.includes("glyde")) {
    return `Taypro ${name} automatic solar panel cleaning robot for utility-scale solar farms`;
  }
  return `Taypro ${name} solar panel cleaning robot`;
}
