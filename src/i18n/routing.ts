import { defineRouting } from "next-intl/routing";
import { ACTIVE_LOCALES } from "./markets";

export const routing = defineRouting({
  locales: [...ACTIVE_LOCALES],
  defaultLocale: "en",
  /** Keep indexed URLs: taypro.in/blog/... (no /en prefix) */
  localePrefix: "as-needed",
  localeDetection: true,
});
