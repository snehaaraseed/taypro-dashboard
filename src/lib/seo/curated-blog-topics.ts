import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { createSlug } from "@/app/utils/blogFileUtils";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import {
  appendDiscoveredBriefs,
  loadDiscoveredBriefs,
  loadDiscoveredBriefsState,
  listFilledBriefIds,
  listRejectedBriefIds,
  type DiscoveredBrief,
} from "@/lib/seo/discovered-brief-queue";
import { findTitleConflict } from "@/lib/seo/blog-plan-gates";
import { titlesTooSimilar } from "@/lib/seo/blog-similarity";
import { loadExistingBlogCorpus } from "@/lib/seo/blog-uniqueness";
import { readPublishedTopics } from "@/lib/cms/topicService";

export type CuratedBlogTopic = {
  id: string;
  title: string;
  primaryKeyword: string;
  category: string;
  domainId: string;
  intentFamily: SearchIntentFamily;
  angleId: string;
  serpGap: string;
  query: string;
  priority: number;
  contentFormat?: "standard" | "narrative";
};

export type CuratedBlogTopicsFile = {
  version?: number;
  description?: string;
  generatedAt?: string;
  topicCount?: number;
  topics: CuratedBlogTopic[];
};

export type CuratedTopicStatus =
  | "pending"
  | "enqueued"
  | "filled"
  | "rejected"
  | "published";

export type CuratedTopicRow = CuratedBlogTopic & {
  status: CuratedTopicStatus;
  briefId?: string;
  slug?: string;
  rejectReason?: string;
};

function resolveCuratedPath(): string {
  const env = process.env.CURATED_BLOG_TOPICS_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "curated-blog-topics.json");
}

export function isCuratedBriefId(briefId: string): boolean {
  return briefId.includes("curated");
}

export function loadCuratedBlogTopics(): CuratedBlogTopic[] {
  const filePath = resolveCuratedPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as CuratedBlogTopicsFile;
    return Array.isArray(raw.topics) ? raw.topics : [];
  } catch {
    return [];
  }
}

function curatedToBrief(topic: CuratedBlogTopic): DiscoveredBrief {
  const slug = createSlug(topic.title);
  return {
    id: topic.id.startsWith("brief-") ? topic.id : `brief-${topic.id}`.slice(0, 110),
    title: topic.title.trim(),
    primaryKeyword: topic.primaryKeyword.trim().toLowerCase(),
    intentFamily: topic.intentFamily,
    angleId: topic.angleId,
    domainId: topic.domainId,
    query: topic.query.trim(),
    serpGap: topic.serpGap,
    peopleAlsoAsk: [],
    freshnessNote: `Curated editorial topic (${topic.category}).`,
    sources: [],
    score: topic.priority,
    discoveredAt: new Date().toISOString(),
  };
}

export async function resolveCuratedTopicStatuses(): Promise<CuratedTopicRow[]> {
  const topics = loadCuratedBlogTopics();
  const briefs = loadDiscoveredBriefs();
  const briefByTitle = new Map(
    briefs.map((b) => [b.title.toLowerCase().trim(), b])
  );
  const briefById = new Map(briefs.map((b) => [b.id, b]));
  const filled = loadDiscoveredBriefsState().filled;
  const rejected = loadDiscoveredBriefsState().rejected;
  const filledById = new Map(filled.map((f) => [f.briefId, f]));
  const rejectedById = new Map(rejected.map((r) => [r.briefId, r]));
  const published = await readPublishedTopics();
  const publishedTitles = new Set(
    published.map((p) => p.title.toLowerCase().trim())
  );
  const publishedSlugs = new Set(published.map((p) => p.slug.toLowerCase()));

  return topics.map((topic) => {
    const brief =
      briefById.get(`brief-${topic.id}`) ??
      briefById.get(topic.id) ??
      briefByTitle.get(topic.title.toLowerCase().trim());
    const briefId = brief?.id;

    if (publishedTitles.has(topic.title.toLowerCase().trim())) {
      const slug = createSlug(topic.title);
      return {
        ...topic,
        status: "published" as const,
        briefId,
        slug: publishedSlugs.has(slug) ? slug : undefined,
      };
    }

    if (briefId && filledById.has(briefId)) {
      const row = filledById.get(briefId)!;
      return {
        ...topic,
        status: "filled" as const,
        briefId,
        slug: row.slug,
      };
    }

    if (briefId && rejectedById.has(briefId)) {
      return {
        ...topic,
        status: "rejected" as const,
        briefId,
        rejectReason: rejectedById.get(briefId)?.reason,
      };
    }

    if (brief) {
      return { ...topic, status: "enqueued" as const, briefId: brief.id };
    }

    return { ...topic, status: "pending" as const };
  });
}

export type EnqueueCuratedResult = {
  scanned: number;
  added: number;
  skipped: number;
  skipReasons: Record<string, number>;
};

/** Move pending curated topics into discovered-briefs.json for the daily writer. */
export async function enqueueCuratedTopicsToBriefQueue(options?: {
  limit?: number;
  topicIds?: string[];
}): Promise<EnqueueCuratedResult> {
  const limit = options?.limit ?? 50;
  const idFilter = options?.topicIds?.length
    ? new Set(options.topicIds)
    : null;

  const statuses = await resolveCuratedTopicStatuses();
  const corpus = await loadExistingBlogCorpus();
  const existingBriefs = loadDiscoveredBriefs();
  const existingTitles = new Set(
    existingBriefs.map((b) => b.title.toLowerCase().trim())
  );
  const existingKeywords = new Set(
    existingBriefs.map((b) => b.primaryKeyword.toLowerCase().trim())
  );

  const toAdd: DiscoveredBrief[] = [];
  const skipReasons = new Map<string, number>();
  let scanned = 0;

  for (const row of statuses) {
    if (toAdd.length >= limit) break;
    if (idFilter && !idFilter.has(row.id)) continue;
    if (row.status !== "pending") continue;
    scanned += 1;

    const title = row.title.trim();
    const titleKey = title.toLowerCase();
    if (existingTitles.has(titleKey)) {
      skipReasons.set("duplicate brief title", (skipReasons.get("duplicate brief title") ?? 0) + 1);
      continue;
    }
    const kw = row.primaryKeyword.toLowerCase();
    if (existingKeywords.has(kw)) {
      skipReasons.set("duplicate brief keyword", (skipReasons.get("duplicate brief keyword") ?? 0) + 1);
      continue;
    }

    const slug = createSlug(title);
    const titleConflict = await findTitleConflict(title, slug);
    if (titleConflict) {
      skipReasons.set("already published", (skipReasons.get("already published") ?? 0) + 1);
      continue;
    }

    let tooSimilar = false;
    for (const existing of corpus) {
      if (titlesTooSimilar(existing.title, title)) {
        tooSimilar = true;
        break;
      }
    }
    if (tooSimilar) {
      skipReasons.set("title similar to published", (skipReasons.get("title similar to published") ?? 0) + 1);
      continue;
    }

    if (title.length < 25) {
      skipReasons.set("title too short", (skipReasons.get("title too short") ?? 0) + 1);
      continue;
    }

    const brief = curatedToBrief(row);
    toAdd.push(brief);
    existingTitles.add(titleKey);
    existingKeywords.add(kw);
  }

  const added = appendDiscoveredBriefs(toAdd);
  const skipped = scanned - added;

  return {
    scanned,
    added,
    skipped: Math.max(0, skipped),
    skipReasons: Object.fromEntries(skipReasons),
  };
}

export function countCuratedTopicStats(rows: CuratedTopicRow[]): Record<
  CuratedTopicStatus,
  number
> {
  const counts: Record<CuratedTopicStatus, number> = {
    pending: 0,
    enqueued: 0,
    filled: 0,
    rejected: 0,
    published: 0,
  };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}
