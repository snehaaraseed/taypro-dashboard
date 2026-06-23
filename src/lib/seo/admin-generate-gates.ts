import "server-only";

import { createSlug } from "@/app/utils/blogFileUtils";
import {
  preFlightUniquenessProbe,
  formatPreFlightFailure,
} from "@/lib/seo/blog-preflight-gates";
import {
  assertBlogDraftUnique,
  assertPlanUnique,
  findKeywordCorpusConflict,
  findTitleConflict,
  type BlogContentPlanInput,
  type BlogUniquenessContext,
} from "@/lib/seo/blog-plan-gates";
import {
  competitorPrimaryKeywordReason,
  isCompetitorLedTitle,
  isCompetitorPrimaryKeyword,
} from "@/lib/seo/competitor-keyword-guard";

export async function assertAdminBlogTopicGates(input: {
  title: string;
  seoKeyword: string;
  slug?: string;
  ctx: BlogUniquenessContext;
}): Promise<string> {
  const slug = input.slug ?? createSlug(input.title);

  if (
    isCompetitorPrimaryKeyword(input.seoKeyword) ||
    isCompetitorLedTitle(input.title)
  ) {
    throw new Error(competitorPrimaryKeywordReason(input.seoKeyword || input.title));
  }

  const keywordConflict = findKeywordCorpusConflict(
    input.seoKeyword,
    input.ctx.corpus
  );
  if (keywordConflict) {
    throw new Error(
      `Keyword "${input.seoKeyword}" is too close to existing post "${keywordConflict.title}" (${keywordConflict.slug}). Use a more specific title or angle.`
    );
  }

  const titleConflict = await findTitleConflict(input.title, slug);
  if (titleConflict) {
    throw new Error(
      `Topic already published or too similar: "${input.title}" (${titleConflict.slug})`
    );
  }

  return slug;
}

export async function assertAdminBlogPlanGates(
  plan: BlogContentPlanInput,
  ctx: BlogUniquenessContext
): Promise<void> {
  await assertPlanUnique(plan, ctx);

  const preflight = await preFlightUniquenessProbe(
    plan,
    ctx,
    ctx.corpus
  );
  if (preflight) {
    throw new Error(formatPreFlightFailure(preflight));
  }
}

export async function assertAdminBlogDraftGates(
  draft: {
    title: string;
    description: string;
    content: string;
    slug: string;
  },
  ctx: BlogUniquenessContext
): Promise<void> {
  await assertBlogDraftUnique(draft, ctx);
}
