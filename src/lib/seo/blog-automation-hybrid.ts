import "server-only";

import type { BlogAuthor } from "@/app/data/blogAuthors";
import { createSlug } from "@/app/utils/blogFileUtils";
import { generateGeminiPrompt } from "@/lib/aiService";
import { pickCategoryForSeoBrief } from "@/lib/cms/blog-author-expertise";
import { isTopicPublished } from "@/lib/cms/topicService";
import type { TopicCategory } from "@/lib/topicCategories";
import {
  ANTI_GENERIC_WRITING_RULES,
  isTooGenericTitle,
  PUNCTUATION_RULES,
  SEO_AND_READER_RULES,
} from "@/lib/seo/content-quality";
import { formatAuthorVoicePrompt } from "@/lib/seo/author-voice-context";
import { loadGscEditorialHint } from "@/lib/seo/gsc-sync";
import {
  buildKeywordCandidateBriefs,
  formatSeoPromptBlock,
  listAvailableKeywordRows,
  type SeoKeywordBrief,
} from "@/lib/seo/keyword-stats";
import { findKeywordCorpusConflict } from "@/lib/seo/blog-plan-gates";
import { isCompetitorPrimaryKeyword } from "@/lib/seo/competitor-keyword-guard";
import type { BlogSimilarityCorpusRow } from "@/lib/cms/blogService";
import { listTopicAngleSeeds, inferAngleIdFromTitle } from "@/lib/seo/blog-topic-angles";

function parseJsonField<T>(text: string, field: string): T | null {
  try {
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? text) as Record<
      string,
      unknown
    >;
    const value = parsed[field];
    return typeof value === "string" ? (value as T) : null;
  } catch {
    return null;
  }
}

/**
 * Hybrid keyword pick: code builds ranked candidates (queue + GSC + CSV),
 * Gemini chooses the best one for today's editorial gap.
 */
export type HybridKeywordPickOptions = {
  excludeKeywords?: string[];
  corpus?: BlogSimilarityCorpusRow[];
};

export async function pickSeoKeywordBriefHybrid(
  editorialContext: string,
  options?: HybridKeywordPickOptions
): Promise<SeoKeywordBrief | null> {
  const available = await listAvailableKeywordRows();
  if (available.length === 0) return null;

  const excluded = new Set(
    (options?.excludeKeywords ?? [])
      .map((keyword) => keyword.toLowerCase().trim())
      .filter(Boolean)
  );

  let candidates = buildKeywordCandidateBriefs(available, 20).filter((brief) => {
    const primary = brief.primary.toLowerCase().trim();
    if (excluded.has(primary)) return false;
    if (isCompetitorPrimaryKeyword(primary)) return false;
    if (options?.corpus?.length) {
      const conflict = findKeywordCorpusConflict(brief.primary, options.corpus);
      if (conflict) return false;
    }
    return true;
  });

  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const gscHint = loadGscEditorialHint();
  const candidateLines = candidates
    .map(
      (c, i) =>
        `${i + 1}. "${c.primary}" | intent: ${c.searchIntent} | volume bucket: ${c.volumeBucket} | related: ${c.related.slice(0, 4).join(", ")}`
    )
    .join("\n");

  const prompt = `You are Taypro's SEO strategist for utility-scale solar cleaning robots in India.

${editorialContext}
${gscHint ? `\n${gscHint}\n` : ""}

CANDIDATE KEYWORDS (code-ranked from editorial queue, GSC boost, and Keyword Planner — pick ONE):
${candidateLines}

${SEO_AND_READER_RULES}

Rules:
- Pick the keyword that best fills a content gap today (GSC opportunity + editorial queue priority + commercial fit for Taypro).
- Return the EXACT "primary" phrase from the list (no new keywords).
- Prefer queue/GSC-aligned terms when GSC data suggests rising queries.

Return ONLY valid JSON:
{ "keyword": "exact phrase from list", "reason": "one sentence" }`;

  try {
    const text = await generateGeminiPrompt(prompt, {
      purpose: "blog_keyword",
      maxOutputTokens: 1024,
    });
    const picked = parseJsonField<string>(text, "keyword")?.toLowerCase().trim();
    if (picked) {
      const match = candidates.find((c) => c.primary.toLowerCase().trim() === picked);
      if (match) return match;
      const partial = candidates.find((c) =>
        picked.includes(c.primary.toLowerCase()) || c.primary.toLowerCase().includes(picked)
      );
      if (partial) return partial;
    }
  } catch (error) {
    console.warn("Hybrid keyword Gemini pick failed, using code default:", error);
  }

  return candidates[0];
}

export type HybridTopicPick = {
  title: string;
  angleId?: string;
};

/**
 * Hybrid topic pick: code supplies unused angle seeds, Gemini picks or crafts a unique title.
 */
export async function pickTopicTitleHybrid(input: {
  seoBrief: SeoKeywordBrief;
  category: TopicCategory;
  author: BlogAuthor;
  editorialContext: string;
  rejectedTitles?: string[];
}): Promise<HybridTopicPick> {
  const rejected = input.rejectedTitles ?? [];
  const seeds = await listTopicAngleSeeds(input.seoBrief.primary, rejected, 5);
  const seoBlock = formatSeoPromptBlock(input.seoBrief);
  const authorBlock = formatAuthorVoicePrompt(input.author);
  const excludeBlock =
    rejected.length > 0
      ? `\nDo NOT reuse or closely paraphrase:\n${rejected.map((t) => `- ${t}`).join("\n")}\n`
      : "";

  const seedBlock =
    seeds.length > 0
      ? seeds.map((s) => `- ${s}`).join("\n")
      : `- (no code seeds — craft a fresh specific title for "${input.seoBrief.primary}")`;

  const prompt = `You are Taypro's content strategist. Pick today's blog title for utility-scale solar O&M in India.

${input.editorialContext}
${authorBlock}
${seoBlock}
${excludeBlock}

CODE-SUGGESTED ANGLES (unused; pick ONE exactly OR write a tighter unique variant under 72 chars):
${seedBlock}

Category: ${input.category.name}
Primary keyword: "${input.seoBrief.primary}"

${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}

Rules:
- Title must include the primary keyword or a close variant.
- 50–68 characters preferred; never exceed 72.
- Must be a post this author would credibly write.
- No generic listicles unless the angle is genuinely new vs existing Taypro blogs.

Return ONLY valid JSON:
{ "title": "specific SEO title", "chosenSeed": "optional seed you based it on" }`;

  try {
    const text = await generateGeminiPrompt(prompt, {
      purpose: "blog_topic",
      maxOutputTokens: 1024,
    });
    const title = parseJsonField<string>(text, "title")?.trim();
    const chosenSeed = parseJsonField<string>(text, "chosenSeed")?.trim();
    if (
      title &&
      !isTooGenericTitle(title, input.seoBrief.primary) &&
      !(await isTopicPublished(title, createSlug(title)))
    ) {
      return {
        title,
        angleId: inferAngleIdFromTitle(input.seoBrief.primary, title, {
          chosenSeed,
        }),
      };
    }
  } catch (error) {
    console.warn("Hybrid topic Gemini pick failed, using code seed:", error);
  }

  for (const seed of seeds) {
    if (
      !isTooGenericTitle(seed, input.seoBrief.primary) &&
      !(await isTopicPublished(seed, createSlug(seed)))
    ) {
      return {
        title: seed,
        angleId: inferAngleIdFromTitle(input.seoBrief.primary, seed),
      };
    }
  }

  throw new Error(
    `No unique topic title available for keyword "${input.seoBrief.primary}"`
  );
}

/** Full automation plan with hybrid keyword selection. */
export async function planBlogAutomationHybrid(
  editorialContext: string,
  pickAuthor: (input: {
    seoKeyword: string;
    category: TopicCategory;
    searchIntent?: string;
  }) => Promise<BlogAuthor>,
  keywordOptions?: HybridKeywordPickOptions
): Promise<{
  seoBrief: SeoKeywordBrief | null;
  category: TopicCategory;
  author: BlogAuthor;
  seoKeyword: string;
}> {
  const seoBrief = await pickSeoKeywordBriefHybrid(
    editorialContext,
    keywordOptions
  );
  const category = pickCategoryForSeoBrief(seoBrief);
  const seoKeyword = seoBrief?.primary ?? "";
  const author = await pickAuthor({
    seoKeyword,
    category,
    searchIntent: seoBrief?.searchIntent,
  });
  return { seoBrief, category, author, seoKeyword };
}
