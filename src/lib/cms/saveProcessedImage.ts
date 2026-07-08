import "server-only";

import { access, mkdir, writeFile } from "fs/promises";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { registerUpload, updateUploadSize } from "@/lib/cms/uploadService";
import {
  buildUploadFileName,
  type UploadContext,
} from "@/lib/cms/imageUploadTypes";
import { processImageBuffer } from "@/lib/cms/processImageBuffer";
import { finalizeSavedUpload } from "@/lib/cms/uploadImageFinalize";
import { resolvePathInsideRoot, validateImageMagicBytes } from "@/lib/security";

export type SavedImage = {
  url: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
};

/** Validate, compress, name by context, persist under public/uploads/YYYY/MM/. */
export async function saveProcessedImage(input: {
  buffer: Buffer;
  mimeType: string;
  context: UploadContext;
  label: string;
}): Promise<SavedImage> {
  if (!validateImageMagicBytes(input.buffer, input.mimeType)) {
    throw new Error("Image buffer does not match declared MIME type");
  }

  const processed = await processImageBuffer(
    input.buffer,
    input.mimeType,
    input.context
  );

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uploadsRoot = path.join(getDeploymentRoot(), "public", "uploads");
  const uploadDir = resolvePathInsideRoot(uploadsRoot, year, month);
  if (!uploadDir) {
    throw new Error("Invalid upload path");
  }

  await mkdir(uploadDir, { recursive: true });

  const fileName = `${buildUploadFileName(input.context, input.label)}${processed.extension}`;
  const filePath = resolvePathInsideRoot(uploadDir, fileName);
  if (!filePath) {
    throw new Error("Invalid file path");
  }

  await writeFile(filePath, processed.buffer);
  await access(filePath);

  const publicUrl = `/uploads/${year}/${month}/${fileName}`;

  const initial: SavedImage = {
    url: publicUrl,
    fileName,
    filePath,
    mimeType: processed.mimeType,
    size: processed.buffer.length,
    width: processed.width,
    height: processed.height,
  };

  await registerUpload({
    url: publicUrl,
    fileName,
    filePath,
    mimeType: processed.mimeType,
    size: processed.buffer.length,
  });

  const finalized = await finalizeSavedUpload(initial, input.context);
  if (finalized.size !== initial.size) {
    await updateUploadSize(publicUrl, finalized.size);
  }
  return finalized;
}
