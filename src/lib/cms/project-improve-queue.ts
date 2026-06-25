import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { applyProjectImprove } from "@/lib/cms/apply-project-improve";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { isGeminiQuotaError } from "@/lib/translation/quota";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export type ProjectImproveLog = (
  event: string,
  detail?: Record<string, unknown>
) => void;

export type ProcessProjectImproveBacklogResult = {
  backlog: number;
  processed: number;
  completed: number;
  failed: number;
  quotaStopped: boolean;
  deadlineStopped: boolean;
  items: Array<{
    slug: string;
    status: "completed" | "failed" | "skipped_quota";
    error?: string;
  }>;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Pause automated legacy project rewrites (post-writer phase). */
export function isCmsProjectImproveDisabled(): boolean {
  const raw = process.env.CMS_PROJECT_IMPROVE_DISABLED?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

/** Max legacy projects to improve per post-writer run (0 = unlimited until quota). */
export function getProjectImproveMaxPerRun(): number {
  return parsePositiveInt(
    process.env.CMS_PROJECT_IMPROVE_MAX_PER_RUN?.trim(),
    0
  );
}

/** English projects still on legacy editorial status (published first, then slug). */
export async function listProjectSlugsNeedingImprove(
  limit?: number
): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(
      and(eq(projects.locale, SOURCE_LOCALE), eq(projects.editorialStatus, "legacy"))
    )
    .orderBy(desc(projects.published), asc(projects.slug));

  const slugs = rows.map((r) => r.slug);
  return limit ? slugs.slice(0, limit) : slugs;
}

/**
 * Rewrite legacy English projects until quota, deadline, or backlog exhausted.
 * Does not retranslate — improved rows enter the translation backlog on the next run.
 */
export async function processProjectImproveBacklog(options?: {
  shouldStop?: () => boolean;
  log?: ProjectImproveLog;
  maxPerRun?: number;
}): Promise<ProcessProjectImproveBacklogResult> {
  const log = options?.log;
  const maxPerRun = options?.maxPerRun ?? getProjectImproveMaxPerRun();
  const backlog = (await listProjectSlugsNeedingImprove()).length;

  const result: ProcessProjectImproveBacklogResult = {
    backlog,
    processed: 0,
    completed: 0,
    failed: 0,
    quotaStopped: false,
    deadlineStopped: false,
    items: [],
  };

  if (backlog === 0) {
    log?.("project_improve_skip", { reason: "empty_backlog" });
    return result;
  }

  log?.("project_improve_start", { backlog, maxPerRun: maxPerRun || "unlimited" });

  while (true) {
    if (options?.shouldStop?.()) {
      result.deadlineStopped = true;
      log?.("project_improve_deadline_stop", { processed: result.processed });
      break;
    }

    if (maxPerRun > 0 && result.processed >= maxPerRun) {
      log?.("project_improve_cap_stop", { maxPerRun, processed: result.processed });
      break;
    }

    const [nextSlug] = await listProjectSlugsNeedingImprove(1);
    if (!nextSlug) break;

    log?.("project_improve_item_start", { slug: nextSlug });

    try {
      const applied = await applyProjectImprove(nextSlug, { retranslate: false });
      result.processed += 1;
      result.completed += 1;
      result.items.push({ slug: nextSlug, status: "completed" });
      log?.("project_improve_item_done", {
        slug: nextSlug,
        editorialStatus: applied.editorialStatus,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isGeminiQuotaError(error)) {
        result.quotaStopped = true;
        result.items.push({
          slug: nextSlug,
          status: "skipped_quota",
          error: message,
        });
        log?.("project_improve_quota_stop", { slug: nextSlug, error: message });
        break;
      }

      result.processed += 1;
      result.failed += 1;
      result.items.push({ slug: nextSlug, status: "failed", error: message });
      log?.("project_improve_item_failed", { slug: nextSlug, error: message });
    }
  }

  log?.("project_improve_end", {
    processed: result.processed,
    completed: result.completed,
    failed: result.failed,
    quotaStopped: result.quotaStopped,
    deadlineStopped: result.deadlineStopped,
  });

  return result;
}
