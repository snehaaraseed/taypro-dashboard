import "server-only";

import {
  type UploadContext,
  sanitizeUploadLabel,
} from "@/lib/cms/imageUploadTypes";
import { saveProcessedImage } from "@/lib/cms/saveProcessedImage";

/** Persist a validated image buffer under public/uploads/YYYY/MM/ and register in CMS. */
export async function saveImageBuffer(input: {
  buffer: Buffer;
  mimeType: string;
  context: UploadContext;
  label: string;
}): Promise<{ url: string; fileName: string; filePath: string }> {
  const saved = await saveProcessedImage({
    buffer: input.buffer,
    mimeType: input.mimeType,
    context: input.context,
    label: sanitizeUploadLabel(input.label),
  });

  return {
    url: saved.url,
    fileName: saved.fileName,
    filePath: saved.filePath,
  };
}
