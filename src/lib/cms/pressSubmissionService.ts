import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pressSubmissions } from "@/lib/db/schema";

export type SubmissionStatus = "pending" | "submitted" | "live" | "rejected";
export type BacklinkType = "dofollow" | "nofollow" | "none" | "unknown";

export type PressSubmission = {
  id: number;
  releaseSlug: string;
  targetId: string;
  status: SubmissionStatus;
  externalUrl: string | null;
  backlinkType: BacklinkType;
  submittedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt?: string;
};

function rowToSubmission(row: typeof pressSubmissions.$inferSelect): PressSubmission {
  return {
    id: row.id,
    releaseSlug: row.releaseSlug,
    targetId: row.targetId,
    status: (row.status as SubmissionStatus) ?? "pending",
    externalUrl: row.externalUrl ?? null,
    backlinkType: (row.backlinkType as BacklinkType) ?? "unknown",
    submittedAt: row.submittedAt ?? null,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
  };
}

export async function listSubmissionsForRelease(
  releaseSlug: string
): Promise<PressSubmission[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(pressSubmissions)
    .where(eq(pressSubmissions.releaseSlug, releaseSlug))
    .orderBy(desc(pressSubmissions.updatedAt));
  return rows.map(rowToSubmission);
}

export async function listAllSubmissions(): Promise<PressSubmission[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(pressSubmissions)
    .orderBy(desc(pressSubmissions.updatedAt));
  return rows.map(rowToSubmission);
}

export async function countLiveSubmissions(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ id: pressSubmissions.id })
    .from(pressSubmissions)
    .where(eq(pressSubmissions.status, "live"));
  return rows.length;
}

export async function upsertSubmission(data: {
  releaseSlug: string;
  targetId: string;
  status?: SubmissionStatus;
  externalUrl?: string | null;
  backlinkType?: BacklinkType;
  submittedAt?: string | null;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await db
      .select()
      .from(pressSubmissions)
      .where(
        and(
          eq(pressSubmissions.releaseSlug, data.releaseSlug),
          eq(pressSubmissions.targetId, data.targetId)
        )
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(pressSubmissions)
        .set({
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.externalUrl !== undefined ? { externalUrl: data.externalUrl } : {}),
          ...(data.backlinkType !== undefined ? { backlinkType: data.backlinkType } : {}),
          ...(data.submittedAt !== undefined ? { submittedAt: data.submittedAt } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          updatedAt: now,
        })
        .where(eq(pressSubmissions.id, existing[0].id));
    } else {
      await db.insert(pressSubmissions).values({
        releaseSlug: data.releaseSlug,
        targetId: data.targetId,
        status: data.status ?? "pending",
        externalUrl: data.externalUrl ?? null,
        backlinkType: data.backlinkType ?? "unknown",
        submittedAt: data.submittedAt ?? null,
        notes: data.notes ?? "",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upsert submission",
    };
  }
}

export async function ensurePendingSubmissionsForRelease(
  releaseSlug: string,
  targetIds: string[]
): Promise<void> {
  const now = new Date().toISOString();
  const db = getDb();
  for (const targetId of targetIds) {
    const existing = await db
      .select({ id: pressSubmissions.id })
      .from(pressSubmissions)
      .where(
        and(
          eq(pressSubmissions.releaseSlug, releaseSlug),
          eq(pressSubmissions.targetId, targetId)
        )
      )
      .limit(1);
    if (existing.length === 0) {
      await db.insert(pressSubmissions).values({
        releaseSlug,
        targetId,
        status: "pending",
        backlinkType: "unknown",
        notes: "",
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

export async function deleteSubmissionsForRelease(releaseSlug: string): Promise<void> {
  const db = getDb();
  await db
    .delete(pressSubmissions)
    .where(eq(pressSubmissions.releaseSlug, releaseSlug));
}
