import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { uploads } from "@/lib/db/schema";

export interface UploadRecord {
  url: string;
  name: string;
  size: number;
  modified: string;
}

export async function registerUpload(input: {
  url: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
}): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .insert(uploads)
    .values({
      url: input.url,
      fileName: input.fileName,
      filePath: input.filePath,
      mimeType: input.mimeType,
      size: input.size,
      uploadedAt: now,
    })
    .onConflictDoNothing();
}

export async function updateUploadSize(url: string, size: number): Promise<void> {
  const db = getDb();
  await db.update(uploads).set({ size }).where(eq(uploads.url, url));
}

export async function listUploads(limit = 3000): Promise<UploadRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(uploads)
    .orderBy(desc(uploads.uploadedAt))
    .limit(limit);

  return rows.map((row) => ({
    url: row.url,
    name: row.fileName,
    size: row.size,
    modified: row.uploadedAt,
  }));
}
