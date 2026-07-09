import { revalidatePath, revalidateTag } from "next/cache";
import { purgeCloudflarePaths } from "@/lib/seo/purge-cloudflare-cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { JOB_OPENINGS_CACHE_TAG } from "./job-openings";

/**
 * Bust cached job listings after ERPNext changes (webhook / cron).
 * Careers pages already fetch fresh; this refreshes sitemap + edge cache.
 */
export async function revalidateJobOpenings(): Promise<void> {
  revalidateTag(JOB_OPENINGS_CACHE_TAG, { expire: 0 });
  revalidatePath("/careers");
  revalidateSitemap();

  try {
    await purgeCloudflarePaths(["/careers"]);
  } catch (err) {
    console.error("[revalidate-job-openings] Cloudflare purge failed:", err);
  }
}
