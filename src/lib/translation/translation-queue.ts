import "server-only";

import { and, asc, eq, lte, sql } from "drizzle-orm";
import type { TayproLocale } from "@/i18n/markets";
import { getDb } from "@/lib/db";
import { blogs, projects, translationQueue } from "@/lib/db/schema";
import { isGemini503Error } from "./gemini-call";
import {
  getDailyTranslationMaxPerDay,
  getDailyTranslationSplitPerType,
  getTranslationRetry503Ms,
  getTranslationRetryErrorMs,
  SOURCE_LOCALE,
  TARGET_LOCALES,
} from "./config";
import { isGeminiQuotaError } from "./quota";
import type { BatchTranslationResult, TranslationResult } from "./translate-cms";
import {
  listEnglishBlogSlugs,
  listEnglishProjectSlugs,
  translatePublishedBlog,
  translatePublishedProject,
} from "./translate-cms";

export type TranslationContentType = "blog" | "project";

const MAX_JOBS_PER_RUN = 8;
const MAX_ATTEMPTS = 96;
/** Retries per queue item before giving up on non-quota transient errors. */
const MAX_DAILY_ITEM_ATTEMPTS = 48;

const PERMANENT_TRANSLATION_ERRORS = [
  "English source post not found",
  "Source post is not published or scheduled for translation",
  "English source project not found",
  "Source project is not published",
] as const;

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

type TranslationCandidate = {
  slug: string;
  missingLocales: number;
  /** ISO timestamp — newest English publish first. */
  sortKey: string;
};

async function englishSortKeyForSlug(
  table: typeof blogs | typeof projects,
  slug: string
): Promise<string> {
  const db = getDb();
  if (table === blogs) {
    const [row] = await db
      .select({
        publishDate: blogs.publishDate,
        updatedAt: blogs.updatedAt,
        createdAt: blogs.createdAt,
      })
      .from(blogs)
      .where(and(eq(blogs.slug, slug), eq(blogs.locale, SOURCE_LOCALE)))
      .limit(1);
    return row?.publishDate ?? row?.updatedAt ?? row?.createdAt ?? slug;
  }

  const [row] = await db
    .select({
      date: projects.date,
      updatedAt: projects.updatedAt,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, SOURCE_LOCALE)))
    .limit(1);
  return row?.date ?? row?.updatedAt ?? row?.createdAt ?? slug;
}

async function listSlugsNeedingTranslation(
  table: typeof blogs | typeof projects,
  englishSlugs: string[]
): Promise<TranslationCandidate[]> {
  const candidates: TranslationCandidate[] = [];

  for (const slug of englishSlugs) {
    let missingLocales = 0;
    for (const locale of TARGET_LOCALES) {
      if (await isLocaleOutOfSync(table, slug, locale)) missingLocales += 1;
    }
    if (missingLocales === 0) continue;

    const sortKey = await englishSortKeyForSlug(table, slug);
    candidates.push({ slug, missingLocales, sortKey });
  }

  candidates.sort((a, b) => {
    if (b.missingLocales !== a.missingLocales) {
      return b.missingLocales - a.missingLocales;
    }
    return b.sortKey.localeCompare(a.sortKey);
  });

  return candidates;
}

/** Published EN blogs missing or stale in at least one target locale (newest first). */
export async function listBlogSlugsNeedingTranslation(
  limit?: number
): Promise<string[]> {
  const candidates = await listSlugsNeedingTranslation(
    blogs,
    await listEnglishBlogSlugs()
  );
  const slugs = candidates.map((c) => c.slug);
  return limit ? slugs.slice(0, limit) : slugs;
}

/** Published EN projects missing or stale in at least one target locale (FIFO backlog). */
export async function listProjectSlugsNeedingTranslation(
  limit?: number
): Promise<string[]> {
  const candidates = await listSlugsNeedingTranslation(
    projects,
    await listEnglishProjectSlugs()
  );
  const slugs = candidates.map((c) => c.slug);
  return limit ? slugs.slice(0, limit) : slugs;
}

export type DailyTranslationQueueItem = {
  contentType: TranslationContentType;
  slug: string;
};

/** Split daily capacity between blogs and projects; spare slots shift to the larger backlog. */
export function allocateDailyTranslationSlots(options: {
  blogBacklog: number;
  projectBacklog: number;
  maxTotal: number;
  splitPerType: number;
}): { blogSlots: number; projectSlots: number } {
  const { blogBacklog, projectBacklog, maxTotal, splitPerType } = options;

  if (blogBacklog === 0 && projectBacklog === 0) {
    return { blogSlots: 0, projectSlots: 0 };
  }
  if (blogBacklog === 0) {
    return { blogSlots: 0, projectSlots: Math.min(maxTotal, projectBacklog) };
  }
  if (projectBacklog === 0) {
    return { blogSlots: Math.min(maxTotal, blogBacklog), projectSlots: 0 };
  }

  let blogSlots = Math.min(splitPerType, blogBacklog);
  let projectSlots = Math.min(splitPerType, projectBacklog);
  let remaining = maxTotal - blogSlots - projectSlots;

  while (remaining > 0) {
    const canAddBlog = blogBacklog - blogSlots;
    const canAddProject = projectBacklog - projectSlots;
    if (canAddBlog === 0 && canAddProject === 0) break;

    if (canAddProject >= canAddBlog && canAddProject > 0) {
      projectSlots += 1;
    } else if (canAddBlog > 0) {
      blogSlots += 1;
    } else {
      projectSlots += 1;
    }
    remaining -= 1;
  }

  return { blogSlots, projectSlots };
}

/** Interleave blog and project slugs so both progress in the same daily run. */
export function buildInterleavedDailyQueue(
  blogSlugs: string[],
  projectSlugs: string[]
): DailyTranslationQueueItem[] {
  const queue: DailyTranslationQueueItem[] = [];
  const maxLen = Math.max(blogSlugs.length, projectSlugs.length);

  for (let i = 0; i < maxLen; i += 1) {
    if (i < blogSlugs.length) {
      queue.push({ contentType: "blog", slug: blogSlugs[i] });
    }
    if (i < projectSlugs.length) {
      queue.push({ contentType: "project", slug: projectSlugs[i] });
    }
  }

  return queue;
}

export async function clearAllTranslationQueueRows(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(translationQueue);
  const pending = Number(row?.count ?? 0);
  if (pending > 0) {
    await db.delete(translationQueue);
  }
  return pending;
}

export type DailyTranslationItemResult = {
  contentType: TranslationContentType;
  slug: string;
  status: "completed" | "partial" | "skipped_quota" | "failed";
  results: BatchTranslationResult["results"];
};

export type ProcessDailyTranslationsResult = {
  maxPerDay: number;
  splitPerType: number;
  blogBacklog: number;
  projectBacklog: number;
  blogSlots: number;
  projectSlots: number;
  queue: DailyTranslationQueueItem[];
  processed: number;
  completed: number;
  partial: number;
  skippedQuota: number;
  /** True when all Gemini API keys hit quota — resumes after tomorrow's blog writer. */
  quotaSkippedForDay: boolean;
  /** True when an external deadline (e.g. midnight) stopped the run. */
  deadlineStopped?: boolean;
  catchup?: boolean;
  clearedQueueRows: number;
  items: DailyTranslationItemResult[];
};

/** @deprecated Use ProcessDailyTranslationsResult */
export type ProcessDailyBlogTranslationsResult = ProcessDailyTranslationsResult & {
  maxBlogs: number;
  selected: string[];
  blogs: DailyTranslationItemResult[];
};

async function translateQueueItem(
  item: DailyTranslationQueueItem,
  locales?: TayproLocale[]
): Promise<BatchTranslationResult> {
  const options = locales?.length ? { locales } : undefined;
  return item.contentType === "blog"
    ? translatePublishedBlog(item.slug, options)
    : translatePublishedProject(item.slug, options);
}

function mergeTranslationResults(
  accumulated: Map<TayproLocale, TranslationResult>,
  batch: BatchTranslationResult
): BatchTranslationResult {
  for (const result of batch.results) {
    accumulated.set(result.locale, result);
  }
  return {
    slug: batch.slug,
    type: batch.type,
    results: TARGET_LOCALES.map(
      (locale) =>
        accumulated.get(locale) ?? {
          locale,
          success: false,
          error: "Locale not attempted",
        }
    ),
  };
}

function failedLocalesFromBatch(batch: BatchTranslationResult): TayproLocale[] {
  return batch.results
    .filter((result) => {
      if (result.success) return false;
      const error = result.error ?? "";
      return !PERMANENT_TRANSLATION_ERRORS.some((msg) => error.includes(msg));
    })
    .map((result) => result.locale);
}

function dailyItemRetryDelayMs(batch: BatchTranslationResult): number {
  const failures = batch.results.filter((result) => !result.success);
  const only503 = failures.every((result) =>
    isGemini503Error(new Error(result.error ?? ""))
  );
  if (only503 && failures.length > 0) {
    return getTranslationRetry503Ms();
  }
  return getTranslationRetryErrorMs();
}

function errorRetryDelayMs(error: unknown): number {
  if (isGemini503Error(error)) {
    return getTranslationRetry503Ms();
  }
  return getTranslationRetryErrorMs();
}

function classifyTranslationBatch(
  batch: BatchTranslationResult
): {
  status: DailyTranslationItemResult["status"];
  quotaFailure: boolean;
} {
  const failures = batch.results.filter((r) => !r.success);
  const quotaFailure = failures.some((r) =>
    isGeminiQuotaError(new Error(r.error ?? "quota"))
  );

  if (failures.length === 0) {
    return { status: "completed", quotaFailure: false };
  }
  if (quotaFailure) {
    return { status: "skipped_quota", quotaFailure: true };
  }
  return { status: "partial", quotaFailure: false };
}

function isPermanentTranslationFailure(batch: BatchTranslationResult): boolean {
  return batch.results.some((result) => {
    if (result.success) return false;
    const error = result.error ?? "";
    return PERMANENT_TRANSLATION_ERRORS.some((msg) => error.includes(msg));
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type DailyTranslationLog = (
  event: string,
  detail?: Record<string, unknown>
) => void;

/**
 * Translate CMS blogs/projects (interleaved, one item at a time).
 * Post-writer mode: catchup=true + shouldStop at midnight IST (no daily cap).
 * Legacy mode: maxPerDay cap (manual/debug only).
 */
export async function processDailyTranslations(options?: {
  maxPerDay?: number;
  splitPerType?: number;
  log?: DailyTranslationLog;
  /** Process full backlog (no daily cap). */
  catchup?: boolean;
  /** Return true to stop after the current item (e.g. midnight IST). */
  shouldStop?: () => boolean;
}): Promise<ProcessDailyTranslationsResult> {
  const catchup = options?.catchup === true;

  const [allBlogSlugs, allProjectSlugs] = await Promise.all([
    listBlogSlugsNeedingTranslation(),
    listProjectSlugsNeedingTranslation(),
  ]);

  const blogBacklog = allBlogSlugs.length;
  const projectBacklog = allProjectSlugs.length;

  const maxPerDay = catchup
    ? blogBacklog + projectBacklog
    : (options?.maxPerDay ?? getDailyTranslationMaxPerDay());
  const splitPerType = catchup
    ? Math.max(blogBacklog, projectBacklog, 1)
    : (options?.splitPerType ?? getDailyTranslationSplitPerType());

  const { blogSlots, projectSlots } = allocateDailyTranslationSlots({
    blogBacklog,
    projectBacklog,
    maxTotal: maxPerDay,
    splitPerType,
  });

  const queue = buildInterleavedDailyQueue(
    allBlogSlugs.slice(0, blogSlots),
    allProjectSlugs.slice(0, projectSlots)
  );

  const result: ProcessDailyTranslationsResult = {
    maxPerDay,
    splitPerType,
    blogBacklog,
    projectBacklog,
    blogSlots,
    projectSlots,
    queue,
    processed: 0,
    completed: 0,
    partial: 0,
    skippedQuota: 0,
    quotaSkippedForDay: false,
    clearedQueueRows: 0,
    catchup,
    items: [],
  };

  const log = options?.log;
  const shouldStop = options?.shouldStop;
  let stopForQuota = false;
  let deadlineStopped = false;

  log?.("daily_run_start", {
    catchup,
    maxPerDay,
    splitPerType,
    blogBacklog,
    projectBacklog,
    blogSlots,
    projectSlots,
    queueSize: queue.length,
    queue: queue.map((entry) => `${entry.contentType}:${entry.slug}`),
  });

  for (const item of queue) {
    if (stopForQuota) break;
    if (shouldStop?.()) {
      deadlineStopped = true;
      log?.("deadline_stop", {
        contentType: item.contentType,
        slug: item.slug,
      });
      break;
    }

    let attempt = 0;
    let itemResult: DailyTranslationItemResult | null = null;
    const accumulatedResults = new Map<TayproLocale, TranslationResult>();
    let retryLocales: TayproLocale[] | undefined;

    while (!stopForQuota) {
      attempt += 1;
      log?.("item_attempt", {
        attempt,
        contentType: item.contentType,
        slug: item.slug,
        locales: retryLocales ?? TARGET_LOCALES,
      });

      try {
        const batch = mergeTranslationResults(
          accumulatedResults,
          await translateQueueItem(item, retryLocales)
        );
        const { status, quotaFailure } = classifyTranslationBatch(batch);

        if (quotaFailure) {
          result.skippedQuota += 1;
          itemResult = { ...item, status: "skipped_quota", results: batch.results };
          stopForQuota = true;
          log?.("item_quota_stop", {
            contentType: item.contentType,
            slug: item.slug,
            attempt,
            failures: batch.results.filter((r) => !r.success),
          });
          break;
        }

        if (status === "completed") {
          result.completed += 1;
          itemResult = { ...item, status: "completed", results: batch.results };
          log?.("item_completed", {
            contentType: item.contentType,
            slug: item.slug,
            attempt,
          });
          break;
        }

        retryLocales = failedLocalesFromBatch(batch);

        const permanent = isPermanentTranslationFailure(batch);
        if (permanent || attempt >= MAX_DAILY_ITEM_ATTEMPTS) {
          result.partial += 1;
          itemResult = {
            ...item,
            status: permanent ? "failed" : "partial",
            results: batch.results,
          };
          log?.(permanent ? "item_failed_permanent" : "item_failed_max_attempts", {
            contentType: item.contentType,
            slug: item.slug,
            attempt,
            failures: batch.results.filter((r) => !r.success),
          });
          break;
        }

        if (retryLocales.length === 0) {
          result.completed += 1;
          itemResult = { ...item, status: "completed", results: batch.results };
          log?.("item_completed", {
            contentType: item.contentType,
            slug: item.slug,
            attempt,
            note: "no_retryable_failures",
          });
          break;
        }

        const delayMs = dailyItemRetryDelayMs(batch);
        log?.("item_retry", {
          contentType: item.contentType,
          slug: item.slug,
          attempt,
          delayMs,
          retryLocales,
          failures: batch.results.filter((r) => !r.success),
        });
        await sleep(delayMs);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        const quota = isGeminiQuotaError(error);

        if (quota) {
          result.skippedQuota += 1;
          itemResult = {
            ...item,
            status: "skipped_quota",
            results: TARGET_LOCALES.map((locale) => ({
              locale,
              success: false,
              error: message,
            })),
          };
          stopForQuota = true;
          log?.("item_quota_stop", {
            contentType: item.contentType,
            slug: item.slug,
            attempt,
            error: message,
          });
          break;
        }

        if (attempt >= MAX_DAILY_ITEM_ATTEMPTS) {
          result.partial += 1;
          itemResult = {
            ...item,
            status: "failed",
            results: TARGET_LOCALES.map((locale) => ({
              locale,
              success: false,
              error: message,
            })),
          };
          log?.("item_failed_max_attempts", {
            contentType: item.contentType,
            slug: item.slug,
            attempt,
            error: message,
          });
          break;
        }

        const delayMs = errorRetryDelayMs(error);
        log?.("item_retry", {
          contentType: item.contentType,
          slug: item.slug,
          attempt,
          delayMs,
          error: message,
        });
        await sleep(delayMs);
      }
    }

    result.processed += 1;
    if (itemResult) result.items.push(itemResult);
  }

  result.deadlineStopped = deadlineStopped;

  log?.("daily_run_end", {
    processed: result.processed,
    completed: result.completed,
    partial: result.partial,
    skippedQuota: result.skippedQuota,
    quotaSkippedForDay: stopForQuota,
    deadlineStopped,
  });

  if (stopForQuota) {
    result.quotaSkippedForDay = true;
    result.clearedQueueRows = await clearAllTranslationQueueRows();
  }

  return result;
}

/** @deprecated Use processDailyTranslations */
export async function processDailyBlogTranslations(options?: {
  maxBlogs?: number;
}): Promise<ProcessDailyBlogTranslationsResult> {
  const daily = await processDailyTranslations({
    maxPerDay: options?.maxBlogs,
  });
  const blogs = daily.items.filter((item) => item.contentType === "blog");

  return {
    ...daily,
    maxBlogs: daily.maxPerDay,
    selected: blogs.map((item) => item.slug),
    blogs,
  };
}

/** Enqueue published blogs/projects missing translations (legacy retry queue). */
export async function reconcileTranslationQueue(): Promise<{
  blogsEnqueued: number;
  projectsEnqueued: number;
}> {
  let blogsEnqueued = 0;
  let projectsEnqueued = 0;

  for (const slug of await listBlogSlugsNeedingTranslation()) {
    for (const locale of TARGET_LOCALES) {
      if (!(await isLocaleOutOfSync(blogs, slug, locale))) continue;
      const db = getDb();
      const existing = await db
        .select({ id: translationQueue.id })
        .from(translationQueue)
        .where(
          and(
            eq(translationQueue.contentType, "blog"),
            eq(translationQueue.slug, slug),
            eq(translationQueue.locale, locale)
          )
        )
        .limit(1);
      if (existing.length > 0) continue;
      await enqueueTranslationRetry("blog", slug, locale, undefined, {
        immediate: true,
      });
      blogsEnqueued += 1;
    }
  }

  for (const slug of await listProjectSlugsNeedingTranslation()) {
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

  if (stopForQuota) {
    await clearAllTranslationQueueRows();
  }

  return result;
}
