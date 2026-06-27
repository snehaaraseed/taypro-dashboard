import type { OgPresetKey } from "@/lib/seo/open-graph";
import lineupTopViewDimensions from "./lineup-top-view-dimensions.json";

export type ProductId = "helyx" | "glyde" | "glydeX" | "nyuma" | "nyumaX";

/** Branded 360° frames: glyde/, helyx/, glyde-x/ under public/360-degree-images/. NYUMA / NYUMA-X: add when photography exists. */

export type PlantType = "fixed_tilt" | "tracker" | "distributed";

export type CleaningTechnology = "single_pass_pbt" | "dual_pass_microfiber";

export type AutonomyLevel = "semi_automatic" | "fully_automatic";

export type ItemGroup = "Pick and Place Robots" | "Automatic Robot";

export type ProductHeroDimensions = {
  width: number;
  height: number;
};

export type ProductCatalogEntry = {
  id: ProductId;
  itemName: string;
  itemGroup: ItemGroup;
  href: string;
  imagePath: string;
  /** Optional hub/cross-sell card art (defaults to imagePath). */
  cardImagePath?: string;
  /** Native hero pixel dimensions — drives layout aspect ratio in UI. */
  heroDimensions: ProductHeroDimensions;
  /** Dimensions for cardImagePath when it differs from hero art. */
  cardDimensions?: ProductHeroDimensions;
  /** Optional gallery/detail shots (e.g. GLYDE mechanism images). */
  detailImages?: string[];
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
    imagePath: "/tayprorobots/helyx/hero.webp",
    cardImagePath: "/tayprorobots/helyx/side-view.webp",
    heroDimensions: { width: 1024, height: 639 },
    cardDimensions: { width: 1024, height: 639 },
    detailImages: [
      "/tayprorobots/helyx/top-view.webp",
      "/tayprorobots/helyx/side-view.webp",
      "/tayprorobots/helyx/front.webp",
      "/tayprorobots/helyx/zoomed-left.webp",
      "/tayprorobots/helyx/field-operation.webp",
    ],
    i18nNamespace: "HelyxPage",
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
    imagePath: "/tayprorobots/glyde/hero.webp",
    heroDimensions: { width: 1024, height: 683 },
    detailImages: [
      "/tayprorobots/glyde/top-view.webp",
      "/tayprorobots/glyde/side-view.webp",
      "/tayprorobots/glyde/modular.webp",
      "/tayprorobots/glyde/docking-power-unit.webp",
    ],
    i18nNamespace: "GlydePage",
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
    imagePath: "/tayprorobots/glyde-x/hero.webp",
    cardImagePath: "/tayprorobots/glyde-x/zoomed-left.webp",
    heroDimensions: { width: 1024, height: 640 },
    cardDimensions: { width: 640, height: 616 },
    detailImages: [
      "/tayprorobots/glyde-x/top-view.webp",
      "/tayprorobots/glyde-x/side-view.webp",
      "/tayprorobots/glyde-x/zoomed-left.webp",
      "/tayprorobots/glyde-x/zoomed-right.webp",
    ],
    i18nNamespace: "GlydeXPage",
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
    imagePath: "/tayprorobots/nyuma/brush-detail.webp",
    cardImagePath: "/tayprorobots/nyuma/card.webp",
    heroDimensions: { width: 1024, height: 1001 },
    cardDimensions: { width: 1024, height: 579 },
    detailImages: [
      "/tayprorobots/nyuma/top-view.webp",
      "/tayprorobots/nyuma/product-render.webp",
    ],
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
    imagePath: "/tayprorobots/nyuma-x/hero.webp",
    cardImagePath: "/tayprorobots/nyuma-x/zoomed-left.webp",
    heroDimensions: { width: 1024, height: 640 },
    cardDimensions: { width: 560, height: 805 },
    detailImages: [
      "/tayprorobots/nyuma-x/top-view.webp",
      "/tayprorobots/nyuma-x/side-view.webp",
      "/tayprorobots/nyuma-x/zoomed-left.webp",
      "/tayprorobots/nyuma-x/zoomed-right.webp",
    ],
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

export function getProductCardImagePath(id: ProductId): string {
  const product = PRODUCT_CATALOG[id];
  return product.cardImagePath ?? product.imagePath;
}

export function getProductTopViewImagePath(id: ProductId): string {
  const topView = PRODUCT_CATALOG[id].detailImages?.find((src) =>
    src.includes("top-view")
  );
  return topView ?? getProductCardImagePath(id);
}

const PRODUCT_ASSET_FOLDER: Record<ProductId, string> = {
  helyx: "helyx",
  glyde: "glyde",
  glydeX: "glyde-x",
  nyuma: "nyuma",
  nyumaX: "nyuma-x",
};

/** Bump when lineup-top-view.webp assets are regenerated (cache bust). */
export const LINEUP_IMAGE_VERSION = "8";

/** Trimmed top-view art for the home product lineup (see scripts/generate-lineup-top-views.mjs). */
export function getProductLineupImagePath(id: ProductId): string {
  return `/tayprorobots/${PRODUCT_ASSET_FOLDER[id]}/lineup-top-view.webp?v=${LINEUP_IMAGE_VERSION}`;
}

export function getProductLineupImageDimensions(
  id: ProductId
): { width: number; height: number } {
  return lineupTopViewDimensions[id];
}

export type ProductLineupLayout = "full" | "split";

export function getProductLineupLayout(id: ProductId): ProductLineupLayout {
  return id === "glydeX" || id === "nyumaX" ? "split" : "full";
}

export function getProductHeroAspectRatio(id: ProductId): string {
  const { width, height } = PRODUCT_CATALOG[id].heroDimensions;
  return `${width} / ${height}`;
}

export function isWideHeroProduct(id: ProductId): boolean {
  const { width, height } = PRODUCT_CATALOG[id].heroDimensions;
  return width / height >= 1.9;
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
    image: getProductCardImagePath(p.id),
    href: p.href,
  }));
}

const WIDE_PRODUCT_IDS: ProductId[] = ["helyx", "glydeX", "nyumaX"];

export function productImagePresentation(
  id: ProductId
): "robot-standard" | "robot-wide" {
  return WIDE_PRODUCT_IDS.includes(id) ? "robot-wide" : "robot-standard";
}

const IMAGE_PATH_PREFIX_TO_ID: Record<string, ProductId> = {
  "/tayprorobots/helyx/": "helyx",
  "/tayprorobots/glyde-x/": "glydeX",
  "/tayprorobots/nyuma-x/": "nyumaX",
  "/tayprorobots/glyde/": "glyde",
  "/tayprorobots/nyuma/": "nyuma",
};

export function resolveProductIdFromImagePath(
  imagePath: string
): ProductId | null {
  for (const [prefix, id] of Object.entries(IMAGE_PATH_PREFIX_TO_ID)) {
    if (imagePath.includes(prefix)) return id;
  }
  return null;
}

/** Hub/home robot cards: fill frame width, crop height, anchor left-center. */
export const ROBOT_CARD_IMAGE_CLASS =
  "h-full w-full object-cover object-left";

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
