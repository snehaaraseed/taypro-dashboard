import { defineRouting } from "next-intl/routing";
import { ACTIVE_LOCALES } from "./markets";

export const routing = defineRouting({
  locales: [...ACTIVE_LOCALES],
  defaultLocale: "en",
  /** Keep indexed URLs: taypro.in/blog/... (no /en prefix) */
  localePrefix: "as-needed",
  /** Avoid NEXT_LOCALE on every HTML response (SiteOne security / cookie hardening). */
  localeCookie: false,
  /**
   * Accept-Language + middleware IP geo bias (Cloudflare cf-ipcountry, etc.).
   * India and unmapped countries default to English.
   */
  localeDetection: true,
});
