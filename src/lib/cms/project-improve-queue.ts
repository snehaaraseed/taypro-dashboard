import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { applyProjectImprove } from "@/lib/cms/apply-project-improve";
import { readProjectFull } from "@/lib/cms/projectService";
import { ensureProjectFactsForImprove } from "@/lib/cms/project-improve-facts";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import {
  buildDifferentiationRetryBrief,
  getDefaultNarrativeAngleIndex,
  getMaxAnglesPerSlug,
} from "@/lib/cms/project-narrative-angle";
import {
  clearProjectImproveSlugState,
  getProjectImproveSlugState,
  loadProjectImproveFailStreaks,
  recordProjectImproveFailure,
} from "@/lib/cms/project-improve-state";
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
    attempts?: number;
    error?: string;
  }>;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** When true, blog/project translations run even while legacy project rewrites remain. */
export function isProjectTranslationParallel(): boolean {
  const raw = process.env.CMS_PROJECT_TRANSLATION_PARALLEL?.trim().toLowerCase();
  if (!raw) return true;
  return raw === "1" || raw === "true" || raw === "yes";
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
    3
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

  const failStreaks = loadProjectImproveFailStreaks();
  const slugs = rows
    .map((r) => r.slug)
    .sort((a, b) => {
      const fa = failStreaks.get(a) ?? 0;
      const fb = failStreaks.get(b) ?? 0;
      if (fa !== fb) return fa - fb;
      return a.localeCompare(b);
    });

  return limit ? slugs.slice(0, limit) : slugs;
}

async function improveSlugWithAngleRotation(
  slug: string,
  log?: ProjectImproveLog
): Promise<
  | { ok: true; attempts: number; editorialStatus: string }
  | { ok: false; attempts: number; error: string; quota: boolean }
> {
  const maxAngles = getMaxAnglesPerSlug();
  const stored = getProjectImproveSlugState(slug);
  const startAngle = stored?.nextAngle ?? getDefaultNarrativeAngleIndex(slug);
  let lastError = "Unknown error";
  let attempts = 0;

  const project = await readProjectFull(slug);
  if (!project) {
    return { ok: false, attempts: 0, error: `Project not found: ${slug}`, quota: false };
  }

  const enrichedFacts = ensureProjectFactsForImprove({
    slug,
    title: project.title,
    description: project.description,
    details: project.details,
    content: project.content,
    seoKeyword: project.seoKeyword,
    facts: project.facts,
  });

  for (let i = 0; i < maxAngles; i++) {
    const currentAngle = (startAngle + i) % maxAngles;
    attempts += 1;
    const retryBrief =
      i === 0
        ? undefined
        : buildDifferentiationRetryBrief(
            lastError,
            currentAngle,
            enrichedFacts,
            slug
          );

    log?.("project_improve_angle_attempt", {
      slug,
      angleIndex: currentAngle,
      attempt: attempts,
      maxAngles,
      retry: i > 0,
    });

    try {
      const applied = await applyProjectImprove(slug, {
        retranslate: false,
        narrativeAngleIndex: currentAngle,
        improvementBrief: retryBrief,
      });
      clearProjectImproveSlugState(slug);
      return {
        ok: true,
        attempts,
        editorialStatus: applied.editorialStatus,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (isGeminiQuotaError(error)) {
        return { ok: false, attempts, error: lastError, quota: true };
      }

      log?.("project_improve_angle_failed", {
        slug,
        angleIndex: currentAngle,
        error: lastError.slice(0, 300),
      });
    }
  }

  const nextAngle = (startAngle + maxAngles) % maxAngles;
  recordProjectImproveFailure(slug, nextAngle, lastError);
  return { ok: false, attempts, error: lastError, quota: false };
}

/**
 * Rewrite legacy English projects until quota, deadline, or backlog exhausted.
 * Each slug rotates through narrative angles on failure — never quarantined; stays legacy until success.
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

  log?.("project_improve_start", {
    backlog,
    maxPerRun: maxPerRun || "unlimited",
    maxAnglesPerSlug: getMaxAnglesPerSlug(),
  });

  const slugsToTry = await listProjectSlugsNeedingImprove(
    maxPerRun > 0 ? maxPerRun : undefined
  );

  for (const slug of slugsToTry) {
    if (options?.shouldStop?.()) {
      result.deadlineStopped = true;
      log?.("project_improve_deadline_stop", { processed: result.processed });
      break;
    }

    if (maxPerRun > 0 && result.completed + result.failed >= maxPerRun) {
      log?.("project_improve_cap_stop", {
        maxPerRun,
        completed: result.completed,
        failed: result.failed,
      });
      break;
    }

    log?.("project_improve_item_start", { slug });

    const outcome = await improveSlugWithAngleRotation(slug, log);
    result.processed += 1;

    if (outcome.ok) {
      result.completed += 1;
      result.items.push({
        slug,
        status: "completed",
        attempts: outcome.attempts,
      });
      log?.("project_improve_item_done", {
        slug,
        attempts: outcome.attempts,
        editorialStatus: outcome.editorialStatus,
      });
      continue;
    }

    if (outcome.quota) {
      result.quotaStopped = true;
      result.items.push({
        slug,
        status: "skipped_quota",
        attempts: outcome.attempts,
        error: outcome.error,
      });
      log?.("project_improve_quota_stop", {
        slug,
        attempts: outcome.attempts,
        error: outcome.error,
      });
      break;
    }

    result.failed += 1;
    result.items.push({
      slug,
      status: "failed",
      attempts: outcome.attempts,
      error: outcome.error,
    });
    log?.("project_improve_item_failed", {
      slug,
      attempts: outcome.attempts,
      error: outcome.error,
      note: "slug stays legacy; next run tries next narrative angle",
    });
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
