import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

/** Always required by layout chrome and global client widgets. */
export const LAYOUT_CLIENT_NAMESPACES = [
  "Navigation",
  "LocaleSwitcher",
  "Forms",
  "Common",
  // Rendered by the client not-found boundary (src/app/components/NotFoundClient).
  "NotFoundPage",
] as const;

const PROJECT_FILTER_SEGMENTS = new Set([
  "automatic",
  "semi-automatic",
  "capex",
  "opex",
]);

/** Buyer-intent routes (server-rendered copy; client widgets listed per path below). */
const BUYER_INTENT_PATHS = new Set([
  "/solar-panel-cleaning-service-india",
  "/solar-om-services",
  "/solar-cleaning-opex-pricing",
  "/solar-panel-cleaning-robot-for-rooftop",
  "/solar-panel-cleaning-robot-for-trackers",
  "/solar-fleet-monitoring-software",
  "/large-scale-solar-panel-cleaning",
  "/solar-cleaning-capex-vs-opex",
  "/solar-panel-soiling-loss-calculator",
  "/solar-cleaning-robot-manufacturer-india",
  "/solar-plant-data-intelligence",
  "/enterprise-solar-cleaning-partnership",
]);

/**
 * Namespaces that may be fetched via `/api/i18n/messages` or pathname-scoped layout.
 * Excludes server-only page namespaces (StateLandingsPage, buyer-intent page copy, etc.).
 */
export const CLIENT_PAGE_NAMESPACES = [
  "Home",
  "ContactPage",
  "CompanyPage",
  "ModuleManufacturerTrust",
  "PriceCalculatorPage",
  "BlogPage",
  "InsightsHubPage",
  "InsightDetailPage",
  "ProjectsPage",
  "ProjectDetailPage",
  "CareersPage",
  "SolarCleaningOpexPricingPage",
  "SoilingLossCalculatorPage",
  "UtilityOperationsPage",
  "AiIntelligencePage",
] as const;

/** Allowlist shipped to the browser on every page (layout chrome + shared client widgets). */
export const SPA_CLIENT_NAMESPACES = [
  ...LAYOUT_CLIENT_NAMESPACES,
  ...CLIENT_PAGE_NAMESPACES,
] as const;

/**
 * Page JSON files merged for the client bundle (`messages/pages/{locale}/`).
 * Keeps StateLandingsPage and other server-only copy out of the HTML payload.
 */
export const CLIENT_MESSAGE_PAGE_FILES = [
  "home.json",
  "blog.json",
  "insights.json",
  "projects.json",
  "company.json",
  "contact.json",
  "price-calculator.json",
  "module-trust.json",
  "careers.json",
  "utility-operations.json",
  "ai-intelligence.json",
  "solar-cleaning-opex-pricing.json",
  "solar-panel-soiling-loss-calculator.json",
] as const;

const SPA_NAMESPACE_SET = new Set<string>(SPA_CLIENT_NAMESPACES);

export function isAllowedClientNamespace(ns: string): boolean {
  return SPA_NAMESPACE_SET.has(ns);
}

/**
 * Path-scoped namespaces for layout HTML, server message loading, and client fetch.
 */
export function clientNamespacesForPathname(pathname: string): string[] {
  const path = pathnameWithoutLocale(pathname);

  if (path === "/" || path === "") {
    return [
      "Home",
      "PriceCalculatorPage",
      "ModuleManufacturerTrust",
      "ProjectsPage",
    ];
  }

  if (path === "/contact") {
    return ["ContactPage"];
  }

  if (path === "/company") {
    return ["CompanyPage", "ModuleManufacturerTrust"];
  }

  if (path === "/solar-panel-cleaning-robot-price-calculator") {
    return ["PriceCalculatorPage"];
  }

  if (path === "/solar-panel-cleaning-robot-price-india") {
    return ["PriceCalculatorPage"];
  }

  if (path === "/solar-cleaning-opex-pricing") {
    return ["SolarCleaningOpexPricingPage", "PriceCalculatorPage"];
  }

  if (path === "/solar-panel-soiling-loss-calculator") {
    return ["SoilingLossCalculatorPage", "PriceCalculatorPage"];
  }

  if (BUYER_INTENT_PATHS.has(path)) {
    return ["PriceCalculatorPage"];
  }

  if (
    path.startsWith("/solar-panel-cleaning-robot-") &&
    !path.startsWith("/solar-panel-cleaning-robot-price")
  ) {
    return ["PriceCalculatorPage"];
  }

  if (path === "/solar-panel-cleaning-system") {
    // Hub ProductLineupSection reuses Home.robots filter copy.
    return ["Home", "PriceCalculatorPage", "ModuleManufacturerTrust"];
  }

  if (path.startsWith("/solar-panel-cleaning-system")) {
    return ["PriceCalculatorPage", "ModuleManufacturerTrust"];
  }

  if (path === "/cleaning-technology") {
    return ["ModuleManufacturerTrust"];
  }

  if (path.startsWith("/blog") || path === "/authors") {
    return ["BlogPage"];
  }

  if (path === "/insights" || path.startsWith("/insights/")) {
    return ["InsightsHubPage", "InsightDetailPage", "BlogPage"];
  }

  if (path === "/projects") {
    return ["ProjectsPage"];
  }

  if (path === "/careers" || path.startsWith("/careers/")) {
    return ["CareersPage"];
  }

  if (path === "/utility-scale-solar-operations") {
    return ["UtilityOperationsPage", "CompanyPage"];
  }

  if (path.startsWith("/technology/ai-intelligence")) {
    return ["AiIntelligencePage"];
  }

  if (path.startsWith("/projects/")) {
    const slug = path.slice("/projects/".length).split("/")[0];
    if (PROJECT_FILTER_SEGMENTS.has(slug)) {
      return ["ProjectsPage"];
    }
    if (slug) {
      return ["ProjectDetailPage", "ProjectsPage"];
    }
  }

  return [];
}

/** Layout chrome + pathname-specific namespaces (deduped). */
export function clientNamespacesForRequest(pathname = "/"): string[] {
  return [
    ...new Set([
      ...LAYOUT_CLIENT_NAMESPACES,
      ...clientNamespacesForPathname(pathname),
    ]),
  ];
}
