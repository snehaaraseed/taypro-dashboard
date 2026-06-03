import "server-only";

import { and, asc, eq, lte, sql } from "drizzle-orm";
import type { TayproLocale } from "@/i18n/markets";
import { getDb } from "@/lib/db";
import { blogs, projects, translationQueue } from "@/lib/db/schema";
import { getBlogTranslationMaxPerDay, SOURCE_LOCALE, TARGET_LOCALES } from "./config";
import { isGeminiQuotaError } from "./quota";
import type { BatchTranslationResult } from "./translate-cms";
import {
  listEnglishBlogSlugs,
  listEnglishProjectSlugs,
  translatePublishedBlog,
  translatePublishedProject,
} from "./translate-cms";

export type TranslationContentType = "blog" | "project";

const MAX_JOBS_PER_RUN = 8;
const MAX_ATTEMPTS = 96;

/** Backoff for legacy translation_queue rows (admin / manual tooling only). */
const INITIAL_QUOTA_RETRY_MS = 30 * 60 * 1000;

function nowIso(): string {
  return new Date().toISOString();
}

function addMs(iso: string, ms: number): string {
  return new Date(new Date(iso).getTime() + ms).toISOString();
}

function quotaBackoffMs(attempts: number): number {
  const hourMs = 60 * 60 * 1000;
  const hours = Math.min(Math.pow(2, Math.floor(attempts / 2)), 24);
  return Math.max(INITIAL_QUOTA_RETRY_MS, hours * hourMs);
}

function otherErrorBackoffMs(): number {
  return 6 * 60 * 60 * 1000;
}

export async function enqueueTranslationRetry(
  contentType: TranslationContentType,
  slug: string,
  locale: TayproLocale,
  error?: unknown,
  options?: { immediate?: boolean }
): Promise<void> {
  const db = getDb();
  const now = nowIso();
  const errMsg =
    error instanceof Error
      ? error.message
      : error
        ? String(error)
        : undefined;
  const isQuota = error ? isGeminiQuotaError(error) : true;
  const delayMs = isQuota ? INITIAL_QUOTA_RETRY_MS : otherErrorBackoffMs();
  const nextRetryAt = options?.immediate ? now : addMs(now, delayMs);

  const existing = await db
    .select()
    .from(translationQueue)
    .where(
      and(
        eq(translationQueue.contentType, contentType),
        eq(translationQueue.slug, slug),
        eq(translationQueue.locale, locale)
      )
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(translationQueue)
      .set({
        lastError: errMsg?.slice(0, 500) ?? existing[0].lastError,
        nextRetryAt:
          existing[0].nextRetryAt > now
            ? existing[0].nextRetryAt
            : nextRetryAt,
        updatedAt: now,
      })
      .where(eq(translationQueue.id, existing[0].id));
    return;
  }

  await db.insert(translationQueue).values({
    contentType,
    slug,
    locale,
    attempts: 0,
    lastError: errMsg?.slice(0, 500),
    nextRetryAt,
    createdAt: now,
    updatedAt: now,
  });
}

export async function clearTranslationRetry(
  contentType: TranslationContentType,
  slug: string,
  locale: TayproLocale
): Promise<void> {
  const db = getDb();
  await db
    .delete(translationQueue)
    .where(
      and(
        eq(translationQueue.contentType, contentType),
        eq(translationQueue.slug, slug),
        eq(translationQueue.locale, locale)
      )
    );
}

async function rescheduleJob(
  jobId: number,
  attempts: number,
  error: unknown
): Promise<void> {
  const db = getDb();
  const now = nowIso();
  const isQuota = isGeminiQuotaError(error);
  const delayMs = isQuota ? quotaBackoffMs(attempts) : otherErrorBackoffMs();
  const errMsg = error instanceof Error ? error.message : String(error);

  await db
    .update(translationQueue)
    .set({
      attempts: attempts + 1,
      lastError: errMsg.slice(0, 500),
      nextRetryAt: addMs(now, delayMs),
      updatedAt: now,
    })
    .where(eq(translationQueue.id, jobId));
}

export type ProcessTranslationQueueResult = {
  due: number;
  processed: number;
  succeeded: number;
  rescheduled: number;
  abandoned: number;
  details: {
    contentType: TranslationContentType;
    slug: string;
    locale: string;
    status: "succeeded" | "rescheduled" | "abandoned";
    error?: string;
  }[];
};

async function isLocaleOutOfSync(
  table: typeof blogs | typeof projects,
  slug: string,
  locale: TayproLocale
): Promise<boolean> {
  const db = getDb();
  const [source] = await db
    .select({ updatedAt: table.updatedAt })
    .from(table)
    .where(and(eq(table.slug, slug), eq(table.locale, SOURCE_LOCALE)))
    .limit(1);
  if (!source?.updatedAt) return false;

  const [target] = await db
    .select({ updatedAt: table.updatedAt })
    .from(table)
    .where(and(eq(table.slug, slug), eq(table.locale, locale)))
    .limit(1);

  return !target?.updatedAt || target.updatedAt < source.updatedAt;
}

/** Published EN blogs missing or stale in at least one target locale (FIFO backlog). */
export async function listBlogSlugsNeedingTranslation(
  limit: number
): Promise<string[]> {
  const db = getDb();
  const slugs = await listEnglishBlogSlugs();
  const candidates: { slug: string; missingLocales: number; sortKey: string }[] =
    [];

  for (const slug of slugs) {
    let missingLocales = 0;
    for (const locale of TARGET_LOCALES) {
      if (await isLocaleOutOfSync(blogs, slug, locale)) missingLocales += 1;
    }
    if (missingLocales === 0) continue;

    const [row] = await db
      .select({ createdAt: blogs.createdAt, updatedAt: blogs.updatedAt })
      .from(blogs)
      .where(and(eq(blogs.slug, slug), eq(blogs.locale, SOURCE_LOCALE)))
      .limit(1);
    const sortKey = row?.createdAt ?? row?.updatedAt ?? slug;
    candidates.push({ slug, missingLocales, sortKey });
  }

  candidates.sort((a, b) => {
    if (b.missingLocales !== a.missingLocales) {
      return b.missingLocales - a.missingLocales;
    }
    return a.sortKey.localeCompare(b.sortKey);
  });

  return candidates.slice(0, limit).map((c) => c.slug);
}

export type ProcessDailyBlogTranslationsResult = {
  maxBlogs: number;
  selected: string[];
  processed: number;
  completed: number;
  partial: number;
  skippedQuota: number;
  /** True when Gemini quota was hit — remaining blogs wait until tomorrow's cron. */
  quotaSkippedForDay: boolean;
  blogs: {
    slug: string;
    status: "completed" | "partial" | "skipped_quota" | "failed";
    results: BatchTranslationResult["results"];
  }[];
};

/** Translate up to N published blogs into all missing target locales (daily cron). */
export async function processDailyBlogTranslations(options?: {
  maxBlogs?: number;
}): Promise<ProcessDailyBlogTranslationsResult> {
  const maxBlogs = options?.maxBlogs ?? getBlogTranslationMaxPerDay();
  const selected = await listBlogSlugsNeedingTranslation(maxBlogs);

  const result: ProcessDailyBlogTranslationsResult = {
    maxBlogs,
    selected,
    processed: 0,
    completed: 0,
    partial: 0,
    skippedQuota: 0,
    quotaSkippedForDay: false,
    blogs: [],
  };

  let stopForQuota = false;

  for (const slug of selected) {
    if (stopForQuota) break;

    result.processed += 1;

    try {
      const batch = await translatePublishedBlog(slug);
      const failures = batch.results.filter((r) => !r.success);
      const quotaFailure = failures.some((r) =>
        isGeminiQuotaError(new Error(r.error ?? "quota"))
      );

      let status: ProcessDailyBlogTranslationsResult["blogs"][number]["status"];
      if (failures.length === 0) {
        status = "completed";
        result.completed += 1;
      } else if (quotaFailure) {
        status = "skipped_quota";
        result.skippedQuota += 1;
        stopForQuota = true;
      } else {
        status = "partial";
        result.partial += 1;
      }

      result.blogs.push({ slug, status, results: batch.results });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      result.blogs.push({
        slug,
        status: isGeminiQuotaError(error) ? "skipped_quota" : "failed",
        results: TARGET_LOCALES.map((locale) => ({
          locale,
          success: false,
          error: message,
        })),
      });
      if (isGeminiQuotaError(error)) {
        result.skippedQuota += 1;
        stopForQuota = true;
      } else {
        result.partial += 1;
      }
    }
  }

  result.quotaSkippedForDay = stopForQuota;
  return result;
}

/** Enqueue published projects missing translations (blogs use daily batch instead). */
export async function reconcileTranslationQueue(): Promise<{
  blogsEnqueued: number;
  projectsEnqueued: number;
}> {
  let blogsEnqueued = 0;
  let projectsEnqueued = 0;

  for (const slug of await listEnglishProjectSlugs()) {
    for (const locale of TARGET_LOCALES) {
      if (!(await isLocaleOutOfSync(projects, slug, locale))) continue;
      const db = getDb();
      const existing = await db
        .select({ id: translationQueue.id })
        .from(translationQueue)
        .where(
          and(
            eq(translationQueue.contentType, "project"),
            eq(translationQueue.slug, slug),
            eq(translationQueue.locale, locale)
          )
        )
        .limit(1);
      if (existing.length > 0) continue;
      await enqueueTranslationRetry("project", slug, locale, undefined, {
        immediate: true,
      });
      projectsEnqueued += 1;
    }
  }

  return { blogsEnqueued, projectsEnqueued };
}

export async function getTranslationQueueStats(): Promise<{
  pending: number;
  dueNow: number;
}> {
  const db = getDb();
  const now = nowIso();
  const [pendingRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(translationQueue);
  const [dueRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(translationQueue)
    .where(lte(translationQueue.nextRetryAt, now));

  return {
    pending: Number(pendingRow?.count ?? 0),
    dueNow: Number(dueRow?.count ?? 0),
  };
}

export async function processTranslationQueue(options?: {
  reconcile?: boolean;
}): Promise<ProcessTranslationQueueResult & { reconciled?: { blogsEnqueued: number; projectsEnqueued: number } }> {
  const reconciled = options?.reconcile
    ? await reconcileTranslationQueue()
    : undefined;

  const db = getDb();
  const now = nowIso();

  const dueJobs = await db
    .select()
    .from(translationQueue)
    .where(lte(translationQueue.nextRetryAt, now))
    .orderBy(asc(translationQueue.nextRetryAt))
    .limit(MAX_JOBS_PER_RUN);

  const result: ProcessTranslationQueueResult & {
    reconciled?: { blogsEnqueued: number; projectsEnqueued: number };
  } = {
    due: dueJobs.length,
    processed: 0,
    succeeded: 0,
    rescheduled: 0,
    abandoned: 0,
    details: [],
    reconciled,
  };

  let stopForQuota = false;

  for (const job of dueJobs) {
    if (stopForQuota) break;

    result.processed += 1;
    const locale = job.locale as TayproLocale;
    const contentType = job.contentType as TranslationContentType;

    if (job.attempts >= MAX_ATTEMPTS) {
      result.abandoned += 1;
      result.details.push({
        contentType,
        slug: job.slug,
        locale: job.locale,
        status: "abandoned",
        error: job.lastError ?? "Max retry attempts exceeded",
      });
      await db.delete(translationQueue).where(eq(translationQueue.id, job.id));
      continue;
    }

    try {
      const batch =
        contentType === "blog"
          ? await translatePublishedBlog(job.slug, {
              locales: [locale],
              force: false,
            })
          : await translatePublishedProject(job.slug, {
              locales: [locale],
              force: false,
            });

      const localeResult = batch.results.find((r) => r.locale === locale);

      if (localeResult?.success) {
        await clearTranslationRetry(contentType, job.slug, locale);
        result.succeeded += 1;
        result.details.push({
          contentType,
          slug: job.slug,
          locale: job.locale,
          status: "succeeded",
        });
        continue;
      }

      const err = new Error(
        localeResult?.error ?? "Translation failed without error message"
      );
      const quota = isGeminiQuotaError(err);
      if (quota || job.attempts < MAX_ATTEMPTS - 1) {
        await rescheduleJob(job.id, job.attempts, err);
        result.rescheduled += 1;
        result.details.push({
          contentType,
          slug: job.slug,
          locale: job.locale,
          status: "rescheduled",
          error: err.message,
        });
        if (quota) stopForQuota = true;
      } else {
        await db.delete(translationQueue).where(eq(translationQueue.id, job.id));
        result.abandoned += 1;
        result.details.push({
          contentType,
          slug: job.slug,
          locale: job.locale,
          status: "abandoned",
          error: err.message,
        });
      }
    } catch (error) {
      await rescheduleJob(job.id, job.attempts, error);
      result.rescheduled += 1;
      result.details.push({
        contentType,
        slug: job.slug,
        locale: job.locale,
        status: "rescheduled",
        error: error instanceof Error ? error.message : String(error),
      });
      if (isGeminiQuotaError(error)) stopForQuota = true;
    }
  }

  return result;
}
