import { existsSync } from "fs";
import { join } from "path";
import { ACTIVE_LOCALES, type TayproLocale } from "@/i18n/markets";
import { routing } from "@/i18n/routing";
import { normalizeInternalPath } from "./locale-alternates";

function resolveMessagesPagesRoot(): string {
  const candidates = [
    join(process.cwd(), "messages", "pages"),
    join(process.cwd(), "..", "messages", "pages"),
    join(process.cwd(), "..", "..", "messages", "pages"),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, "en", "home.json"))) return dir;
  }
  return candidates[0];
}

const MESSAGES_PAGES_ROOT = resolveMessagesPagesRoot();

const STATE_LANDING_PATH_RE =
  /^\/solar-panel-cleaning-robot-(?!price)[a-z0-9-]+$/;

/** Maps internal paths to `messages/pages/{locale}/{module}.json` stems. */
const ROUTE_MESSAGE_MODULE: Record<string, string> = {
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
  "/site-map": "site-map",
};

function messageModuleForPath(internalPath: string): string | null {
  const path = normalizeInternalPath(internalPath.split("?")[0] ?? internalPath);
  if (ROUTE_MESSAGE_MODULE[path]) return ROUTE_MESSAGE_MODULE[path];
  if (STATE_LANDING_PATH_RE.test(path)) return "state-landings";
  if (path.startsWith("/compare/")) return "comparisons";
  return null;
}

function hasDedicatedPageMessages(
  locale: TayproLocale,
  module: string
): boolean {
  return existsSync(join(MESSAGES_PAGES_ROOT, locale, `${module}.json`));
}

const dedicatedLocalesCache = new Map<string, TayproLocale[]>();

/** Locales with dedicated page JSON (not English-only fallback). */
export function getSitemapLocalesForPath(internalPath: string): TayproLocale[] {
  const module = messageModuleForPath(internalPath);
  if (!module) return [...ACTIVE_LOCALES];

  const cacheKey = module;
  const cached = dedicatedLocalesCache.get(cacheKey);
  if (cached) return cached;

  const locales: TayproLocale[] = [routing.defaultLocale as TayproLocale];
  for (const locale of ACTIVE_LOCALES) {
    if (locale === routing.defaultLocale) continue;
    if (hasDedicatedPageMessages(locale, module)) {
      locales.push(locale);
    }
  }

  dedicatedLocalesCache.set(cacheKey, locales);
  return locales;
}
