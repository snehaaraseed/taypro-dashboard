import "server-only";

import { listBlogsForSimilarityCheck } from "@/lib/cms/blogService";
import type { BlogSimilarityCorpusRow } from "@/lib/cms/blogService";
import { isTopicPublished } from "@/lib/cms/topicService";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import {
  buildContentFingerprint,
  calculateBlogSimilarity,
  descriptionsTooSimilar,
  extractH2Headings,
  fingerprintsMatch,
  getBlogH2OverlapThreshold,
  getBlogSimilarityThreshold,
  h2OverlapScore,
  parseH2OutlineJson,
  titleWordSimilarity,
  titlesTooSimilar,
} from "@/lib/seo/blog-similarity";

export type BlogDraftInput = {
  title: string;
  description: string;
  content: string;
  slug?: string;
};

export type SimilarBlogMatch = {
  slug: string;
  title: string;
  reason: "title" | "description" | "h2" | "keywords" | "fingerprint";
  score: number;
};

export async function loadExistingBlogCorpus(
  locale = SOURCE_LOCALE
): Promise<BlogSimilarityCorpusRow[]> {
  return listBlogsForSimilarityCheck(true, locale);
}

export function findTooSimilarBlog(
  draft: BlogDraftInput,
  corpus: BlogSimilarityCorpusRow[],
  options?: {
    excludeSlug?: string;
    storedH2BySlug?: Map<string, string[]>;
    storedFingerprintBySlug?: Map<string, string>;
  }
): SimilarBlogMatch | null {
  const excludeSlug = options?.excludeSlug?.toLowerCase().trim();
  const draftH2 = extractH2Headings(draft.content);
  const draftFingerprint = buildContentFingerprint(
    draft.title,
    draft.description,
    draft.content
  );
  const keywordThreshold = getBlogSimilarityThreshold();
  const h2Threshold = getBlogH2OverlapThreshold();

  for (const existing of corpus) {
    if (excludeSlug && existing.slug.toLowerCase() === excludeSlug) {
      continue;
    }

    if (titlesTooSimilar(draft.title, existing.title)) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "title",
        score: 1,
      };
    }

    if (descriptionsTooSimilar(draft.description, existing.description)) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "description",
        score: 1,
      };
    }

    const existingH2 =
      options?.storedH2BySlug?.get(existing.slug) ??
      extractH2Headings(existing.content);
    const h2Score = h2OverlapScore(draftH2, existingH2);
    if (h2Score > h2Threshold) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "h2",
        score: h2Score,
      };
    }

    const existingFingerprint =
      options?.storedFingerprintBySlug?.get(existing.slug) ??
      buildContentFingerprint(
        existing.title,
        existing.description,
        existing.content
      );
    if (fingerprintsMatch(draftFingerprint, existingFingerprint)) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "fingerprint",
        score: 1,
      };
    }

    const keywordScore = calculateBlogSimilarity(draft, existing);
    const titleOverlap = titleWordSimilarity(draft.title, existing.title);
    // Same niche shares keywords — reject only when titles also overlap, or score is very high.
    const keywordCollision =
      keywordScore > keywordThreshold &&
      (titleOverlap > 0.35 || keywordScore > 0.72);
    if (keywordCollision) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "keywords",
        score: keywordScore,
      };
    }
  }

  return null;
}

export async function assertBlogNotTooSimilar(
  draft: BlogDraftInput
): Promise<void> {
  if (await isTopicPublished(draft.title, draft.slug, draft.description)) {
    throw new Error(
      `Blog too similar to existing post: title or slug overlaps "${draft.title}"`
    );
  }

  const corpus = await loadExistingBlogCorpus();
  const match = findTooSimilarBlog(draft, corpus, {
    excludeSlug: draft.slug,
  });

  if (match) {
    throw new Error(
      `Blog too similar to existing post (${match.reason}, score ${match.score.toFixed(2)}): "${match.title}" (${match.slug})`
    );
  }
}

/** Parse stored topic metadata for fast-path H2 checks in topicService. */
export function h2OutlineFromStored(raw: string | null | undefined): string[] {
  return parseH2OutlineJson(raw);
}
