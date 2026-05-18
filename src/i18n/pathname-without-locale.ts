import { isActiveLocale } from "@/i18n/markets";

/** Strip leading locale segment for route matching (e.g. /hi/blog → /blog). */
export function pathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isActiveLocale(segments[0])) {
    const rest = segments.slice(1);
    return rest.length > 0 ? `/${rest.join("/")}` : "/";
  }
  return pathname || "/";
}
