import "server-only";

import { readFile, writeFile } from "fs/promises";
import sharp from "sharp";
import {
  UPLOAD_CONTEXTS,
  type UploadContext,
} from "@/lib/cms/imageUploadTypes";
import type { SavedImage } from "@/lib/cms/saveProcessedImage";

/** Skip recompression when WebP is already small (matches compress-uploads.mjs). */
const SKIP_IF_WEBP_UNDER_BYTES = 180 * 1024;

const TARGET_MAX_BYTES: Partial<Record<UploadContext, number>> = {
  "blog-featured": 350_000,
  "blog-generated-hero": 400_000,
  "project-hero": 400_000,
  "blog-inline": 220_000,
  "blog-generated-inline": 220_000,
  "project-inline": 220_000,
  "author-avatar": 80_000,
};

const DEFAULT_TARGET_MAX_BYTES = 400_000;
const MIN_QUALITY = 62;

async function recompressWebpFile(
  saved: SavedImage,
  context: UploadContext,
  quality: number
): Promise<SavedImage | null> {
  const input = await readFile(saved.filePath);
  const before = input.length;
  const { maxWidth } = UPLOAD_CONTEXTS[context];

  const result = await sharp(input)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  if (result.data.length >= before * 0.97) {
    return null;
  }

  await writeFile(saved.filePath, result.data);

  return {
    ...saved,
    size: result.data.length,
    width: result.info.width,
    height: result.info.height,
  };
}

/**
 * Second-pass compression after CMS save — mirrors assets:compress-uploads:apply
 * so new uploads stay LCP-friendly without a manual batch job.
 */
export async function finalizeSavedUpload(
  saved: SavedImage,
  context: UploadContext
): Promise<SavedImage> {
  if (saved.mimeType === "image/gif") {
    return saved;
  }

  const targetMax = TARGET_MAX_BYTES[context] ?? DEFAULT_TARGET_MAX_BYTES;
  let current = saved;

  if (current.size <= SKIP_IF_WEBP_UNDER_BYTES) {
    return current;
  }

  let quality = UPLOAD_CONTEXTS[context].quality;

  while (quality >= MIN_QUALITY) {
    const next = await recompressWebpFile(current, context, quality);
    if (!next) {
      quality -= 6;
      continue;
    }
    current = next;
    if (current.size <= targetMax) {
      break;
    }
    quality -= 6;
  }

  return current;
}
