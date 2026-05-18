import "server-only";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { registerUpload } from "@/lib/cms/uploadService";
import {
  resolvePathInsideRoot,
  validateImageMagicBytes,
} from "@/lib/security";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/** Persist a validated image buffer under public/uploads/YYYY/MM/ and register in CMS. */
export async function saveImageBuffer(input: {
  buffer: Buffer;
  mimeType: string;
  baseName: string;
}): Promise<{ url: string; fileName: string; filePath: string }> {
  const extension = MIME_TO_EXT[input.mimeType];
  if (!extension) {
    throw new Error(`Unsupported MIME type: ${input.mimeType}`);
  }

  if (!validateImageMagicBytes(input.buffer, input.mimeType)) {
    throw new Error("Image buffer does not match declared MIME type");
  }

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uploadsRoot = path.join(getDeploymentRoot(), "public", "uploads");
  const uploadDir = resolvePathInsideRoot(uploadsRoot, year, month);
  if (!uploadDir) {
    throw new Error("Invalid upload path");
  }

  await mkdir(uploadDir, { recursive: true });

  const sanitized = input.baseName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .substring(0, 80);
  const baseName = sanitized.length > 0 ? sanitized : "image";
  const fileName = `${baseName}-${Date.now()}${extension}`;
  const filePath = resolvePathInsideRoot(uploadDir, fileName);
  if (!filePath) {
    throw new Error("Invalid file path");
  }

  await writeFile(filePath, input.buffer);

  const publicUrl = `/uploads/${year}/${month}/${fileName}`;

  await registerUpload({
    url: publicUrl,
    fileName,
    filePath,
    mimeType: input.mimeType,
    size: input.buffer.length,
  });

  return { url: publicUrl, fileName, filePath };
}
