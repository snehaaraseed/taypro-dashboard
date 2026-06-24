import "server-only";

import { createSlug } from "@/app/utils/blogFileUtils";
import { saveImageBuffer } from "@/lib/cms/saveImageBuffer";
import type { UploadContext } from "@/lib/cms/imageUploadTypes";
import {
  buildBlogHeroImagePrompt,
  buildBlogInlineImagePrompt,
  buildGeneratedBlogImageAlt,
  buildGeneratedBlogInlineImageAlt,
} from "@/lib/seo/blog-image-prompt";
import type { BlogFeaturedImagePick, BlogInlineImage } from "@/lib/seo/blog-image-types";

const POLLINATIONS_BASE = "https://gen.pollinations.ai";

/** ~0.07/img × 2 blog images ≈ 0.14 pollen (Seed tier cap 0.15/hour). */
const DEFAULT_IMAGE_MODEL = "grok-imagine-pro";
/** Grant-safe fallbacks when premium models reject payment. */
const DEFAULT_FALLBACK_MODELS = ["seedream5", "kontext"];
const DEFAULT_IMAGE_SIZE = "1280x720";
const DEFAULT_POLLEN_RETRY_WAIT_MS = 60 * 60 * 1000;

function getPollinationsApiKey(): string {
  const key = process.env.POLLINATIONS_API_KEY?.trim();
  if (!key) {
    throw new Error("POLLINATIONS_API_KEY is not set");
  }
  return key;
}

export function getPollinationsImageModel(): string {
  return process.env.POLLINATIONS_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
}

function getPollinationsModelChain(): string[] {
  const primary = getPollinationsImageModel();
  const fallbackRaw = process.env.POLLINATIONS_IMAGE_MODEL_FALLBACK?.trim();
  const fallbacks = fallbackRaw
    ? fallbackRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_FALLBACK_MODELS;
  return [...new Set([primary, ...fallbacks])];
}

function getPollinationsImageSize(): string {
  return process.env.POLLINATIONS_IMAGE_SIZE?.trim() || DEFAULT_IMAGE_SIZE;
}

function getPollinationsInlineImageSize(): string {
  return (
    process.env.POLLINATIONS_INLINE_IMAGE_SIZE?.trim() ||
    getPollinationsImageSize()
  );
}

function getPollenRetryWaitMs(): number {
  const raw = process.env.POLLINATIONS_POLLEN_RETRY_WAIT_MS?.trim();
  if (raw === "0" || raw === "false") return 0;
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_POLLEN_RETRY_WAIT_MS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const { url, model } = await requestPollinationsImage({
    prompt: buildBlogHeroImagePrompt(
      input.title,
      input.description,
      seoKeyword
    ),
    size: getPollinationsImageSize(),
    context: "blog-generated-hero",
    label: createSlug(input.title).slice(0, 50) || "hero",
  });

  return {
    url,
    alt: buildGeneratedBlogImageAlt(input.title, seoKeyword),
    source: `pollinations (${model})`,
    mode: "generated",
  };
}

/** Generate a mid-article inline figure via Pollinations. */
export async function generateBlogInlineImagePollinations(input: {
  title: string;
  description: string;
  seoKeyword?: string;
}): Promise<BlogInlineImage> {
  const seoKeyword = input.seoKeyword?.trim() || "solar panel maintenance";
  const slugBase = createSlug(input.title).slice(0, 44) || "inline";
  const { url, model } = await requestPollinationsImage({
    prompt: buildBlogInlineImagePrompt(
      input.title,
      input.description,
      seoKeyword
    ),
    size: getPollinationsInlineImageSize(),
    context: "blog-generated-inline",
    label: slugBase,
  });

  return {
    url,
    alt: buildGeneratedBlogInlineImageAlt(input.title, seoKeyword),
    source: `pollinations (${model}, inline)`,
  };
}

async function requestPollinationsImage(input: {
  prompt: string;
  size: string;
  context: UploadContext;
  label: string;
}): Promise<{ url: string; model: string }> {
  const models = getPollinationsModelChain();
  const retryWaitMs = getPollenRetryWaitMs();
  let lastError: unknown;

  for (const model of models) {
    try {
      return await requestPollinationsImageWithModel(input, model, retryWaitMs);
    } catch (error) {
      lastError = error;
      const hasNext = model !== models[models.length - 1];
      if (hasNext) {
        console.warn(
          `Pollinations model "${model}" failed, trying next fallback:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Pollinations image generation failed");
}

async function requestPollinationsImageWithModel(
  input: { prompt: string; size: string; context: UploadContext; label: string },
  model: string,
  retryWaitMs: number
): Promise<{ url: string; model: string }> {
  try {
    const saved = await requestPollinationsImageOnce(input, model);
    return { ...saved, model };
  } catch (error) {
    if (!isPollinationsPaymentError(error) || retryWaitMs <= 0) {
      throw error;
    }

    const waitMinutes = Math.round(retryWaitMs / 60_000);
    console.info(
      `Pollinations pollen exhausted on "${model}" — waiting ${waitMinutes} min for hourly refill, then retrying once`
    );
    await sleep(retryWaitMs);

    const saved = await requestPollinationsImageOnce(input, model);
    return { ...saved, model };
  }
}

async function requestPollinationsImageOnce(
  input: { prompt: string; size: string; context: UploadContext; label: string },
  model: string
): Promise<{ url: string }> {
  const response = await fetch(`${POLLINATIONS_BASE}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPollinationsApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: input.prompt,
      model,
      size: input.size,
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
  const saved = await saveImageBuffer({
    buffer,
    mimeType,
    context: input.context,
    label: input.label,
  });
  return { url: saved.url };
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
