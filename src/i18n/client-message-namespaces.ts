import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

/** Always required by layout chrome and global client widgets. */
export const LAYOUT_CLIENT_NAMESPACES = [
  "Navigation",
  "Footer",
  "LocaleBanner",
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

  if (
    path === "/solar-panel-cleaning-robot-price-calculator" ||
    path.startsWith("/solar-panel-cleaning-system")
  ) {
    const extra: string[] = [];
    if (
      path === "/solar-panel-cleaning-system" ||
      path ===
        "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system" ||
      path === "/solar-panel-cleaning-system/solar-panel-cleaning-service"
    ) {
      extra.push("PriceCalculatorPage");
    }
    if (path === "/solar-panel-cleaning-robot-price-calculator") {
      return ["PriceCalculatorPage", "Common"];
    }
    return extra;
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
  return [...new Set([...LAYOUT_CLIENT_NAMESPACES, ...routeNamespaces])];
}
