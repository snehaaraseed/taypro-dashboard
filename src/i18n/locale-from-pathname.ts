import type { TayproLocale } from "@/i18n/markets";
import { isActiveLocale } from "@/i18n/markets";

/** Derive locale from URL path (supports /en/... and default unprefixed English). */
export function localeFromPathname(pathname: string): TayproLocale {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg && isActiveLocale(seg)) return seg;
  return "en";
}
