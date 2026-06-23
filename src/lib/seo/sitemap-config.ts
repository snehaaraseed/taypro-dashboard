import type { MetadataRoute } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

/** Must match paginated blog list (`src/app/blog/page.tsx`). */
export const BLOG_LIST_PAGE_SIZE = 12;

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

export type SitemapRouteConfig = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

/** Marketing and product pages (excludes admin, API, and CMS-only routes). */
export const STATIC_SITEMAP_ROUTES: SitemapRouteConfig[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/projects", changeFrequency: "daily", priority: 0.9 },
  { path: "/company", changeFrequency: "daily", priority: 0.9 },
  { path: "/contact", changeFrequency: "daily", priority: 0.9 },
  { path: "/authors", changeFrequency: "weekly", priority: 0.7 },
  {
    path: "/solar-panel-cleaning-system",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/solar-panel-cleaning-robot-price-india",
    changeFrequency: "monthly",
    priority: 0.85,
  },
  {
    path: "/solar-panel-cleaning-robot-rajasthan",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-gujarat",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-madhya-pradesh",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-karnataka",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-andhra-pradesh",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-maharashtra",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-uttar-pradesh",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-tamil-nadu",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-haryana",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-delhi",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-west-bengal",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-chhattisgarh",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/solar-panel-cleaning-robot-price-calculator",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/utility-scale-solar-operations",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  { path: "/cleaning-technology", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/technology/ai-intelligence",
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/solar-panel-cleaning-machine",
    changeFrequency: "monthly",
    priority: 0.82,
  },
  { path: "/press", changeFrequency: "monthly", priority: 0.6 },
  { path: "/careers", changeFrequency: "weekly", priority: 0.7 },
  { path: "/projects/automatic", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects/semi-automatic", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects/capex", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects/opex", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.5 },
  { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.5 },
  {
    path: "/performance-and-test-methodology",
    changeFrequency: "yearly",
    priority: 0.5,
  },
  { path: "/site-map", changeFrequency: "monthly", priority: 0.5 },
  {
    path: "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/compare/taypro-vs-solabot",
    changeFrequency: "monthly",
    priority: 0.72,
  },
  {
    path: "/compare/taypro-vs-skilancer",
    changeFrequency: "monthly",
    priority: 0.72,
  },
  {
    path: "/compare/taypro-vs-aegeus",
    changeFrequency: "monthly",
    priority: 0.72,
  },
  {
    path: "/compare/taypro-vs-vayu-solar",
    changeFrequency: "monthly",
    priority: 0.72,
  },
  {
    path: "/compare/waterless-vs-water-based-solar-cleaning",
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    path: "/compare/glyde-vs-nyuma",
    changeFrequency: "monthly",
    priority: 0.78,
  },
  {
    path: "/compare/glyde-x-vs-nyuma-x",
    changeFrequency: "monthly",
    priority: 0.78,
  },
];

export const CMS_SITEMAP_DEFAULTS = {
  blog: {
    changeFrequency: "weekly" as ChangeFrequency,
    priority: 0.8,
  },
  project: {
    changeFrequency: "monthly" as ChangeFrequency,
    priority: 0.8,
  },
  author: {
    changeFrequency: "weekly" as ChangeFrequency,
    priority: 0.7,
  },
  blogPagination: {
    changeFrequency: "weekly" as ChangeFrequency,
    priority: 0.65,
  },
} as const;
