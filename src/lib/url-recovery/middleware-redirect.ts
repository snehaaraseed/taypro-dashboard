import { isActiveLocale } from "@/i18n/markets";
import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";
import { resolveAlias } from "@/lib/url-recovery/aliases";
import { isRecoveryBlocked } from "@/lib/url-recovery/static-match";

/** Build a locale-aware redirect target for middleware alias hits. */
export function resolveMiddlewareAliasRedirect(
  pathname: string
): string | null {
  if (isRecoveryBlocked(pathname)) return null;

  const logical = pathnameWithoutLocale(pathname);
  const destination = resolveAlias(logical);
  if (!destination || destination === logical) return null;

  const segments = pathname.split("/").filter(Boolean);
  const localePrefix =
    segments.length > 0 && isActiveLocale(segments[0]!) ? `/${segments[0]}` : "";

  return `${localePrefix}${destination}`;
}
