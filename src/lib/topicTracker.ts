import { promises as fs } from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

function topicsFilePath(): string {
  return path.join(getDeploymentRoot(), "data", "published-topics.json");
}

export interface PublishedTopic {
  title: string;
  slug: string;
  publishDate: string;
  category?: string;
  createdAt: string;
}

interface PublishedTopicsData {
  topics: PublishedTopic[];
}

/**
 * Read published topics from JSON file
 */
export async function readPublishedTopics(): Promise<PublishedTopic[]> {
  try {
    const fileContent = await fs.readFile(topicsFilePath(), "utf-8");
    const data: PublishedTopicsData = JSON.parse(fileContent);
    return data.topics || [];
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    console.error("Error reading published topics:", error);
    return [];
  }
}

/**
 * Check if a topic (by title or slug) has already been published
 */
export async function isTopicPublished(topicTitle: string, topicSlug?: string): Promise<boolean> {
  const topics = await readPublishedTopics();
  const titleLower = topicTitle.toLowerCase().trim();
  const slugLower = topicSlug?.toLowerCase().trim();

  return topics.some((topic) => {
    const existingTitleLower = topic.title.toLowerCase().trim();
    const existingSlugLower = topic.slug.toLowerCase().trim();

    // Check by title (fuzzy match - check if titles are very similar)
    if (existingTitleLower === titleLower) {
      return true;
    }

    // Check by slug if provided
    if (slugLower && existingSlugLower === slugLower) {
      return true;
    }

    // Check for very similar titles (to catch minor variations)
    const titleSimilarity = calculateSimilarity(existingTitleLower, titleLower);
    if (titleSimilarity > 0.85) {
      return true;
    }

    return false;
  });
}

/**
 * Add a new published topic to the file
 */
export async function addPublishedTopic(
  title: string,
  slug: string,
  category?: string
): Promise<void> {
  const topics = await readPublishedTopics();
  const now = new Date().toISOString();

  const newTopic: PublishedTopic = {
    title,
    slug,
    publishDate: now,
    category,
    createdAt: now,
  };

  topics.push(newTopic);

  // Ensure data directory exists
  const dataDir = path.dirname(topicsFilePath());
  await fs.mkdir(dataDir, { recursive: true });

  // Write updated topics to file
  const data: PublishedTopicsData = { topics };
  await fs.writeFile(topicsFilePath(), JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Check if a blog has already been created today
 */
export async function isBlogCreatedToday(): Promise<boolean> {
  const topics = await readPublishedTopics();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  return topics.some((topic) => {
    const topicDate = topic.publishDate.split("T")[0];
    return topicDate === today;
  });
}

/**
 * Get topics from the last N days
 */
export async function getTopicHistory(days: number): Promise<PublishedTopic[]> {
  const topics = await readPublishedTopics();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return topics.filter((topic) => {
    const topicDate = new Date(topic.publishDate);
    return topicDate >= cutoffDate;
  });
}

/**
 * Get all topics
 */
export async function getAllTopics(): Promise<PublishedTopic[]> {
  return readPublishedTopics();
}

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}
