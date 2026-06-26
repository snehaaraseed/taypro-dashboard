import "server-only";

import sharp from "sharp";
import {
  type UploadContext,
  isAiGeneratedUploadContext,
  UPLOAD_CONTEXTS,
} from "@/lib/cms/imageUploadTypes";

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  width: number;
  height: number;
};

type RawPixelFrame = {
  data: Buffer;
  width: number;
  height: number;
  channels: 1 | 2 | 3 | 4;
};

/** Decode to raw pixels so EXIF/XMP/IPTC/C2PA/PNG text chunks cannot survive. */
async function decodeToRawPixels(buffer: Buffer): Promise<RawPixelFrame> {
  const { data, info } = await sharp(buffer, { failOn: "none" })
    .rotate()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  if (channels < 1 || channels > 4) {
    throw new Error(`Unsupported image channel count: ${channels}`);
  }

  return {
    data,
    width: info.width,
    height: info.height,
    channels: channels as RawPixelFrame["channels"],
  };
}

async function encodeWebpFromRawPixels(
  frame: RawPixelFrame,
  maxWidth: number,
  quality: number
): Promise<ProcessedImage> {
  const result = await sharp(frame.data, {
    raw: {
      width: frame.width,
      height: frame.height,
      channels: frame.channels,
    },
  })
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

  if (isAiGeneratedUploadContext(context)) {
    const frame = await decodeToRawPixels(buffer);
    return encodeWebpFromRawPixels(frame, maxWidth, quality);
  }

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
