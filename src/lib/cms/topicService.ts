import "server-only";

import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { publishedTopics } from "@/lib/db/schema";

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

export async function isTopicPublished(
  topicTitle: string,
  topicSlug?: string
): Promise<boolean> {
  const topics = await readPublishedTopics();
  const titleLower = topicTitle.toLowerCase().trim();
  const slugLower = topicSlug?.toLowerCase().trim();

  return topics.some((topic) => {
    const existingTitleLower = topic.title.toLowerCase().trim();
    const existingSlugLower = topic.slug.toLowerCase().trim();

    if (existingTitleLower === titleLower) return true;
    if (slugLower && existingSlugLower === slugLower) return true;
    if (calculateSimilarity(existingTitleLower, titleLower) > 0.85) return true;
    return false;
  });
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

export async function isBlogCreatedToday(): Promise<boolean> {
  const topics = await readPublishedTopics();
  const today = new Date().toISOString().split("T")[0];
  return topics.some((topic) => topic.publishDate.split("T")[0] === today);
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
