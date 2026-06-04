import { revalidatePath } from "next/cache";

/** Refresh dynamic sitemap and robots after CMS publishes. */
export function revalidateSitemap(): void {
  revalidatePath("/sitemap.xml");
  // robots.txt is static in public/robots.txt (no revalidate needed)
}
