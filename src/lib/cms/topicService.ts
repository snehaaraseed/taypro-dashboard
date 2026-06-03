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
  createdAt: string;
}

export type PublishedTopicMeta = {
  h2Outline?: string[];
  contentFingerprint?: string;
};

function rowToTopic(row: typeof publishedTopics.$inferSelect): PublishedTopic {
  return {
    title: row.title,
    slug: row.slug,
    publishDate: row.publishDate,
    category: row.category ?? undefined,
    h2Outline: parseH2OutlineJson(row.h2Outline),
    contentFingerprint: row.contentFingerprint ?? undefined,
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
    createdAt: now,
  });
}

const MS_PER_DAY = 86_400_000;

/** Minimum days between automated drafts (default 1 = at most one draft per day). */
export function getBlogAutomationMinDays(): number {
  const raw = process.env.BLOG_AUTOMATION_MIN_DAYS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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
