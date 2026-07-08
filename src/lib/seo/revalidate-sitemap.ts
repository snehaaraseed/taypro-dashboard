import { revalidatePath } from "next/cache";

/** Refresh dynamic sitemap and robots after CMS publishes. */
export function revalidateSitemap(): void {
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}
