import "server-only";

import sharp from "sharp";
import {
  type UploadContext,
  UPLOAD_CONTEXTS,
} from "@/lib/cms/imageUploadTypes";

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
};

/** Resize, auto-orient, and convert to WebP (GIFs are kept as-is). */
export async function processImageBuffer(
  buffer: Buffer,
  mimeType: string,
  context: UploadContext
): Promise<ProcessedImage> {
  if (mimeType === "image/gif") {
    const meta = await sharp(buffer, { animated: true }).metadata();
    return {
      buffer,
      mimeType: "image/gif",
      extension: ".gif",
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }

  const { maxWidth, quality } = UPLOAD_CONTEXTS[context];

  const result = await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    mimeType: "image/webp",
    extension: ".webp",
    width: result.info.width,
    height: result.info.height,
  };
}
