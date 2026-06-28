import { normalizeInternalPath } from "@/lib/seo/locale-alternates";

/** Matches state landing paths like /solar-panel-cleaning-robot-maharashtra. */
export const STATE_LANDING_PATH_RE =
  /^\/solar-panel-cleaning-robot-(?!price)[a-z0-9-]+$/;

const PROJECT_FILTER_SEGMENTS = new Set([
  "automatic",
  "semi-automatic",
  "capex",
  "opex",
]);

/** Buyer-intent routes that embed PriceCalculatorPage on the client. */
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
 * Maps internal paths to `messages/pages/{locale}/{stem}.json` stems.
 * Keep in sync with `clientNamespacesForPathname` in client-message-namespaces.ts.
 */
export const ROUTE_MESSAGE_MODULE: Record<string, string> = {
  "/": "home",
  "/blog": "blog",
  "/projects": "projects",
  "/company": "company",
  "/contact": "contact",
  "/authors": "authors",
  "/solar-panel-cleaning-system": "solar-system",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system": "glyde",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers":
    "glyde-x",
  "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot": "nyuma",
  "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot":
    "nyuma-x",
  "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system":
    "helyx",
  "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app":
    "nectyr",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service":
    "cleaning-service",
  "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot": "miny",
  "/solar-panel-cleaning-system/cradyl-row-transfer-docking-station": "cradyl",
  "/solar-panel-cleaning-system/orion-plant-intelligence-platform": "orion",
  "/solar-panel-cleaning-robot-price-india": "robot-price-india",
  "/solar-panel-cleaning-robot-price-calculator": "price-calculator",
  "/utility-scale-solar-operations": "utility-operations",
  "/solar-panel-cleaning-service-india": "solar-panel-cleaning-service-india",
  "/solar-om-services": "solar-om-services",
  "/solar-cleaning-opex-pricing": "solar-cleaning-opex-pricing",
  "/solar-panel-cleaning-robot-for-rooftop":
    "solar-panel-cleaning-robot-for-rooftop",
  "/solar-panel-cleaning-robot-for-trackers":
    "solar-panel-cleaning-robot-for-trackers",
  "/solar-fleet-monitoring-software": "solar-fleet-monitoring-software",
  "/large-scale-solar-panel-cleaning": "large-scale-solar-panel-cleaning",
  "/solar-cleaning-capex-vs-opex": "solar-cleaning-capex-vs-opex",
  "/solar-panel-soiling-loss-calculator": "solar-panel-soiling-loss-calculator",
  "/solar-cleaning-robot-manufacturer-india":
    "solar-cleaning-robot-manufacturer-india",
  "/solar-plant-data-intelligence": "solar-plant-data-intelligence",
  "/enterprise-solar-cleaning-partnership":
    "enterprise-solar-cleaning-partnership",
  "/cleaning-technology": "cleaning-technology",
  "/technology/ai-intelligence": "ai-intelligence",
  "/solar-panel-cleaning-machine": "cleaning-machine",
  "/press": "press",
  "/careers": "careers",
  "/projects/automatic": "projects-filter",
  "/projects/semi-automatic": "projects-filter",
  "/projects/capex": "projects-filter",
  "/projects/opex": "projects-filter",
  "/privacy-policy": "privacy-policy",
  "/terms-of-service": "terms-of-service",
  "/cookie-policy": "cookie-policy",
  "/performance-and-test-methodology": "performance-methodology",
  "/insights": "insights",
  "/site-map": "site-map",
};

/** Primary page JSON stem for a path (used by sitemap locale quality). */
export function messageModuleStemForPath(internalPath: string): string | null {
  const path = normalizeInternalPath(internalPath.split("?")[0] ?? internalPath);
  if (ROUTE_MESSAGE_MODULE[path]) return ROUTE_MESSAGE_MODULE[path];
  if (path.startsWith("/blog") || path === "/authors") return "blog";
  if (path.startsWith("/projects/")) {
    const slug = path.slice("/projects/".length).split("/")[0];
    if (PROJECT_FILTER_SEGMENTS.has(slug)) return "projects-filter";
    if (slug) return "projects";
  }
  if (path.startsWith("/careers")) return "careers";
  if (path.startsWith("/technology/ai-intelligence")) return "ai-intelligence";
  if (STATE_LANDING_PATH_RE.test(path)) return "state-landings";
  if (path.startsWith("/compare/")) return "comparisons";
  if (path.startsWith("/insights/")) return "insights";
  return null;
}

function extraPageModulesForPath(path: string): string[] {
  const extras: string[] = [];

  if (path === "/" || path === "") {
    return [
      "solar-system.json",
      "projects.json",
      "price-calculator.json",
      "module-trust.json",
    ];
  }

  if (path === "/company" || path === "/cleaning-technology") {
    extras.push("module-trust.json");
  }

  if (path === "/solar-panel-cleaning-robot-price-india") {
    extras.push("price-calculator.json");
  }

  if (BUYER_INTENT_PATHS.has(path)) {
    extras.push("price-calculator.json");
  }

  if (
    path.startsWith("/solar-panel-cleaning-robot-") &&
    !path.startsWith("/solar-panel-cleaning-robot-price")
  ) {
    extras.push("price-calculator.json");
  }

  if (path === "/solar-panel-cleaning-system") {
    extras.push("price-calculator.json", "module-trust.json", "home.json");
  } else if (path.startsWith("/solar-panel-cleaning-system")) {
    extras.push("price-calculator.json", "module-trust.json");
  }

  if (path === "/site-map") {
    extras.push("comparisons.json");
  }

  if (path === "/utility-scale-solar-operations") {
    extras.push("company.json");
  }

  if (path.startsWith("/projects/")) {
    const slug = path.slice("/projects/".length).split("/")[0];
    if (PROJECT_FILTER_SEGMENTS.has(slug)) {
      extras.push("projects.json");
    }
  }

  return extras;
}

/**
 * JSON filenames under `messages/pages/{locale}/` to load for a request path.
 * Base `messages/{locale}.json` is always merged separately in load-messages.ts.
 */
export function pageModulesForPathname(pathname: string): string[] {
  const path = normalizeInternalPath(pathname.split("?")[0] ?? pathname);
  const files = new Set<string>();

  const stem = messageModuleStemForPath(path);
  if (stem) {
    files.add(`${stem}.json`);
  }

  for (const file of extraPageModulesForPath(path)) {
    files.add(file);
  }

  // Forms.leadModal is server-rendered on blog, compare, and buyer-intent pages.
  files.add("contact.json");

  return [...files].sort();
}
