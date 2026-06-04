import "server-only";

import { listAllBlogs } from "@/lib/cms/blogService";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export type StaleBlogSummary = {
  slug: string;
  title: string;
  publishDate: string;
  updatedAt?: string;
  daysSinceUpdate: number;
};

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

/** Published English posts not updated recently (for editorial refresh hints). */
export async function listStalePublishedBlogs(options?: {
  olderThanDays?: number;
  limit?: number;
}): Promise<StaleBlogSummary[]> {
  const olderThanDays = options?.olderThanDays ?? 180;
  const limit = options?.limit ?? 8;
  const posts = await listAllBlogs(false, SOURCE_LOCALE);

  return posts
    .filter((p) => p.published !== false)
    .map((p) => {
      const ref = p.updatedAt || p.publishDate;
      return {
        slug: p.slug,
        title: p.title,
        publishDate: p.publishDate,
        updatedAt: p.updatedAt,
        daysSinceUpdate: daysSince(ref),
      };
    })
    .filter((p) => p.daysSinceUpdate >= olderThanDays)
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
    .slice(0, limit);
}
