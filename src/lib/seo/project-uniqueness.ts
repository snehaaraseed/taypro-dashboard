import "server-only";

import { listAllProjects } from "@/lib/cms/projectService";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import {
  descriptionsTooSimilar,
  titlesTooSimilar,
} from "@/lib/seo/blog-similarity";

export type ProjectDraftInput = {
  title: string;
  description: string;
  slug?: string;
};

export type SimilarProjectMatch = {
  slug: string;
  title: string;
  reason: "title" | "description";
};

export async function loadExistingProjectCorpus() {
  return listAllProjects(true, SOURCE_LOCALE);
}

export function findTooSimilarProject(
  draft: ProjectDraftInput,
  corpus: Awaited<ReturnType<typeof loadExistingProjectCorpus>>,
  excludeSlug?: string
): SimilarProjectMatch | null {
  const exclude = excludeSlug?.toLowerCase().trim();

  for (const existing of corpus) {
    if (exclude && existing.slug.toLowerCase() === exclude) continue;

    if (titlesTooSimilar(draft.title, existing.title)) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "title",
      };
    }

    if (descriptionsTooSimilar(draft.description, existing.description)) {
      return {
        slug: existing.slug,
        title: existing.title,
        reason: "description",
      };
    }
  }

  return null;
}

export async function assertProjectDraftUnique(
  draft: ProjectDraftInput
): Promise<void> {
  const corpus = await loadExistingProjectCorpus();
  const match = findTooSimilarProject(draft, corpus, draft.slug);
  if (match) {
    throw new Error(
      `Project too similar to existing case study (${match.reason}): "${match.title}" (${match.slug})`
    );
  }
}
