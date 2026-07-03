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
import {
  calendarDaysBetweenYmd,
  computeNextEligibleAt,
  getBlogAutomationTimezone,
  getBlogBlackoutReason,
  isBlogAutomationBlackoutDay,
  loadCadenceState,
  nextBlogAutomationDayYmd,
  rotateCadenceAfterSuccessfulWrite,
  writerWindowStartIso,
  ymdInAutomationTz,
} from "@/lib/cms/blog-automation-calendar";
import {
  getBlogAutomationMaxGapDays,
  getBlogAutomationMinGapDays,
} from "@/lib/cms/blog-automation-calendar-shared";

export {
  getBlogAutomationTimezone,
  isBlogAutomationBlackoutDay,
  rotateCadenceAfterSuccessfulWrite,
};

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

/** Minimum calendar days between automated drafts (lower bound for random gap). */
export function getBlogAutomationMinDays(): number {
  return getBlogAutomationMinGapDays();
}

export function getBlogAutomationMaxDays(): number {
  return getBlogAutomationMaxGapDays();
}

export type BlogAutomationSchedule = {
  canGenerate: boolean;
  minDaysBetween: number;
  maxDaysBetween: number;
  requiredGapDays: number;
  daysSinceLastRun: number | null;
  daysUntilEligible: number | null;
  /** ISO timestamp of the last automation write (published_topics.created_at). */
  lastRunAt: string | null;
  nextEligibleAt: string | null;
  blackoutToday: boolean;
  blackoutReason: string | null;
};

/** When automation last generated a topic row, not publish/schedule dates. */
async function getLastAutomationWriteAt(): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ createdAt: publishedTopics.createdAt })
    .from(publishedTopics)
    .orderBy(desc(publishedTopics.createdAt))
    .limit(1);
  return row?.createdAt ?? null;
}

export async function getBlogAutomationSchedule(): Promise<BlogAutomationSchedule> {
  const minDaysBetween = getBlogAutomationMinGapDays();
  const maxDaysBetween = getBlogAutomationMaxGapDays();
  const requiredGapDays = loadCadenceState().requiredGapDays;
  const blackoutReason = await getBlogBlackoutReason(new Date());
  const blackoutToday = blackoutReason !== null;
  const lastRunAt = await getLastAutomationWriteAt();
  const todayYmd = ymdInAutomationTz(new Date());

  if (blackoutToday) {
    const nextYmd = nextBlogAutomationDayYmd(todayYmd);
    return {
      canGenerate: false,
      minDaysBetween,
      maxDaysBetween,
      requiredGapDays,
      daysSinceLastRun: lastRunAt
        ? calendarDaysBetweenYmd(ymdInAutomationTz(new Date(lastRunAt)), todayYmd)
        : null,
      daysUntilEligible: null,
      lastRunAt,
      nextEligibleAt: writerWindowStartIso(nextYmd),
      blackoutToday: true,
      blackoutReason,
    };
  }

  if (!lastRunAt) {
    return {
      canGenerate: true,
      minDaysBetween,
      maxDaysBetween,
      requiredGapDays,
      daysSinceLastRun: null,
      daysUntilEligible: 0,
      lastRunAt: null,
      nextEligibleAt: null,
      blackoutToday: false,
      blackoutReason: null,
    };
  }

  const lastRunYmd = ymdInAutomationTz(new Date(lastRunAt));
  const calendarDaysSinceLastRun = calendarDaysBetweenYmd(lastRunYmd, todayYmd);
  const canGenerate = calendarDaysSinceLastRun >= requiredGapDays;
  const daysUntilEligible = canGenerate
    ? 0
    : requiredGapDays - calendarDaysSinceLastRun;
  const nextEligibleAt = canGenerate
    ? null
    : computeNextEligibleAt(lastRunYmd, requiredGapDays);

  return {
    canGenerate,
    minDaysBetween,
    maxDaysBetween,
    requiredGapDays,
    daysSinceLastRun: calendarDaysSinceLastRun,
    daysUntilEligible,
    lastRunAt,
    nextEligibleAt,
    blackoutToday: false,
    blackoutReason: null,
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
