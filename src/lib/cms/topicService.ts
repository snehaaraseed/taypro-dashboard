import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs, publishedTopics } from "@/lib/db/schema";
import {
  descriptionsTooSimilar,
  parseH2OutlineJson,
  titlesTooSimilar,
} from "@/lib/seo/blog-similarity";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export interface PublishedTopic {
  title: string;
  slug: string;
  publishDate: string;
  category?: string;
  h2Outline?: string[];
  contentFingerprint?: string;
  wordCountTier?: string;
  createdAt: string;
}

export type PublishedTopicMeta = {
  h2Outline?: string[];
  contentFingerprint?: string;
  wordCountTier?: string;
};

function rowToTopic(row: typeof publishedTopics.$inferSelect): PublishedTopic {
  return {
    title: row.title,
    slug: row.slug,
    publishDate: row.publishDate,
    category: row.category ?? undefined,
    h2Outline: parseH2OutlineJson(row.h2Outline),
    contentFingerprint: row.contentFingerprint ?? undefined,
    wordCountTier: row.wordCountTier ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function readPublishedTopics(): Promise<PublishedTopic[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(publishedTopics)
    .orderBy(desc(publishedTopics.publishDate));
  return rows.map(rowToTopic);
}

/** Single automation topic row by published blog slug (for metadata keywords). */
export async function getPublishedTopicBySlug(
  slug: string
): Promise<PublishedTopic | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(publishedTopics)
    .where(eq(publishedTopics.slug, slug))
    .limit(1);
  return rows[0] ? rowToTopic(rows[0]) : null;
}

function matchesExistingTopic(
  titleLower: string,
  slugLower: string | undefined,
  descriptionLower: string | undefined,
  existingTitle: string,
  existingSlug: string,
  existingDescription?: string
): boolean {
  const existingTitleLower = existingTitle.toLowerCase().trim();
  const existingSlugLower = existingSlug.toLowerCase().trim();

  if (existingTitleLower === titleLower) return true;
  if (slugLower && existingSlugLower === slugLower) return true;
  if (titlesTooSimilar(existingTitle, titleLower)) return true;
  if (
    descriptionLower &&
    existingDescription &&
    descriptionsTooSimilar(existingDescription, descriptionLower)
  ) {
    return true;
  }
  return false;
}

/** True if title/slug/description overlaps automation history or any English CMS blog. */
export async function isTopicPublished(
  topicTitle: string,
  topicSlug?: string,
  topicDescription?: string
): Promise<boolean> {
  const titleLower = topicTitle.toLowerCase().trim();
  const slugLower = topicSlug?.toLowerCase().trim();
  const descriptionLower = topicDescription?.toLowerCase().trim();

  const topics = await readPublishedTopics();
  for (const topic of topics) {
    if (
      matchesExistingTopic(
        titleLower,
        slugLower,
        descriptionLower,
        topic.title,
        topic.slug
      )
    ) {
      return true;
    }
  }

  const db = getDb();
  const blogRows = await db
    .select({
      title: blogs.title,
      slug: blogs.slug,
      description: blogs.description,
    })
    .from(blogs)
    .where(eq(blogs.locale, SOURCE_LOCALE));

  return blogRows.some((row) =>
    matchesExistingTopic(
      titleLower,
      slugLower,
      descriptionLower,
      row.title,
      row.slug,
      row.description
    )
  );
}

export async function addPublishedTopic(
  title: string,
  slug: string,
  category?: string,
  meta?: PublishedTopicMeta
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const h2Outline =
    meta?.h2Outline && meta.h2Outline.length > 0
      ? JSON.stringify(meta.h2Outline)
      : null;

  await db.insert(publishedTopics).values({
    title,
    slug,
    publishDate: now,
    category: category ?? null,
    h2Outline,
    contentFingerprint: meta?.contentFingerprint ?? null,
    wordCountTier: meta?.wordCountTier ?? null,
    createdAt: now,
  });
}

const MS_PER_DAY = 86_400_000;
const BLOG_AUTOMATION_TZ =
  process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
/** Cron writer window start (local TZ); used for nextEligibleAt only. */
const BLOG_CRON_WINDOW_START_HOUR = 9;

export function getBlogAutomationTimezone(): string {
  return BLOG_AUTOMATION_TZ;
}

/** Minimum calendar days between automated drafts (default 1 = at most one per IST day). */
export function getBlogAutomationMinDays(): number {
  const raw = process.env.BLOG_AUTOMATION_MIN_DAYS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function ymdInAutomationTz(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return date.toLocaleDateString("en-CA", { timeZone: BLOG_AUTOMATION_TZ });
}

function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function calendarDaysBetweenYmd(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/** Next cron-window start (09:00 automation TZ) on the given YYYY-MM-DD. */
function cronWindowStartIso(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  let t = Date.UTC(year, month - 1, day, BLOG_CRON_WINDOW_START_HOUR, 0, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BLOG_AUTOMATION_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let i = 0; i < 24; i++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(t)).map((p) => [p.type, p.value])
    ) as Record<string, string>;
    const gotYmd = `${parts.year}-${parts.month}-${parts.day}`;
    const gotH = Number(parts.hour);
    const gotM = Number(parts.minute);
    if (
      gotYmd === ymd &&
      gotH === BLOG_CRON_WINDOW_START_HOUR &&
      gotM === 0
    ) {
      return new Date(t).toISOString();
    }
    t +=
      Date.UTC(year, month - 1, day, BLOG_CRON_WINDOW_START_HOUR, 0, 0) -
      Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        gotH,
        gotM,
        0
      );
  }

  return new Date(t).toISOString();
}

export type BlogAutomationSchedule = {
  canGenerate: boolean;
  minDaysBetween: number;
  daysSinceLastRun: number | null;
  lastRunAt: string | null;
  nextEligibleAt: string | null;
};

export async function getBlogAutomationSchedule(): Promise<BlogAutomationSchedule> {
  const minDaysBetween = getBlogAutomationMinDays();
  const topics = await readPublishedTopics();

  if (topics.length === 0) {
    return {
      canGenerate: true,
      minDaysBetween,
      daysSinceLastRun: null,
      lastRunAt: null,
      nextEligibleAt: null,
    };
  }

  const lastRunAt = topics[0].publishDate;
  const todayYmd = ymdInAutomationTz(new Date());
  const lastRunYmd = ymdInAutomationTz(lastRunAt);
  const calendarDaysSinceLastRun = calendarDaysBetweenYmd(lastRunYmd, todayYmd);
  const canGenerate = calendarDaysSinceLastRun >= minDaysBetween;
  const nextEligibleAt = canGenerate
    ? null
    : cronWindowStartIso(
        addCalendarDaysYmd(lastRunYmd, minDaysBetween)
      );

  return {
    canGenerate,
    minDaysBetween,
    daysSinceLastRun: calendarDaysSinceLastRun,
    lastRunAt,
    nextEligibleAt,
  };
}

/** @deprecated Use getBlogAutomationSchedule, kept for imports. */
export async function isBlogCreatedToday(): Promise<boolean> {
  const schedule = await getBlogAutomationSchedule();
  return !schedule.canGenerate;
}

export async function getTopicHistory(days: number): Promise<PublishedTopic[]> {
  const topics = await readPublishedTopics();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return topics.filter((topic) => new Date(topic.publishDate) >= cutoffDate);
}

export async function getAllTopics(): Promise<PublishedTopic[]> {
  return readPublishedTopics();
}
