import "server-only";

import type { BlogSimilarityCorpusRow } from "@/lib/cms/blogService";
import {
  findSimilarPlan,
  findTitleConflict,
  type BlogUniquenessContext,
} from "@/lib/seo/blog-plan-gates";
import {
  findTooSimilarBlog,
  type SimilarBlogMatch,
} from "@/lib/seo/blog-uniqueness";

export type PreFlightProbeInput = {
  title: string;
  description: string;
  h2Outline: string[];
  slug?: string;
  excludeSlugs?: string[];
};

/**
 * Simulates assertBlogDraftUnique + assertPlanUnique on title + meta + H2 template
 * before any grounded or writer calls.
 */
export async function preFlightUniquenessProbe(
  input: PreFlightProbeInput,
  ctx: BlogUniquenessContext,
  corpus: BlogSimilarityCorpusRow[]
): Promise<SimilarBlogMatch | null> {
  const slug = input.slug;
  const excludeSlugs = new Set(
    (input.excludeSlugs ?? []).map((s) => s.toLowerCase().trim())
  );

  const titleConflict = await findTitleConflict(input.title, slug);
  if (titleConflict && !excludeSlugs.has(titleConflict.slug.toLowerCase())) {
    return titleConflict;
  }

  const planConflict = findSimilarPlan(
    {
      title: input.title,
      description: input.description,
      h2Outline: input.h2Outline,
      slug,
    },
    ctx,
    slug
  );
  if (planConflict && !excludeSlugs.has(planConflict.slug.toLowerCase())) {
    return planConflict;
  }

  const draftMatch = findTooSimilarBlog(
    {
      title: input.title,
      description: input.description,
      content: "",
      slug,
    },
    corpus,
    {
      excludeSlug: slug,
      storedH2BySlug: ctx.storedH2BySlug,
    }
  );

  if (draftMatch && !excludeSlugs.has(draftMatch.slug.toLowerCase())) {
    return draftMatch;
  }

  return null;
}

export function formatPreFlightFailure(match: SimilarBlogMatch): string {
  return `Pre-flight uniqueness failed (${match.reason}, score ${match.score.toFixed(2)}): "${match.title}" (${match.slug})`;
}
