import "server-only";

import { generateBlogFeaturedImageImagen } from "@/lib/seo/blog-image-generate-imagen";
import { generateBlogFeaturedImagePollinations } from "@/lib/seo/blog-image-generate-pollinations";
import type { BlogFeaturedImagePick } from "@/lib/seo/blog-image-types";

export { isImagenQuotaError } from "@/lib/seo/blog-image-generate-imagen";
export { isPollinationsPaymentError } from "@/lib/seo/blog-image-generate-pollinations";

export type BlogImageProvider = "pollinations" | "imagen";

export function getBlogImageProvider(): BlogImageProvider {
  const explicit = process.env.BLOG_IMAGE_PROVIDER?.trim().toLowerCase();
  if (explicit === "pollinations" || explicit === "imagen") {
    return explicit;
  }
  if (process.env.POLLINATIONS_API_KEY?.trim()) {
    return "pollinations";
  }
  // Imagen requires paid Google AI billing — never default to it.
  return "pollinations";
}

export function isImageGenerationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.includes("402") ||
    message.toLowerCase().includes("quota") ||
    message.toLowerCase().includes("payment") ||
    message.toLowerCase().includes("pollen")
  );
}

/** Generate a blog hero image and save under public/uploads. */
export async function generateBlogFeaturedImage(input: {
  title: string;
  description: string;
  seoKeyword?: string;
}): Promise<BlogFeaturedImagePick> {
  const provider = getBlogImageProvider();
  if (provider === "pollinations") {
    return generateBlogFeaturedImagePollinations(input);
  }
  return generateBlogFeaturedImageImagen(input);
}
