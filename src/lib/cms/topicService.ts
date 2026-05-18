import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs, publishedTopics } from "@/lib/db/schema";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export interface PublishedTopic {
  title: string;
  slug: string;
  publishDate: string;
  category?: string;
  createdAt: string;
}

function rowToTopic(row: typeof publishedTopics.$inferSelect): PublishedTopic {
  return {
    title: row.title,
    slug: row.slug,
    publishDate: row.publishDate,
    category: row.category ?? undefined,
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

function matchesExistingTopic(
  titleLower: string,
  slugLower: string | undefined,
  existingTitle: string,
  existingSlug: string
): boolean {
  const existingTitleLower = existingTitle.toLowerCase().trim();
  const existingSlugLower = existingSlug.toLowerCase().trim();

  if (existingTitleLower === titleLower) return true;
  if (slugLower && existingSlugLower === slugLower) return true;
  if (calculateSimilarity(existingTitleLower, titleLower) > 0.85) return true;
  return false;
}

/** True if title/slug overlaps automation history or any English CMS blog. */
export async function isTopicPublished(
  topicTitle: string,
  topicSlug?: string
): Promise<boolean> {
  const titleLower = topicTitle.toLowerCase().trim();
  const slugLower = topicSlug?.toLowerCase().trim();

  const topics = await readPublishedTopics();
  for (const topic of topics) {
    if (matchesExistingTopic(titleLower, slugLower, topic.title, topic.slug)) {
      return true;
    }
  }

  const db = getDb();
  const blogRows = await db
    .select({ title: blogs.title, slug: blogs.slug })
    .from(blogs)
    .where(eq(blogs.locale, SOURCE_LOCALE));

  return blogRows.some((row) =>
    matchesExistingTopic(titleLower, slugLower, row.title, row.slug)
  );
}

export async function addPublishedTopic(
  title: string,
  slug: string,
  category?: string
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(publishedTopics).values({
    title,
    slug,
    publishDate: now,
    category: category ?? null,
    createdAt: now,
  });
}

const MS_PER_DAY = 86_400_000;

/** Minimum days between automated drafts (default 3 ≈ 2 posts/week). */
export function getBlogAutomationMinDays(): number {
  const raw = process.env.BLOG_AUTOMATION_MIN_DAYS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 3;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
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
  const lastDate = new Date(lastRunAt);
  const daysSinceLastRun =
    (Date.now() - lastDate.getTime()) / MS_PER_DAY;
  const canGenerate = daysSinceLastRun >= minDaysBetween;
  const nextEligibleAt = canGenerate
    ? null
    : new Date(lastDate.getTime() + minDaysBetween * MS_PER_DAY).toISOString();

  return {
    canGenerate,
    minDaysBetween,
    daysSinceLastRun: Math.round(daysSinceLastRun * 10) / 10,
    lastRunAt,
    nextEligibleAt,
  };
}

/** @deprecated Use getBlogAutomationSchedule — kept for imports. */
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

function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return union.size > 0 ? intersection.size / union.size : 0;
}
