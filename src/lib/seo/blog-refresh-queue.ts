import "server-only";

import { loadSemanticIntentRegistry } from "@/lib/seo/semantic-intent-registry";
import { listStalePublishedBlogs } from "@/lib/seo/blog-freshness";

const REFRESH_AGE_MS = 18 * 30 * 86_400_000;

/** Coordinates due for in-place refresh (burn window, not daily blog slot). */
export function listCoordinatesDueForRefresh(): Array<{
  coordinateKey: string;
  slug: string;
  title: string;
  writtenAt: string;
}> {
  const registry = loadSemanticIntentRegistry();
  const cutoff = Date.now() - REFRESH_AGE_MS;
  const out: Array<{
    coordinateKey: string;
    slug: string;
    title: string;
    writtenAt: string;
  }> = [];

  for (const [key, rec] of Object.entries(registry.byCoordinateKey)) {
    const written = new Date(rec.writtenAt).getTime();
    if (Number.isFinite(written) && written < cutoff) {
      out.push({
        coordinateKey: key,
        slug: rec.slug,
        title: rec.title,
        writtenAt: rec.writtenAt,
      });
    }
  }

  return out;
}

/** Legacy slug-based stale list for burn refresh queue. */
export async function listBlogRefreshCandidates(limit = 5): Promise<
  Awaited<ReturnType<typeof listStalePublishedBlogs>>
> {
  const stale = await listStalePublishedBlogs();
  return stale.slice(0, limit);
}
