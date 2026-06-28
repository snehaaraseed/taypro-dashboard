import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

type HeaderLike = { get(name: string): string | null };

/** Logical path without locale (e.g. `/blog`), from middleware request headers. */
export function resolveLogicalPathname(headers: HeaderLike): string {
  const logical = headers.get("x-logical-pathname")?.trim();
  if (logical) return logical;

  const pathname = headers.get("x-pathname")?.trim();
  if (pathname) return pathnameWithoutLocale(pathname);

  return "";
}
