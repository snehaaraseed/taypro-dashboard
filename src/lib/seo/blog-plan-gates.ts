import "server-only";

import { createSlug } from "@/app/utils/blogFileUtils";
import type { BlogSimilarityCorpusRow } from "@/lib/cms/blogService";
import { isTopicPublished, readPublishedTopics } from "@/lib/cms/topicService";
import {
  findTooSimilarBlog,
  loadExistingBlogCorpus,
  type SimilarBlogMatch,
} from "@/lib/seo/blog-uniqueness";
import {
  descriptionsTooSimilar,
  extractH2Headings,
  getBlogH2OverlapThreshold,
  h2OverlapScore,
  titlesTooSimilar,
} from "@/lib/seo/blog-similarity";

export type BlogUniquenessContext = {
  corpus: BlogSimilarityCorpusRow[];
  storedH2BySlug: Map<string, string[]>;
};

export type BlogContentPlanInput = {
  title: string;
  description: string;
  h2Outline: string[];
  slug?: string;
};

export async function loadBlogUniquenessContext(): Promise<BlogUniquenessContext> {
  const corpus = await loadExistingBlogCorpus();
  const storedH2BySlug = new Map<string, string[]>();
  const topics = await readPublishedTopics();
  for (const topic of topics) {
    if (topic.h2Outline?.length) {
      storedH2BySlug.set(topic.slug, topic.h2Outline);
    }
  }
  return { corpus, storedH2BySlug };
}

/** Free gate: title/slug overlap with CMS or published_topics (no Gemini). */
export async function findTitleConflict(
  title: string,
  slug?: string
): Promise<SimilarBlogMatch | null> {
  const resolvedSlug = slug ?? createSlug(title);
  if (await isTopicPublished(title, resolvedSlug)) {
    return {
      slug: resolvedSlug,
      title,
      reason: "title",
      score: 1,
    };
  }
  return null;
}

/**
 * Cheap gate after outline + meta plan (~1 Gemini call so far).
 * Catches duplicate angles before full 2,600+ word generation.
 */
export function findSimilarPlan(
  plan: BlogContentPlanInput,
  ctx: BlogUniquenessContext,
  excludeSlug?: string
): SimilarBlogMatch | null {
  const slug = excludeSlug ?? plan.slug ?? createSlug(plan.title);
  const h2Threshold = getBlogH2OverlapThreshold();
  const normalizedH2 = plan.h2Outline.map((h) => h.toLowerCase().trim());

  for (const existing of ctx.corpus) {
    if (existing.slug.toLowerCase() === slug.toLowerCase()) continue;

    if (titlesTooSimilar(plan.title, existing.title)) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "title",
        score: 1,
      };
    }

    if (
      plan.description.trim() &&
      descriptionsTooSimilar(plan.description, existing.description)
    ) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "description",
        score: 1,
      };
    }

    const existingH2 =
      ctx.storedH2BySlug.get(existing.slug) ??
      extractH2Headings(existing.content);

    if (normalizedH2.length > 0 && existingH2.length > 0) {
      const h2Score = h2OverlapScore(normalizedH2, existingH2);
      if (h2Score > h2Threshold) {
        return {
          slug: existing.slug,
          title: existing.title,
          reason: "h2",
          score: h2Score,
        };
      }
    }
  }

  return null;
}

export async function assertPlanUnique(
  plan: BlogContentPlanInput,
  ctx: BlogUniquenessContext
): Promise<void> {
  const titleConflict = await findTitleConflict(plan.title, plan.slug);
  if (titleConflict) {
    throw new Error(
      `Topic already published or too similar: "${plan.title}" (${titleConflict.slug})`
    );
  }

  const planConflict = findSimilarPlan(plan, ctx, plan.slug);
  if (planConflict) {
    throw new Error(
      `Outline too similar to existing post (${planConflict.reason}, score ${planConflict.score.toFixed(2)}): "${planConflict.title}" (${planConflict.slug})`
    );
  }
}

export async function assertBlogDraftUnique(
  draft: {
    title: string;
    description: string;
    content: string;
    slug?: string;
  },
  ctx: BlogUniquenessContext
): Promise<void> {
  if (await isTopicPublished(draft.title, draft.slug, draft.description)) {
    throw new Error(
      `Blog too similar to existing post: title or slug overlaps "${draft.title}"`
    );
  }

  const match = findTooSimilarBlog(draft, ctx.corpus, {
    excludeSlug: draft.slug,
    storedH2BySlug: ctx.storedH2BySlug,
  });

  if (match) {
    throw new Error(
      `Blog too similar to existing post (${match.reason}, score ${match.score.toFixed(2)}): "${match.title}" (${match.slug})`
    );
  }
}
