import "server-only";

import { getProjectBySlug, listAllProjects } from "@/lib/cms/projectService";
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
  stripHtmlToPlainText,
  titlesTooSimilar,
} from "@/lib/seo/blog-similarity";

export type ProjectDraftInput = {
  title: string;
  description: string;
  content?: string;
  slug?: string;
};

export type SimilarProjectMatch = {
  slug: string;
  title: string;
  reason: "title" | "description" | "h2" | "keywords" | "fingerprint";
  score: number;
};

export async function loadExistingProjectCorpus() {
  return listAllProjects(true, SOURCE_LOCALE);
}

export function findTooSimilarProject(
  draft: ProjectDraftInput,
  corpus: Awaited<ReturnType<typeof loadExistingProjectCorpus>>,
  options?: {
    excludeSlug?: string;
    existingContentBySlug?: Map<string, string>;
  }
): SimilarProjectMatch | null {
  const exclude = options?.excludeSlug?.toLowerCase().trim();
  const draftH2 = draft.content ? extractH2Headings(draft.content) : [];
  const draftFingerprint = draft.content
    ? buildContentFingerprint(draft.title, draft.description, draft.content)
    : null;
  const keywordThreshold = getBlogSimilarityThreshold();
  const h2Threshold = getBlogH2OverlapThreshold();

  for (const existing of corpus) {
    if (exclude && existing.slug.toLowerCase() === exclude) continue;

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

    if (!draft.content) continue;

    const existingContent = options?.existingContentBySlug?.get(existing.slug);
    if (existingContent) {
      const existingH2 = extractH2Headings(existingContent);
      const h2Score = h2OverlapScore(draftH2, existingH2);
      if (h2Score > h2Threshold) {
        return {
          slug: existing.slug,
          title: existing.title,
          reason: "h2",
          score: h2Score,
        };
      }

      const existingFingerprint = buildContentFingerprint(
        existing.title,
        existing.description,
        existingContent
      );
      if (draftFingerprint && fingerprintsMatch(draftFingerprint, existingFingerprint)) {
        return {
          slug: existing.slug,
          title: existing.title,
          reason: "fingerprint",
          score: 1,
        };
      }

      const keywordScore = calculateBlogSimilarity(
        {
          title: draft.title,
          description: `${draft.description} ${stripHtmlToPlainText(draft.content).slice(0, 4000)}`,
        },
        {
          title: existing.title,
          description: `${existing.description} ${stripHtmlToPlainText(existingContent).slice(0, 4000)}`,
        }
      );
      if (keywordScore > keywordThreshold && keywordScore > 0.72) {
        return {
          slug: existing.slug,
          title: existing.title,
          reason: "keywords",
          score: keywordScore,
        };
      }
    }
  }

  return null;
}

export async function assertProjectDraftUnique(
  draft: ProjectDraftInput
): Promise<void> {
  const corpus = await loadExistingProjectCorpus();
  const match = findTooSimilarProject(draft, corpus, { excludeSlug: draft.slug });
  if (match) {
    throw new Error(
      `Project too similar to existing case study (${match.reason}): "${match.title}" (${match.slug})`
    );
  }
}

/** Body-level dedupe for improve/generate, loads content only for keyword-similar peers. */
export async function assertProjectContentNotTooSimilar(
  draft: Required<Pick<ProjectDraftInput, "title" | "description" | "content">> &
    Pick<ProjectDraftInput, "slug">
): Promise<void> {
  const corpus = await loadExistingProjectCorpus();
  const keywordThreshold = getBlogSimilarityThreshold();
  const candidates = corpus
    .filter((p) => p.slug !== draft.slug)
    .map((post) => ({
      post,
      score: calculateBlogSimilarity(draft, {
        title: post.title,
        description: post.description,
      }),
    }))
    .filter((item) => item.score > keywordThreshold * 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const existingContentBySlug = new Map<string, string>();
  for (const { post } of candidates) {
    const full = await getProjectBySlug(post.slug, {
      locale: SOURCE_LOCALE,
      includeDraft: true,
    });
    if (full?.content) {
      existingContentBySlug.set(post.slug, full.content);
    }
  }

  const match = findTooSimilarProject(draft, corpus, {
    excludeSlug: draft.slug,
    existingContentBySlug,
  });
  if (match) {
    throw new Error(
      `Project body too similar to existing case study (${match.reason}, score ${match.score.toFixed(2)}): "${match.title}" (${match.slug})`
    );
  }
}
