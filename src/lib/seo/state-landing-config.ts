import { PROJECT_HERO_IMAGE_PATH } from "@/lib/site-images";
import type { ProjectListFilter } from "@/lib/cms/project-products";

export type StateLandingId =
  | "rajasthan"
  | "gujarat"
  | "madhyaPradesh"
  | "karnataka"
  | "andhraPradesh"
  | "maharashtra"
  | "uttarPradesh"
  | "tamilNadu"
  | "haryana"
  | "delhi"
  | "westBengal"
  | "chhattisgarh";

export type StateLandingConfig = {
  id: StateLandingId;
  /** URL path segment after locale prefix */
  path: string;
  /** Schema.org / copy region name */
  addressRegion: string;
  /** Project filter for CMS case studies */
  projectFilter: ProjectListFilter;
  /** Featured project slugs (must exist in CMS/handwritten corpus) */
  featuredSlugs: string[];
  /** Slugs with Place schema geo data in projectPlaceSchema.ts */
  placeSchemaSlugs: string[];
  heroImage: string;
};

export const STATE_LANDING_PAGES: Record<StateLandingId, StateLandingConfig> = {
  rajasthan: {
    id: "rajasthan",
    path: "/solar-panel-cleaning-robot-rajasthan",
    addressRegion: "Rajasthan",
    projectFilter: { keywords: ["rajasthan"] },
    featuredSlugs: [
      "akhadana-rajasthan-360-mw",
      "bhadlarajasthan-300-mw",
      "chhayan-rajasthan-150-mw",
    ],
    placeSchemaSlugs: [
      "akhadana-rajasthan-360-mw",
      "bhadlarajasthan-300-mw",
      "chhayan-rajasthan-150-mw",
    ],
    heroImage: "/tayprosolarpanel/solar-panel.jpg",
  },
  gujarat: {
    id: "gujarat",
    path: "/solar-panel-cleaning-robot-gujarat",
    addressRegion: "Gujarat",
    projectFilter: { keywords: ["gujarat", "gujrat"] },
    featuredSlugs: [
      "bachau-dvc-gujrat-300-mw",
      "neneva-gujrat-250-mw",
      "maya-gujrat-50-mw",
    ],
    placeSchemaSlugs: ["bachau-dvc-gujrat-300-mw"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
  madhyaPradesh: {
    id: "madhyaPradesh",
    path: "/solar-panel-cleaning-robot-madhya-pradesh",
    addressRegion: "Madhya Pradesh",
    projectFilter: { keywords: ["madhya pradesh", "agar"] },
    featuredSlugs: ["agar-solar-project"],
    placeSchemaSlugs: ["agar-solar-project"],
    heroImage: "/tayprosolarpanel/solar-panel.jpg",
  },
  karnataka: {
    id: "karnataka",
    path: "/solar-panel-cleaning-robot-karnataka",
    addressRegion: "Karnataka",
    projectFilter: { keywords: ["karnataka", "yadgir"] },
    featuredSlugs: ["yadgir-solar-project-50-mw", "kmf-karnataka-75-mw"],
    placeSchemaSlugs: ["yadgir-solar-project-50-mw", "kmf-karnataka-75-mw"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
  andhraPradesh: {
    id: "andhraPradesh",
    path: "/solar-panel-cleaning-robot-andhra-pradesh",
    addressRegion: "Andhra Pradesh",
    projectFilter: { keywords: ["andhra pradesh", "andhra"] },
    featuredSlugs: [],
    placeSchemaSlugs: [],
    heroImage: "/tayprosolarpanel/solar-panel.jpg",
  },
  maharashtra: {
    id: "maharashtra",
    path: "/solar-panel-cleaning-robot-maharashtra",
    addressRegion: "Maharashtra",
    projectFilter: {
      keywords: ["maharashtra", "soyegaon", "ahmadnagar", "yavatmal", "sangli"],
    },
    featuredSlugs: [
      "soyegaon-solar-project",
      "ahmadnagar-jalalpur-10-mw",
      "yavatmal-kupti-14-mw",
    ],
    placeSchemaSlugs: ["soyegaon-solar-project"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
  uttarPradesh: {
    id: "uttarPradesh",
    path: "/solar-panel-cleaning-robot-uttar-pradesh",
    addressRegion: "Uttar Pradesh",
    projectFilter: {
      keywords: ["uttar pradesh", "banda", "prayagraj", "deoria"],
    },
    featuredSlugs: [
      "banda-solar-project",
      "prayagraj-uttar-pradesh-50-mw",
      "deoria-60-mw",
    ],
    placeSchemaSlugs: ["banda-solar-project"],
    heroImage: "/tayprosolarpanel/solar-panel.jpg",
  },
  tamilNadu: {
    id: "tamilNadu",
    path: "/solar-panel-cleaning-robot-tamil-nadu",
    addressRegion: "Tamil Nadu",
    projectFilter: { keywords: ["tamil nadu", "chennai", "nayveli"] },
    featuredSlugs: ["nayveli-10-mw", "chennai-10-mw"],
    placeSchemaSlugs: ["nayveli-10-mw", "chennai-10-mw"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
  haryana: {
    id: "haryana",
    path: "/solar-panel-cleaning-robot-haryana",
    addressRegion: "Haryana",
    projectFilter: {
      keywords: ["haryana", "ganesh", "thakkar", "suresh cotton", "suresh-cotton"],
    },
    featuredSlugs: [
      "haryana-149-mw",
      "shri-ganesh-industries-03-mw",
      "suresh-cotton-1-mw",
    ],
    placeSchemaSlugs: ["haryana-149-mw"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
  delhi: {
    id: "delhi",
    path: "/solar-panel-cleaning-robot-delhi",
    addressRegion: "Delhi",
    projectFilter: { keywords: ["delhi", "parliament"] },
    featuredSlugs: ["parliament-delhi-07-mw"],
    placeSchemaSlugs: ["parliament-delhi-07-mw"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
  westBengal: {
    id: "westBengal",
    path: "/solar-panel-cleaning-robot-west-bengal",
    addressRegion: "West Bengal",
    projectFilter: {
      keywords: ["west bengal", "sonar bangla", "sonar-bangla"],
    },
    featuredSlugs: ["sonar-bangla-14-mw"],
    placeSchemaSlugs: ["sonar-bangla-14-mw"],
    heroImage: "/tayprosolarpanel/solar-panel.jpg",
  },
  chhattisgarh: {
    id: "chhattisgarh",
    path: "/solar-panel-cleaning-robot-chhattisgarh",
    addressRegion: "Chhattisgarh",
    projectFilter: {
      keywords: ["chhattisgarh", "chattisgarh", "sungazing"],
    },
    featuredSlugs: ["sungazing-25-mw"],
    placeSchemaSlugs: ["sungazing-25-mw"],
    heroImage: PROJECT_HERO_IMAGE_PATH,
  },
};

export const ALL_STATE_LANDING_IDS = Object.keys(
  STATE_LANDING_PAGES
) as StateLandingId[];

export function getStateLandingConfig(id: StateLandingId): StateLandingConfig {
  return STATE_LANDING_PAGES[id];
}

export function statePathById(id: StateLandingId): string {
  return STATE_LANDING_PAGES[id].path;
}

export function getSiblingStateIds(id: StateLandingId): StateLandingId[] {
  return ALL_STATE_LANDING_IDS.filter((stateId) => stateId !== id);
}

/** Translation keys under SiteMapPage.links (e.g. stateRajasthanLabel). */
export function stateLandingSiteMapLabelKey(id: StateLandingId): string {
  return `state${id.charAt(0).toUpperCase()}${id.slice(1)}Label`;
}

export function stateLandingSiteMapTitleKey(id: StateLandingId): string {
  return `state${id.charAt(0).toUpperCase()}${id.slice(1)}Title`;
}
