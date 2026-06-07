import { defineRouting } from "next-intl/routing";
import { ACTIVE_LOCALES } from "./markets";

export const routing = defineRouting({
  locales: [...ACTIVE_LOCALES],
  defaultLocale: "en",
  /** Keep indexed URLs: taypro.in/blog/... (no /en prefix) */
  localePrefix: "as-needed",
  /**
   * Cookie + Accept-Language; middleware biases Accept-Language from IP geo
   * (Cloudflare cf-ipcountry, etc.) for non-India Tier 1 + Japan only.
   * India and unmapped countries default to English.
   */
  localeDetection: true,
});
