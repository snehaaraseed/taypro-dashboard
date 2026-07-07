import "server-only";

import { and, asc, eq, lte, sql } from "drizzle-orm";
import type { TayproLocale } from "@/i18n/markets";
import { getDb } from "@/lib/db";
import { blogs, projects, insights, translationQueue } from "@/lib/db/schema";
import { isGemini503Error } from "./gemini-call";
import {
  getBlogLocalesDueByStagger,
  getDailyTranslationMaxPerDay,
  getDailyTranslationSplitPerType,
  getDailyInsightTranslationMaxPerDay,
  getTranslationRetry503Ms,
  getTranslationRetryErrorMs,
  isCmsTranslationDisabled,
  isBlogTranslationStaggerEnabled,
  SOURCE_LOCALE,
  TARGET_LOCALES,
} from "./config";
import { isGeminiQuotaError } from "./quota";
import type { BatchTranslationResult, TranslationResult } from "./translate-cms";
import {
  acquireCatchupWorkerLock,
  releaseCatchupWorkerLock,
} from "./catchup-worker-lock";
import {
  listEnglishBlogSlugs,
  listEnglishProjectSlugs,
  listEnglishInsightSlugs,
  translatePublishedBlog,
  translatePublishedProject,
  translatePublishedInsight,
} from "./translate-cms";
import {
  isCmsProjectImproveDisabled,
  isProjectTranslationParallel,
  listProjectSlugsNeedingImprove,
  processProjectImproveBacklog,
  type ProcessProjectImproveBacklogResult,
} from "@/lib/cms/project-improve-queue";

export type TranslationContentType = "blog" | "project" | "insight";

const MAX_JOBS_PER_RUN = 8;
const MAX_ATTEMPTS = 96;
/** Retries per queue item before giving up on non-quota transient errors. */
const MAX_DAILY_ITEM_ATTEMPTS = 48;

const PERMANENT_TRANSLATION_ERRORS = [
  "English source post not found",
  "Source post is not published or scheduled for translation",
  "English source project not found",
  "Source project is not published",
  "English source insight not found",
  "Source insight is not published",
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

/** Enqueue target locales for a published English insight (legacy retry table). */
export async function enqueueInsightTranslations(slug: string): Promise<number> {
  let enqueued = 0;
  for (const locale of TARGET_LOCALES) {
    if (!(await isInsightLocaleOutOfSync(slug, locale))) continue;
    await enqueueTranslationRetry("insight", slug, locale, undefined, {
      immediate: true,
    });
    enqueued += 1;
  }
  return enqueued;
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

async function isInsightLocaleOutOfSync(
  slug: string,
  locale: TayproLocale
): Promise<boolean> {
  const db = getDb();
  const [source] = await db
    .select({ updatedAt: insights.updatedAt, published: insights.published })
    .from(insights)
    .where(and(eq(insights.slug, slug), eq(insights.locale, SOURCE_LOCALE)))
    .limit(1);
  if (!source?.updatedAt || !source.published) return false;

  const [target] = await db
    .select({ updatedAt: insights.updatedAt })
    .from(insights)
    .where(and(eq(insights.slug, slug), eq(insights.locale, locale)))
    .limit(1);

  return !target?.updatedAt || target.updatedAt < source.updatedAt;
}

type TranslationCandidate = {
  slug: string;
  missingLocales: number;
  /** ISO timestamp, newest English publish first. */
  sortKey: string;
};

async function getEnglishBlogPublishDate(slug: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ publishDate: blogs.publishDate })
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.locale, SOURCE_LOCALE)))
    .limit(1);
  return row?.publishDate ?? null;
}

/** Locales due today by stagger schedule and still out of sync with English. */
export async function getBlogLocalesToTranslateNow(
  slug: string,
  now = new Date()
): Promise<TayproLocale[]> {
  const publishDate = await getEnglishBlogPublishDate(slug);
  if (!publishDate) return [];

  const dueLocales = getBlogLocalesDueByStagger(publishDate, now);
  const outOfSync: TayproLocale[] = [];
  for (const locale of dueLocales) {
    if (await isLocaleOutOfSync(blogs, slug, locale)) {
      outOfSync.push(locale);
    }
  }
  return outOfSync;
}

async function countMissingLocalesForSlug(
  table: typeof blogs | typeof projects,
  slug: string,
  now = new Date()
): Promise<number> {
  if (table === blogs && isBlogTranslationStaggerEnabled()) {
    return (await getBlogLocalesToTranslateNow(slug, now)).length;
  }

  let missingLocales = 0;
  for (const locale of TARGET_LOCALES) {
    if (await isLocaleOutOfSync(table, slug, locale)) missingLocales += 1;
  }
  return missingLocales;
}

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
    const missingLocales = await countMissingLocalesForSlug(table, slug);
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

/** Published EN insights missing or stale in at least one target locale (newest first). */
export async function listInsightSlugsNeedingTranslation(
  limit?: number
): Promise<string[]> {
  const db = getDb();
  const englishSlugs = await listEnglishInsightSlugs();
  const candidates: TranslationCandidate[] = [];

  for (const slug of englishSlugs) {
    let missingLocales = 0;
    for (const locale of TARGET_LOCALES) {
      if (await isInsightLocaleOutOfSync(slug, locale)) missingLocales += 1;
    }
    if (missingLocales === 0) continue;

    const [row] = await db
      .select({
        publishDate: insights.publishDate,
        updatedAt: insights.updatedAt,
        createdAt: insights.createdAt,
      })
      .from(insights)
      .where(and(eq(insights.slug, slug), eq(insights.locale, SOURCE_LOCALE)))
      .limit(1);

    candidates.push({
      slug,
      missingLocales,
      sortKey: row?.publishDate ?? row?.updatedAt ?? row?.createdAt ?? slug,
    });
  }

  candidates.sort((a, b) => {
    if (b.missingLocales !== a.missingLocales) {
      return b.missingLocales - a.missingLocales;
    }
    return b.sortKey.localeCompare(a.sortKey);
  });

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

/** Interleave blog and project slugs (default 2 blogs : 1 project in burn mode). */
export function buildInterleavedDailyQueue(
  blogSlugs: string[],
  projectSlugs: string[],
  options?: { blogsPerProject?: number }
): DailyTranslationQueueItem[] {
  const blogsPerProject = Math.max(
    1,
    options?.blogsPerProject ??
      parsePositiveInt(process.env.GEMINI_BURN_INTERLEAVE_BLOGS?.trim(), 2)
  );
  const queue: DailyTranslationQueueItem[] = [];
  let bi = 0;
  let pi = 0;

  while (bi < blogSlugs.length || pi < projectSlugs.length) {
    for (let b = 0; b < blogsPerProject && bi < blogSlugs.length; b += 1) {
      queue.push({ contentType: "blog", slug: blogSlugs[bi++] });
    }
    if (pi < projectSlugs.length) {
      queue.push({ contentType: "project", slug: projectSlugs[pi++] });
    }
  }

  return queue;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
  insightBacklog: number;
  blogSlots: number;
  projectSlots: number;
  insightSlots: number;
  queue: DailyTranslationQueueItem[];
  processed: number;
  completed: number;
  partial: number;
  skippedQuota: number;
  /** True when all Gemini API keys hit quota, resumes after tomorrow's blog writer. */
  quotaSkippedForDay: boolean;
  /** True when an external deadline (e.g. midnight) stopped the run. */
  deadlineStopped?: boolean;
  catchup?: boolean;
  clearedQueueRows: number;
  items: DailyTranslationItemResult[];
  /** Post-writer legacy project rewrites (runs before translations in catchup mode). */
  projectImprove?: ProcessProjectImproveBacklogResult | null;
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
  if (item.contentType === "blog") {
    return translatePublishedBlog(item.slug, options);
  }
  if (item.contentType === "project") {
    return translatePublishedProject(item.slug, options);
  }
  return translatePublishedInsight(item.slug, options);
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
 * CMS automation worker: legacy project rewrites (catchup) then translations.
 * Post-writer mode: catchup=true + shouldStop at quota soft start (no daily cap).
 * Translations run only after the legacy rewrite backlog is empty.
 * Legacy mode: maxPerDay cap (manual/debug only).
 */
function emptyCatchupTranslationResult(): ProcessDailyTranslationsResult {
  return {
    maxPerDay: 0,
    splitPerType: 0,
    blogBacklog: 0,
    projectBacklog: 0,
    insightBacklog: 0,
    blogSlots: 0,
    projectSlots: 0,
    insightSlots: 0,
    queue: [],
    processed: 0,
    completed: 0,
    partial: 0,
    skippedQuota: 0,
    quotaSkippedForDay: false,
    clearedQueueRows: 0,
    catchup: true,
    items: [],
    projectImprove: null,
  };
}

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
  const log = options?.log;

  if (isCmsTranslationDisabled()) {
    log?.("skip", { reason: "cms_translation_disabled" });
    return emptyCatchupTranslationResult();
  }

  let catchupLockHeld = false;

  if (catchup) {
    if (!acquireCatchupWorkerLock()) {
      log?.("skip", { reason: "already_running" });
      return emptyCatchupTranslationResult();
    }
    catchupLockHeld = true;
  }

  try {
    return await runDailyTranslationsBody(options, catchup);
  } finally {
    if (catchupLockHeld) releaseCatchupWorkerLock();
  }
}

async function runDailyTranslationsBody(
  options: Parameters<typeof processDailyTranslations>[0],
  catchup: boolean
): Promise<ProcessDailyTranslationsResult> {
  const [allBlogSlugs, allProjectSlugs, allInsightSlugs] = await Promise.all([
    listBlogSlugsNeedingTranslation(),
    listProjectSlugsNeedingTranslation(),
    listInsightSlugsNeedingTranslation(),
  ]);

  const blogBacklog = allBlogSlugs.length;
  const projectBacklog = allProjectSlugs.length;
  const insightBacklog = allInsightSlugs.length;

  const maxPerDay = catchup
    ? blogBacklog + projectBacklog + insightBacklog
    : (options?.maxPerDay ?? getDailyTranslationMaxPerDay());
  const splitPerType = catchup
    ? Math.max(blogBacklog, projectBacklog, 1)
    : (options?.splitPerType ?? getDailyTranslationSplitPerType());

  const insightSlots = catchup
    ? insightBacklog
    : Math.min(getDailyInsightTranslationMaxPerDay(), insightBacklog);
  const blogProjectCap = catchup
    ? blogBacklog + projectBacklog
    : Math.max(0, maxPerDay - insightSlots);

  const { blogSlots, projectSlots } = allocateDailyTranslationSlots({
    blogBacklog,
    projectBacklog,
    maxTotal: blogProjectCap,
    splitPerType,
  });

  const insightQueue: DailyTranslationQueueItem[] = allInsightSlugs
    .slice(0, insightSlots)
    .map((slug) => ({ contentType: "insight", slug }));

  const queue = [
    ...insightQueue,
    ...buildInterleavedDailyQueue(
      allBlogSlugs.slice(0, blogSlots),
      allProjectSlugs.slice(0, projectSlots)
    ),
  ];

  const result: ProcessDailyTranslationsResult = {
    maxPerDay,
    splitPerType,
    blogBacklog,
    projectBacklog,
    insightBacklog,
    blogSlots,
    projectSlots,
    insightSlots,
    queue,
    processed: 0,
    completed: 0,
    partial: 0,
    skippedQuota: 0,
    quotaSkippedForDay: false,
    clearedQueueRows: 0,
    catchup,
    items: [],
    projectImprove: null,
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
    insightBacklog,
    blogSlots,
    projectSlots,
    insightSlots,
    queueSize: queue.length,
    queue: queue.map((entry) => `${entry.contentType}:${entry.slug}`),
  });

  if (catchup && !isCmsProjectImproveDisabled()) {
    const improveResult = await processProjectImproveBacklog({
      shouldStop,
      log,
    });
    result.projectImprove = improveResult;
    if (improveResult.quotaStopped) stopForQuota = true;
    if (improveResult.deadlineStopped) deadlineStopped = true;
  }

  const rewriteBacklogRemaining = catchup
    ? (await listProjectSlugsNeedingImprove()).length
    : 0;
  const mayRunTranslations =
    !catchup ||
    isCmsProjectImproveDisabled() ||
    isProjectTranslationParallel() ||
    rewriteBacklogRemaining === 0;

  if (catchup && !mayRunTranslations) {
    log?.("translation_phase_skip", {
      reason: "rewrite_backlog_remaining",
      rewriteBacklog: rewriteBacklogRemaining,
      blogs: blogBacklog,
      projects: projectBacklog,
      insights: insightBacklog,
    });
  }

  for (const item of mayRunTranslations ? queue : []) {
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

    if (item.contentType === "blog") {
      const dueNow = await getBlogLocalesToTranslateNow(item.slug);
      if (dueNow.length === 0) {
        log?.("item_skip_stagger", { slug: item.slug });
        continue;
      }
      retryLocales = dueNow;
    }

    while (!stopForQuota) {
      attempt += 1;
      const localesForAttempt =
        item.contentType === "blog"
          ? retryLocales ?? (await getBlogLocalesToTranslateNow(item.slug))
          : retryLocales ?? TARGET_LOCALES;

      log?.("item_attempt", {
        attempt,
        contentType: item.contentType,
        slug: item.slug,
        locales: localesForAttempt,
      });

      try {
        const batch = mergeTranslationResults(
          accumulatedResults,
          await translateQueueItem(item, localesForAttempt)
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

/** Enqueue published CMS content missing translations (legacy retry queue). */
export async function reconcileTranslationQueue(): Promise<{
  blogsEnqueued: number;
  projectsEnqueued: number;
  insightsEnqueued: number;
}> {
  let blogsEnqueued = 0;
  let projectsEnqueued = 0;
  let insightsEnqueued = 0;

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

  for (const slug of await listInsightSlugsNeedingTranslation()) {
    for (const locale of TARGET_LOCALES) {
      if (!(await isInsightLocaleOutOfSync(slug, locale))) continue;
      const db = getDb();
      const existing = await db
        .select({ id: translationQueue.id })
        .from(translationQueue)
        .where(
          and(
            eq(translationQueue.contentType, "insight"),
            eq(translationQueue.slug, slug),
            eq(translationQueue.locale, locale)
          )
        )
        .limit(1);
      if (existing.length > 0) continue;
      await enqueueTranslationRetry("insight", slug, locale, undefined, {
        immediate: true,
      });
      insightsEnqueued += 1;
    }
  }

  return { blogsEnqueued, projectsEnqueued, insightsEnqueued };
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
}): Promise<
  ProcessTranslationQueueResult & {
    reconciled?: {
      blogsEnqueued: number;
      projectsEnqueued: number;
      insightsEnqueued: number;
    };
  }
> {
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
    reconciled?: {
      blogsEnqueued: number;
      projectsEnqueued: number;
      insightsEnqueued: number;
    };
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
          : contentType === "project"
            ? await translatePublishedProject(job.slug, {
                locales: [locale],
                force: false,
              })
            : await translatePublishedInsight(job.slug, {
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
