import type { Redirect } from "next/dist/lib/load-custom-routes";
import { REDIRECTED_BLOG_TARGETS } from "./redirected-blog-slugs";

const LOCALE_PREFIX = "hi|ar|ja|bn";

/** Non-blog legacy paths → canonical routes (Ahrefs 404 remediation). */
export const LEGACY_STATIC_PATH_REDIRECTS: Record<string, string> = {
  "/performance-methodology": "/performance-and-test-methodology",
  "/solar-panel-cleaning-service":
    "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-service/solar-panel-cleaning-service":
    "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-system/solar-panel-cleaning-system-for-single-axis-trackers":
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
  // Renamed / typo project slugs (published under a different slug)
  "/projects/bu-bhandari-nashik-3-mw": "/projects/bu-bhandari-satana-nashik-3-mw",
  "/projects/panshina-gujrat-250-mw": "/projects/panshina-gujrat-75-mw",
};

function blogRedirectEntries(): [string, string][] {
  return Object.entries(REDIRECTED_BLOG_TARGETS).map(([slug, destination]) => [
    `/blog/${slug}`,
    destination,
  ]);
}

function expandWithLocales(
  from: string,
  to: string,
  options?: { localePrefixedDestination?: boolean }
): Redirect[] {
  const localePrefixedDestination = options?.localePrefixedDestination ?? true;

  const rules: Redirect[] = [
    { source: from, destination: to, permanent: true },
  ];

  if (localePrefixedDestination) {
    rules.push({
      source: `/:locale(${LOCALE_PREFIX})${from}`,
      destination: `/:locale${to}`,
      permanent: true,
    });
  } else {
    rules.push({
      source: `/:locale(${LOCALE_PREFIX})${from}`,
      destination: to,
      permanent: true,
    });
  }

  return rules;
}

/** Permanent redirects for next.config.ts (includes locale variants). */
export function getLegacyPathRedirects(): Redirect[] {
  const pairs: [string, string][] = [
    ...Object.entries(LEGACY_STATIC_PATH_REDIRECTS),
    ...blogRedirectEntries(),
  ];

  const seen = new Set<string>();
  const out: Redirect[] = [];

  for (const [from, to] of pairs) {
    if (seen.has(from)) continue;
    seen.add(from);
    const isBlog = from.startsWith("/blog/");
    out.push(
      ...expandWithLocales(from, to, {
        localePrefixedDestination: !isBlog,
      })
    );
  }

  return out;
}

/** Flat map for middleware aliases (pathname without locale). */
export function buildLegacyAliasMap(): Record<string, string> {
  const map: Record<string, string> = {
    ...LEGACY_STATIC_PATH_REDIRECTS,
  };
  for (const [slug, destination] of Object.entries(REDIRECTED_BLOG_TARGETS)) {
    map[`/blog/${slug}`] = destination;
  }
  return map;
}
