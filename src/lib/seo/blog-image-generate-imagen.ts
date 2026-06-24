import "server-only";

import { GoogleGenAI } from "@google/genai";
import { createSlug } from "@/app/utils/blogFileUtils";
import { saveImageBuffer } from "@/lib/cms/saveImageBuffer";
import {
  buildBlogHeroImagePrompt,
  buildGeneratedBlogImageAlt,
} from "@/lib/seo/blog-image-prompt";
import type { BlogFeaturedImagePick } from "@/lib/seo/blog-image-types";

const DEFAULT_IMAGEN_MODEL = "imagen-4.0-fast-generate-001";

function getImagenModel(): string {
  return process.env.GEMINI_IMAGEN_MODEL?.trim() || DEFAULT_IMAGEN_MODEL;
}

function getGenAI(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: key });
}

export function isImagenQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.toLowerCase().includes("quota") ||
    message.toLowerCase().includes("resource exhausted") ||
    message.toLowerCase().includes("paid plans")
  );
}

/** Generate a blog hero with Google Imagen (paid tier). */
export async function generateBlogFeaturedImageImagen(input: {
  title: string;
  description: string;
  seoKeyword?: string;
}): Promise<BlogFeaturedImagePick> {
  const seoKeyword = input.seoKeyword?.trim() || "solar panel maintenance";
  const ai = getGenAI();
  const prompt = buildBlogHeroImagePrompt(
    input.title,
    input.description,
    seoKeyword
  );

  const response = await ai.models.generateImages({
    model: getImagenModel(),
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: "16:9",
      outputMimeType: "image/jpeg",
    },
  });

  const generated = response.generatedImages?.[0];
  const imageBytes = generated?.image?.imageBytes;
  if (!imageBytes) {
    const reason = generated?.raiFilteredReason;
    throw new Error(
      reason
        ? `Imagen filtered the image: ${reason}`
        : "Imagen returned no image data"
    );
  }

  const buffer = Buffer.from(imageBytes, "base64");
  const slugBase = createSlug(input.title).slice(0, 50) || "blog-hero";
  const saved = await saveImageBuffer({
    buffer,
    mimeType: "image/jpeg",
    context: "blog-generated-hero",
    label: slugBase,
  });

  return {
    url: saved.url,
    alt: buildGeneratedBlogImageAlt(input.title, seoKeyword),
    source: `imagen (${getImagenModel()})`,
    mode: "generated",
  };
}
