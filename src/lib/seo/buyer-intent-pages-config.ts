import type { ProjectListFilter } from "@/lib/cms/project-products";
import { ORION_PRODUCT_PATH } from "@/lib/product-coming-soon";

export type BuyerIntentPageId =
  | "serviceIndia"
  | "solarOmServices"
  | "opexPricing"
  | "rooftop"
  | "trackers"
  | "fleetMonitoring"
  | "largeScale"
  | "capexVsOpex"
  | "soilingCalculator"
  | "manufacturerIndia"
  | "plantDataIntelligence"
  | "enterprisePartnership";

export type BuyerIntentSection =
  | "stats"
  | "cards"
  | "prose"
  | "proseSecondary"
  | "highlight"
  | "steps"
  | "eligibility"
  | "models"
  | "pillars"
  | "stateGrid"
  | "costComparison"
  | "procurementComparison"
  | "opexTable"
  | "products"
  | "projects"
  | "roiCalculator"
  | "soilingCalculator"
  | "resources"
  | "requestForm"
  | "cta"
  | "related";

export type BuyerIntentSchemaType = "service" | "software" | "product";

export type BuyerIntentPageConfig = {
  id: BuyerIntentPageId;
  path: string;
  /** Top-level key in messages/pages/{locale}/{messageModule}.json */
  namespace: string;
  /** Filename stem under messages/pages/{locale}/ */
  messageModule: string;
  schemaType: BuyerIntentSchemaType;
  sections: readonly BuyerIntentSection[];
  pillarHrefs?: readonly string[];
  productHrefs?: readonly string[];
  projectFilter?: ProjectListFilter;
  featuredProjectSlugs?: string[];
};

export const BUYER_INTENT_PAGES: Record<
  BuyerIntentPageId,
  BuyerIntentPageConfig
> = {
  serviceIndia: {
    id: "serviceIndia",
    path: "/solar-panel-cleaning-service-india",
    namespace: "ServiceIndiaPage",
    messageModule: "solar-panel-cleaning-service-india",
    schemaType: "service",
    sections: [
      "stats",
      "prose",
      "cards",
      "steps",
      "models",
      "eligibility",
      "pillars",
      "highlight",
      "proseSecondary",
      "stateGrid",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    pillarHrefs: [
      "/solar-panel-cleaning-system",
      "/solar-panel-cleaning-system/solar-panel-cleaning-service",
      "/solar-cleaning-opex-pricing",
    ],
  },
  solarOmServices: {
    id: "solarOmServices",
    path: "/solar-om-services",
    namespace: "SolarOmServicesPage",
    messageModule: "solar-om-services",
    schemaType: "service",
    sections: [
      "stats",
      "cards",
      "pillars",
      "prose",
      "steps",
      "eligibility",
      "highlight",
      "proseSecondary",
      "projects",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    pillarHrefs: [
      "/solar-panel-cleaning-system/solar-panel-cleaning-service",
      "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      ORION_PRODUCT_PATH,
    ],
    projectFilter: { keywords: ["mw", "automatic"] },
    featuredProjectSlugs: [
      "bachau-dvc-gujrat-300-mw",
      "akhadana-rajasthan-360-mw",
      "neneva-gujrat-250-mw",
    ],
  },
  opexPricing: {
    id: "opexPricing",
    path: "/solar-cleaning-opex-pricing",
    namespace: "SolarCleaningOpexPricingPage",
    messageModule: "solar-cleaning-opex-pricing",
    schemaType: "service",
    sections: [
      "prose",
      "stats",
      "costComparison",
      "opexTable",
      "steps",
      "eligibility",
      "proseSecondary",
      "roiCalculator",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
  },
  rooftop: {
    id: "rooftop",
    path: "/solar-panel-cleaning-robot-for-rooftop",
    namespace: "RooftopCleaningPage",
    messageModule: "solar-panel-cleaning-robot-for-rooftop",
    schemaType: "product",
    sections: [
      "cards",
      "stats",
      "products",
      "prose",
      "steps",
      "eligibility",
      "highlight",
      "proseSecondary",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    productHrefs: [
      "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
      "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    ],
  },
  trackers: {
    id: "trackers",
    path: "/solar-panel-cleaning-robot-for-trackers",
    namespace: "TrackerCleaningPage",
    messageModule: "solar-panel-cleaning-robot-for-trackers",
    schemaType: "product",
    sections: [
      "cards",
      "stats",
      "products",
      "prose",
      "steps",
      "highlight",
      "proseSecondary",
      "projects",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    productHrefs: [
      "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
      "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot",
      "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station",
    ],
    projectFilter: { keywords: ["tracker", "glyde-x", "nyuma-x"] },
    featuredProjectSlugs: [
      "bachau-dvc-gujrat-300-mw",
      "neneva-gujrat-250-mw",
    ],
  },
  fleetMonitoring: {
    id: "fleetMonitoring",
    path: "/solar-fleet-monitoring-software",
    namespace: "FleetMonitoringPage",
    messageModule: "solar-fleet-monitoring-software",
    schemaType: "software",
    sections: [
      "cards",
      "stats",
      "pillars",
      "prose",
      "steps",
      "eligibility",
      "highlight",
      "proseSecondary",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    pillarHrefs: [
      "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      ORION_PRODUCT_PATH,
      "/technology/ai-intelligence",
    ],
  },
  largeScale: {
    id: "largeScale",
    path: "/large-scale-solar-panel-cleaning",
    namespace: "LargeScaleCleaningPage",
    messageModule: "large-scale-solar-panel-cleaning",
    schemaType: "service",
    sections: [
      "stats",
      "cards",
      "prose",
      "steps",
      "eligibility",
      "highlight",
      "proseSecondary",
      "projects",
      "stateGrid",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    projectFilter: { keywords: ["100", "300", "mw"] },
    featuredProjectSlugs: [
      "akhadana-rajasthan-360-mw",
      "bachau-dvc-gujrat-300-mw",
      "neneva-gujrat-250-mw",
    ],
  },
  capexVsOpex: {
    id: "capexVsOpex",
    path: "/solar-cleaning-capex-vs-opex",
    namespace: "SolarCleaningCapexVsOpexPage",
    messageModule: "solar-cleaning-capex-vs-opex",
    schemaType: "service",
    sections: [
      "stats",
      "prose",
      "models",
      "procurementComparison",
      "steps",
      "highlight",
      "eligibility",
      "proseSecondary",
      "roiCalculator",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    pillarHrefs: [
      "/solar-cleaning-opex-pricing",
      "/solar-panel-cleaning-robot-price-india",
      "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    ],
  },
  soilingCalculator: {
    id: "soilingCalculator",
    path: "/solar-panel-soiling-loss-calculator",
    namespace: "SoilingLossCalculatorPage",
    messageModule: "solar-panel-soiling-loss-calculator",
    schemaType: "software",
    sections: [
      "prose",
      "stats",
      "soilingCalculator",
      "steps",
      "highlight",
      "proseSecondary",
      "resources",
      "cta",
      "related",
    ],
  },
  manufacturerIndia: {
    id: "manufacturerIndia",
    path: "/solar-cleaning-robot-manufacturer-india",
    namespace: "ManufacturerIndiaPage",
    messageModule: "solar-cleaning-robot-manufacturer-india",
    schemaType: "product",
    sections: [
      "stats",
      "prose",
      "pillars",
      "products",
      "projects",
      "eligibility",
      "highlight",
      "proseSecondary",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    productHrefs: [
      "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
      "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
      "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    ],
    projectFilter: { keywords: ["mw", "automatic"] },
    featuredProjectSlugs: [
      "bachau-dvc-gujrat-300-mw",
      "akhadana-rajasthan-360-mw",
      "neneva-gujrat-250-mw",
    ],
  },
  plantDataIntelligence: {
    id: "plantDataIntelligence",
    path: "/solar-plant-data-intelligence",
    namespace: "PlantDataIntelligencePage",
    messageModule: "solar-plant-data-intelligence",
    schemaType: "software",
    sections: [
      "cards",
      "stats",
      "pillars",
      "prose",
      "steps",
      "highlight",
      "proseSecondary",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    pillarHrefs: [
      "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
      "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
      "/technology/ai-intelligence",
      "/solar-fleet-monitoring-software",
    ],
  },
  enterprisePartnership: {
    id: "enterprisePartnership",
    path: "/enterprise-solar-cleaning-partnership",
    namespace: "EnterprisePartnershipPage",
    messageModule: "enterprise-solar-cleaning-partnership",
    schemaType: "service",
    sections: [
      "stats",
      "cards",
      "prose",
      "steps",
      "eligibility",
      "pillars",
      "highlight",
      "projects",
      "proseSecondary",
      "resources",
      "requestForm",
      "cta",
      "related",
    ],
    projectFilter: { keywords: ["mw", "automatic"] },
    featuredProjectSlugs: [
      "akhadana-rajasthan-360-mw",
      "bachau-dvc-gujrat-300-mw",
      "neneva-gujrat-250-mw",
    ],
  },
};

export const BUYER_INTENT_PAGE_LIST = Object.values(BUYER_INTENT_PAGES);

export function getBuyerIntentConfig(
  pageId: BuyerIntentPageId
): BuyerIntentPageConfig {
  return BUYER_INTENT_PAGES[pageId];
}

export function getBuyerIntentConfigByPath(
  path: string
): BuyerIntentPageConfig | undefined {
  return BUYER_INTENT_PAGE_LIST.find((p) => p.path === path);
}

/** Deferred buyer-intent paths — not routed yet */
export const BUYER_INTENT_TIER2_PATHS = [
  "/why-robotic-solar-cleaning",
  "/solar-cleaning-robot-for-agrivoltaic",
] as const;
