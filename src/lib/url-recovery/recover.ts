import { findClosestSlug } from "@/lib/url-recovery/slug-match";
import { recoverStaticPath } from "@/lib/url-recovery/static-match";
import type { RecoveryResult } from "@/lib/url-recovery/types";

export function recoverBlogSlug(
  slug: string,
  publishedSlugs: string[]
): RecoveryResult {
  const match = findClosestSlug(slug, publishedSlugs);
  if (match.kind === "none") return match;
  return {
    ...match,
    destination: `/blog/${match.destination}`,
  };
}

export function recoverProjectSlug(
  slug: string,
  publishedSlugs: string[]
): RecoveryResult {
  const match = findClosestSlug(slug, publishedSlugs);
  if (match.kind === "none") return match;
  return {
    ...match,
    destination: `/projects/${match.destination}`,
  };
}

export { recoverStaticPath, findClosestSlug };
