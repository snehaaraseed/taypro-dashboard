import "server-only";

import { createSlug } from "@/app/utils/blogFileUtils";
import { saveImageBuffer } from "@/lib/cms/saveImageBuffer";
import {
  buildBlogHeroImagePrompt,
  buildGeneratedBlogImageAlt,
} from "@/lib/seo/blog-image-prompt";
import type { BlogFeaturedImagePick } from "@/lib/seo/blog-image-types";

const POLLINATIONS_BASE = "https://gen.pollinations.ai";

function getPollinationsApiKey(): string {
  const key = process.env.POLLINATIONS_API_KEY?.trim();
  if (!key) {
    throw new Error("POLLINATIONS_API_KEY is not set");
  }
  return key;
}

function getPollinationsImageModel(): string {
  // flux (Flux Schnell): ~0.00175 pollen/image — best balance for blog heroes.
  // gptimage: cheapest (~0.000006); zimage: alternative. Override via POLLINATIONS_IMAGE_MODEL.
  return process.env.POLLINATIONS_IMAGE_MODEL?.trim() || "flux";
}

function getPollinationsImageSize(): string {
  return process.env.POLLINATIONS_IMAGE_SIZE?.trim() || "1024x576";
}

export function isPollinationsPaymentError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("402") ||
    message.toLowerCase().includes("payment_required") ||
    message.toLowerCase().includes("insufficient pollen")
  );
}

/**
 * Generate a blog hero via Pollinations (OpenAI-compatible images API).
 * @see https://gen.pollinations.ai
 */
export async function generateBlogFeaturedImagePollinations(input: {
  title: string;
  description: string;
  seoKeyword?: string;
}): Promise<BlogFeaturedImagePick> {
  const seoKeyword = input.seoKeyword?.trim() || "solar panel maintenance";
  const prompt = buildBlogHeroImagePrompt(
    input.title,
    input.description,
    seoKeyword
  );
  const model = getPollinationsImageModel();

  const response = await fetch(`${POLLINATIONS_BASE}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPollinationsApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model,
      size: getPollinationsImageSize(),
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Pollinations image API ${response.status}: ${body.slice(0, 300)}`
    );
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };

  let buffer: Buffer | null = null;

  const b64 = payload.data?.[0]?.b64_json;
  if (b64) {
    buffer = Buffer.from(b64, "base64");
  } else {
    const imageUrl = payload.data?.[0]?.url;
    if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        throw new Error(`Pollinations image download failed: ${imgRes.status}`);
      }
      buffer = Buffer.from(await imgRes.arrayBuffer());
    }
  }

  if (!buffer || buffer.length < 1000) {
    throw new Error("Pollinations returned no image data");
  }

  const mimeType = detectImageMimeType(buffer);
  const slugBase = createSlug(input.title).slice(0, 50) || "blog-hero";
  const saved = await saveImageBuffer({
    buffer,
    mimeType,
    baseName: `blog-${slugBase}`,
  });

  return {
    url: saved.url,
    alt: buildGeneratedBlogImageAlt(input.title, seoKeyword),
    source: `pollinations (${model})`,
    mode: "generated",
  };
}

function detectImageMimeType(buffer: Buffer): "image/jpeg" | "image/png" {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  throw new Error("Pollinations returned an unsupported image format");
}
