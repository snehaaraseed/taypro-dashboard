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
]);

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
  "ProjectDetailPage",
  "ProjectsFilterPage",
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

export function clientNamespacesForRequest(pathname: string): string[] {
  const routeNamespaces = clientNamespacesForPathname(pathname);
  return [
    ...new Set([
      ...LAYOUT_CLIENT_NAMESPACES,
      ...CLIENT_PAGE_NAMESPACES,
      ...routeNamespaces,
    ]),
  ];
}
