import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

/** Always required by layout chrome and global client widgets. */
export const LAYOUT_CLIENT_NAMESPACES = [
  "Navigation",
  "Footer",
  "LocaleSwitcher",
  "Forms",
  "NotFoundPage",
  "Common",
] as const;

const PROJECT_FILTER_SEGMENTS = new Set([
  "automatic",
  "semi-automatic",
  "capex",
  "opex",
]);

/** One namespace per buyer-intent route (avoid shipping all landing copy on every page). */
const BUYER_INTENT_NAMESPACE: Record<string, string> = {
  "/solar-panel-cleaning-service-india": "ServiceIndiaPage",
  "/solar-om-services": "SolarOmServicesPage",
  "/solar-cleaning-opex-pricing": "SolarCleaningOpexPricingPage",
  "/solar-panel-cleaning-robot-for-rooftop": "RooftopCleaningPage",
  "/solar-panel-cleaning-robot-for-trackers": "TrackerCleaningPage",
  "/solar-fleet-monitoring-software": "FleetMonitoringPage",
  "/large-scale-solar-panel-cleaning": "LargeScaleCleaningPage",
  "/solar-cleaning-capex-vs-opex": "SolarCleaningCapexVsOpexPage",
  "/solar-panel-soiling-loss-calculator": "SoilingLossCalculatorPage",
  "/solar-cleaning-robot-manufacturer-india": "ManufacturerIndiaPage",
  "/solar-plant-data-intelligence": "PlantDataIntelligencePage",
  "/enterprise-solar-cleaning-partnership": "EnterprisePartnershipPage",
};

/**
 * Namespaces used by full "use client" pages and shared client widgets.
 * Always included in the client bundle so client-side navigation does not
 * show raw message keys (layout does not re-run on route changes).
 */
export const CLIENT_PAGE_NAMESPACES = [
  "Home",
  "ContactPage",
  "CompanyPage",
  "ModuleManufacturerTrust",
  "PriceCalculatorPage",
  "RobotPriceIndiaPage",
  "StateLandingsPage",
  "BlogPage",
  "ProjectsPage",
  "ProjectDetailPage",
  "ProjectsFilterPage",
  "CareersPage",
  "ServiceIndiaPage",
  "SolarOmServicesPage",
  "SolarCleaningOpexPricingPage",
  "RooftopCleaningPage",
  "TrackerCleaningPage",
  "FleetMonitoringPage",
  "LargeScaleCleaningPage",
  "SolarCleaningCapexVsOpexPage",
  "SoilingLossCalculatorPage",
  "ManufacturerIndiaPage",
  "PlantDataIntelligencePage",
  "EnterprisePartnershipPage",
] as const;

/**
 * Extra translation namespaces for client components on this route.
 * Server components still use the full catalog from getRequestConfig.
 */
export function clientNamespacesForPathname(pathname: string): string[] {
  const path = pathnameWithoutLocale(pathname);

  if (path === "/" || path === "") {
    return ["Home", "PriceCalculatorPage"];
  }

  if (path === "/contact") {
    return ["ContactPage", "Common"];
  }

  if (path === "/company") {
    return ["CompanyPage", "Common"];
  }

  if (path === "/solar-panel-cleaning-robot-price-calculator") {
    return ["PriceCalculatorPage", "Common"];
  }

  if (path === "/solar-panel-cleaning-robot-price-india") {
    return ["RobotPriceIndiaPage", "PriceCalculatorPage", "Common"];
  }

  const buyerNamespace = BUYER_INTENT_NAMESPACE[path];
  if (buyerNamespace) {
    return [buyerNamespace, "PriceCalculatorPage", "Common"];
  }

  if (path.startsWith("/solar-panel-cleaning-robot-")) {
    return ["StateLandingsPage", "PriceCalculatorPage", "Common"];
  }

  // ROICalculatorEmbed is used on hub, product, service, and Opex pages under this prefix.
  if (path.startsWith("/solar-panel-cleaning-system")) {
    return ["PriceCalculatorPage"];
  }

  if (path.startsWith("/blog") || path === "/authors") {
    return ["BlogPage"];
  }

  if (path === "/projects") {
    return ["ProjectsPage", "Common"];
  }

  if (path === "/careers" || path.startsWith("/careers/")) {
    return ["CareersPage", "Common"];
  }

  if (path.startsWith("/projects/")) {
    const slug = path.slice("/projects/".length).split("/")[0];
    if (PROJECT_FILTER_SEGMENTS.has(slug)) {
      return ["ProjectsFilterPage", "Common"];
    }
    if (slug) {
      return ["ProjectDetailPage", "Common"];
    }
  }

  return [];
}

/** Layout chrome + route-specific client namespaces (not the full CLIENT_PAGE_NAMESPACES list). */
export function clientNamespacesForRequest(pathname: string): string[] {
  const routeNamespaces = clientNamespacesForPathname(pathname);
  return [...new Set([...LAYOUT_CLIENT_NAMESPACES, ...routeNamespaces])];
}
