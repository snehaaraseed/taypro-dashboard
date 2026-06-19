import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomCategory, type TopicCategory } from "./topicCategories";
import {
  buildBlogKnowledgeContext,
  findRelevantBlogExcerpts,
} from "@/lib/seo/blog-knowledge-context";
import { buildProjectKnowledgeContext } from "@/lib/seo/project-knowledge-context";
import { createSlug } from "@/app/utils/blogFileUtils";
import {
  AI_OVERVIEW_SNIPPET_RULES,
  ANTI_GENERIC_WRITING_RULES,
  PUNCTUATION_RULES,
  SEO_AND_READER_RULES,
  isTooGenericDescription,
  isTooGenericTitle,
  sanitizeEmDash,
  getBlogPipelineMaxInPlaceExpansions,
} from "@/lib/seo/content-quality";
import type { CorpusIndexEntry } from "@/lib/seo/corpus-index";
import { formatAuthorVoicePrompt } from "@/lib/seo/author-voice-context";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import {
  canonicalizeCategoryDetailTags,
  projectHasCategoryTag,
} from "@/lib/cms/project-categories";
import type { BlogAuthor } from "@/app/data/blogAuthors";
import {
  buildFallbackTopicTitle,
  formatSeoPromptBlock,
  pickSeoKeywordBrief,
  type SeoKeywordBrief,
} from "@/lib/seo/keyword-stats";
import { isTopicPublished } from "./topicTracker";
import {
  ensurePrimaryKeywordInFirstFaq,
  normalizeBlogFaqsInput,
  type BlogFaqItem,
} from "@/lib/cms/blog-faqs";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import { freeGeminiTextModelCandidates } from "@/lib/gemini/free-tier-models";
import {
  geminiQuotaErrorMessage,
  isGeminiQuotaError,
  listGeminiApiKeys,
} from "@/lib/gemini/api-keys";
import {
  alignFirstFaqWithQuickAnswer,
  assertGeneratedBlogValid,
  validateGeneratedBlog,
} from "@/lib/seo/blog-content-validator";
import {
  resolveBlogWordCountPolicy,
  resolveBlogStructurePolicy,
  formatLongFormWordCountRules,
  type BlogWordCountPolicy,
} from "@/lib/seo/blog-word-count-tier";
import {
  extractQualifyingInternalLinkPaths,
  formatInternalLinkRulesForPrompt,
  isInternalLinkOnlyFailure,
  MIN_BLOG_POST_LINKS,
  MIN_INTERNAL_LINKS,
  type BlogLinkCandidate,
} from "@/lib/seo/blog-pillar-links";
import { isRobotPromotionRelevant } from "@/lib/seo/blog-robot-relevance";
import {
  buildBlogIntentContract,
  formatBlogIntentPromptBlock,
} from "@/lib/seo/blog-intent-contract";
import {
  isBodyHygieneOnlyFailure,
  sanitizeGeneratedBlogBodyHtml,
  stripPriorH2Sections,
} from "@/lib/seo/blog-body-hygiene";
import { extractH2Headings, stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { parseBlogContentPlanJson } from "@/lib/seo/blog-content-plan";
import type { BlogContentPlan } from "@/lib/seo/blog-content-plan";
import { resolveStoredIntentFamily } from "@/lib/seo/keyword-intent-registry";
import { formatIntentFamilyIdsForPrompt } from "@/lib/seo/keyword-intent-taxonomy";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
export type { BlogContentPlan } from "@/lib/seo/blog-content-plan";
import { formatFactBriefForPrompt } from "@/lib/gemini/grounded-fact-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import { formatSerpBriefForPrompt } from "@/lib/gemini/grounded-serp-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import {
  assembleSectionHtml,
  buildFaqWriterPrompt,
  buildSectionWriterPrompt,
  chunkH2Outline,
  missingH2OutlineSections,
  type SectionWriterContext,
} from "@/lib/seo/blog-section-writer";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";

function getGenAI(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(listGeminiApiKeys()[0]);
}

function isQuotaError(error: unknown): boolean {
  return isGeminiQuotaError(error);
}

function quotaErrorMessage(error: unknown): string {
  return geminiQuotaErrorMessage(error);
}

type GenerateTextOptions = {
  /** On retry, rotate to another free-tier model ID (e.g. flash-lite-preview). */
  preferQualityModel?: boolean;
  /** Override output token cap (blog generation uses BLOG_MAX_OUTPUT_TOKENS). */
  maxOutputTokens?: number;
  /** Optional call label for logs (blog_section, blog_topic, etc.). */
  purpose?: string;
};

/** Long-form blog JSON needs a high output cap; default Gemini limits truncate ~800-word drafts. */
const BLOG_MAX_OUTPUT_TOKENS = (() => {
  const raw = process.env.BLOG_MAX_OUTPUT_TOKENS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 16384;
  return Number.isFinite(n) && n > 0 ? n : 16384;
})();

function blogTextOptions(
  options?: GenerateTextOptions
): GenerateTextOptions {
  return {
    ...options,
    maxOutputTokens: options?.maxOutputTokens ?? BLOG_MAX_OUTPUT_TOKENS,
  };
}

/** Per-section output cap — keeps each call well under TPM while hitting word targets. */
const BLOG_SECTION_MAX_OUTPUT_TOKENS = (() => {
  const raw = process.env.BLOG_SECTION_MAX_OUTPUT_TOKENS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 8192;
  return Number.isFinite(n) && n > 0 ? n : 8192;
})();

function blogSectionTextOptions(
  options?: GenerateTextOptions
): GenerateTextOptions {
  return {
    ...options,
    maxOutputTokens: options?.maxOutputTokens ?? BLOG_SECTION_MAX_OUTPUT_TOKENS,
    purpose: options?.purpose ?? "blog_section",
  };
}

function blogModelCandidates(options?: GenerateTextOptions): string[] {
  return freeGeminiTextModelCandidates({
    preferRetryVariant: options?.preferQualityModel,
  });
}

async function generateText(
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> {
  const apiKeys = listGeminiApiKeys();
  let lastError: unknown;
  let quotaExhaustedKeys = 0;

  for (const apiKey of apiKeys) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyHitQuota = false;

    for (const modelName of blogModelCandidates(options)) {
      try {
        const generationConfig =
          options?.maxOutputTokens && options.maxOutputTokens > 0
            ? { maxOutputTokens: options.maxOutputTokens }
            : undefined;
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(generationConfig ? { generationConfig } : {}),
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        await pauseAfterGeminiCall();
        if (apiKey !== apiKeys[0]) {
          console.warn("Gemini call succeeded on fallback API key (GEMINI_API_KEY_2).");
        }
        return text;
      } catch (error) {
        lastError = error;
        if (isQuotaError(error)) {
          keyHitQuota = true;
          console.warn(
            `Gemini quota exceeded on API key ending ...${apiKey.slice(-4)}, trying fallback key if configured.`
          );
          break;
        }
        console.warn(`Gemini model ${modelName} failed, trying next...`, error);
      }
    }

    if (keyHitQuota) {
      quotaExhaustedKeys += 1;
      continue;
    }
    break;
  }

  if (quotaExhaustedKeys >= apiKeys.length) {
    throw new Error(quotaErrorMessage(lastError));
  }

  throw new Error(
    lastError instanceof Error
      ? lastError.message
      : "All configured Gemini models failed"
  );
}

/**
 * Generate a unique blog topic using Gemini AI (one API call per attempt).
 */
export type GeneratedTopic = {
  title: string;
  category: string;
  seoKeyword: string;
  seoBrief: SeoKeywordBrief | null;
  /** Inferred from keyword angle seeds when coverage ledger is off. */
  angleId?: string;
  /** AI-declared cluster intent (hybrid title pick or outline plan). */
  intentFamily?: SearchIntentFamily;
};

export type GenerateUniqueTopicPlan = {
  /** When set (automation), reuse the planned keyword instead of picking again. */
  seoBrief?: SeoKeywordBrief | null;
  /** When set (automation), reuse the category matched to the keyword. */
  category?: TopicCategory;
  /** Titles rejected by similarity or publish checks on prior attempts. */
  excludeTitles?: string[];
};

export async function generateUniqueTopic(
  maxRetries: number = 3,
  editorialContext?: string,
  author?: BlogAuthor,
  plan?: GenerateUniqueTopicPlan
): Promise<GeneratedTopic> {
  const seoBrief =
    plan?.seoBrief !== undefined ? plan.seoBrief : await pickSeoKeywordBrief();
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());
  const authorBlock = author ? `\n${formatAuthorVoicePrompt(author)}\n` : "";
  const fixedCategory = plan?.category;
  const excludeTitles = new Set(
    (plan?.excludeTitles ?? []).map((t) => t.toLowerCase().trim()).filter(Boolean)
  );

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const category = fixedCategory ?? getRandomCategory();
    const knowledgeContext = await buildBlogKnowledgeContext({
      seoKeyword: seoBrief?.primary,
      extraTerms: category.name,
    });
    const seoBlock = seoBrief
      ? `\n${formatSeoPromptBlock(seoBrief)}\n- At least 3 of the 5 titles MUST include the exact phrase "${seoBrief.primary}" or a word-order variant.\n`
      : "";

    const excludeBlock =
      excludeTitles.size > 0
        ? `\nDo NOT reuse or closely paraphrase these already-published or rejected titles:\n${[...excludeTitles].map((t) => `- ${t}`).join("\n")}\n`
        : "";

    const prompt = `You are a content strategist for a solar panel cleaning robot company called Taypro.

${editorial}
${authorBlock}
${excludeBlock}
Generate 5 unique, SEO-friendly blog topic titles about: ${category.name}

Category Description: ${category.description}
Category Keywords: ${category.keywords.join(", ")}
${seoBlock}
Requirements:
- Each topic should be unique and not repeated
- Topics should be relevant to solar panel cleaning robots, solar power plant operations & maintenance (O&M), or related solar energy topics
- Topics should be SEO-optimized and engaging
- Each topic should be 8-15 words long
- Topics should sound natural and human-written
- Focus on practical, valuable content for solar plant operators and managers
- Prefer titles that match AI Overview / People Also Ask patterns: X vs Y, how often, how much, is it worth it, best method for 10MW+ / tracker plants in India
${author ? "- Each title must be a post this BYLINE AUTHOR would credibly write given their role and bio" : ""}

${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}

${knowledgeContext}

IMPORTANT: 
- Only reference Taypro products if the topic naturally calls for it
- Use ONLY verified information from the knowledge pack above
- Do NOT invent product features or specifications

Return ONLY a JSON array of 5 topic titles, like this:
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

    try {
      const text = await generateText(prompt, { purpose: "blog_topic" });

      let topics: string[] = [];
      try {
        topics = JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          topics = JSON.parse(jsonMatch[0]);
        } else {
          topics = text
            .split("\n")
            .map((line) =>
              line.replace(/^[-*•]\s*/, "").replace(/^"\s*|\s*"$/g, "").trim()
            )
            .filter((line) => line.length > 0)
            .slice(0, 5);
        }
      }

      for (const topicTitle of topics) {
        if (!topicTitle || typeof topicTitle !== "string") continue;
        const normalizedTitle = topicTitle.trim();
        if (excludeTitles.has(normalizedTitle.toLowerCase())) continue;

        if (isTooGenericTitle(topicTitle, seoBrief?.primary)) {
          continue;
        }

        const isPublished = await isTopicPublished(
          topicTitle,
          createSlug(topicTitle)
        );
        if (!isPublished) {
          return {
            title: sanitizeEmDash(topicTitle.trim()),
            category: category.name,
            seoKeyword: seoBrief?.primary ?? "",
            seoBrief,
          };
        }
      }

      if (attempt < maxRetries - 1) {
        console.log(
          `All topics were duplicates, retrying... (attempt ${attempt + 2}/${maxRetries})`
        );
      }
    } catch (error) {
      if (isQuotaError(error)) {
        throw error;
      }
      console.error(`Error generating topic (attempt ${attempt + 1}):`, error);
      if (attempt === maxRetries - 1) {
        throw new Error(
          `Failed to generate unique topic after ${maxRetries} attempts: ${error}`
        );
      }
    }
  }

  if (seoBrief) {
    const category = fixedCategory ?? getRandomCategory();
    const fallbackTitle = buildFallbackTopicTitle(seoBrief.primary);
    if (
      !isTooGenericTitle(fallbackTitle, seoBrief.primary) &&
      !(await isTopicPublished(fallbackTitle, createSlug(fallbackTitle)))
    ) {
      return {
        title: sanitizeEmDash(fallbackTitle),
        category: category.name,
        seoKeyword: seoBrief.primary,
        seoBrief,
      };
    }
  }

  throw new Error(`Failed to generate unique topic after ${maxRetries} attempts`);
}

/**
 * Generate blog content using Gemini AI
 */
export type GeneratedBlogContent = {
  title: string;
  description: string;
  content: string;
  faqs: BlogFaqItem[];
};

export type GenerateBlogContentOptions = {
  /** Outline, angle, or requirements from the admin author */
  userBrief?: string;
  /** First entry = primary SEO keyword; rest = secondary terms */
  focusedKeywords?: string[];
  /** Byline author — bio/role steer topic voice (automation picks randomly) */
  author?: BlogAuthor;
  /** Second-pass: Gemini outline first, then full draft (used on automation retry). */
  useOutlinePass?: boolean;
  /** Retry with alternate free-tier model (GEMINI_BLOG_RETRY_MODEL, default flash-lite-preview). */
  preferQualityModel?: boolean;
  /** Search intent override when seoBrief is null (admin manual generate). */
  searchIntent?: string;
  /** Rejected titles from prior similarity failures (automation retries). */
  excludeTitles?: string[];
  /** When set, force the returned title (automation uses planned topic title). */
  lockedTitle?: string;
  /** Skip outline Gemini call; use this JSON from planBlogContent instead. */
  preApprovedOutline?: string;
  /** Published posts to omit from related-post knowledge excerpts. */
  excludeKnowledgeSlugs?: string[];
  /** Planned FAQ questions from outline pass (for faqs[0] keyword repair). */
  plannedFaqQuestions?: string[];
  /** Grounded SERP research brief (automation pipeline). */
  serpBrief?: SerpResearchBrief;
  /** Grounded fact/stat research brief (automation pipeline). */
  factBrief?: FactResearchBrief;
  structuralPromise?: string;
  requiredDifferentiator?: string;
  forbiddenH2Themes?: string[];
  forbiddenAngles?: CorpusIndexEntry[];
  lockedDescription?: string;
  /** Editorial angle from coverage ledger (drives word-count tier). */
  angleId?: string;
  volumeBucket?: number;
  competitionIndex?: number;
  /** Per-keyword intent cluster guide (covered intents + recommended next intent). */
  keywordIntentClusterPrompt?: string;
};

function resolveGenerationWordCountPolicy(
  primaryKeyword: string | undefined,
  searchIntent: string | undefined,
  seoBrief?: SeoKeywordBrief | null,
  options?: GenerateBlogContentOptions
): BlogWordCountPolicy {
  return resolveBlogWordCountPolicy({
    primaryKeyword: primaryKeyword ?? seoBrief?.primary,
    angleId: options?.angleId,
    searchIntent,
    volumeBucket: options?.volumeBucket ?? seoBrief?.volumeBucket,
    competitionIndex: options?.competitionIndex ?? seoBrief?.competitionIndex,
  });
}

function buildResearchPromptBlock(options?: GenerateBlogContentOptions): string {
  const parts: string[] = [];
  if (options?.serpBrief) {
    parts.push(formatSerpBriefForPrompt(options.serpBrief));
  }
  if (options?.factBrief) {
    parts.push(formatFactBriefForPrompt(options.factBrief));
  }
  return parts.length > 0 ? `\n${parts.join("\n\n")}\n` : "";
}

function countPlainWords(html: string): number {
  return stripHtmlToPlainText(html).split(/\s+/).filter(Boolean).length;
}

/** Keep automation titles inside validator bounds without a model round-trip. */
function enforceSeoTitleLength(title: string): string {
  const t = title.trim();
  if (t.length <= 72) return t;
  const colon = t.indexOf(":");
  if (colon >= 35 && colon <= 72) return t.slice(0, colon).trim();
  const dash = t.indexOf(" - ");
  if (dash >= 35 && dash <= 72) return t.slice(0, dash).trim();
  const slice = t.slice(0, 69).trim();
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace >= 35) return slice.slice(0, lastSpace).trim();
  return slice;
}

function parseBlogJsonFromText(text: string): {
  title: string;
  description: string;
  content: string;
  faqs?: unknown;
} {
  return parseGeminiJsonObject(text);
}

function normalizeParsedBlog(
  blogData: {
    title: string;
    description: string;
    content: string;
    faqs?: unknown;
  },
  fallbackFaqs?: BlogFaqItem[]
): GeneratedBlogContent {
  if (!blogData.title || !blogData.description || !blogData.content) {
    throw new Error(
      "AI response missing required fields (title, description, content)"
    );
  }

  let faqs = normalizeBlogFaqsInput(blogData.faqs);
  if (faqs.length < 4 && (fallbackFaqs?.length ?? 0) >= 4) {
    faqs = fallbackFaqs!;
  }
  if (faqs.length < 4) {
    throw new Error(
      "AI response must include at least 4 FAQs in the faqs array"
    );
  }

  return {
    title: enforceSeoTitleLength(sanitizeEmDash(blogData.title.trim())),
    description: sanitizeEmDash(blogData.description.trim()),
    content: sanitizeEmDash(blogData.content.trim()),
    faqs: faqs.slice(0, 5).map((faq) => ({
      question: sanitizeEmDash(faq.question),
      answer: sanitizeEmDash(faq.answer),
    })),
  };
}

async function expandShortBlogDraft(
  draft: GeneratedBlogContent,
  topic: string,
  primaryKeyword: string | undefined,
  wordPolicy: BlogWordCountPolicy,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const wordCount = countPlainWords(draft.content);
  const minWords = wordPolicy.minWords;
  const wordsNeeded = Math.max(minWords - wordCount, 400);
  const wordCountRules = formatLongFormWordCountRules(wordPolicy);
  const prompt = `You are expanding a SHORT utility-scale solar blog draft (${wordCount} words). Add at least ${wordsNeeded} more words so the total reaches ${wordPolicy.targetMin}–${wordPolicy.targetMax}.

Working title: ${topic}
Current title: ${draft.title}
Primary SEO keyword: ${primaryKeyword?.trim() || "(none)"}

CURRENT HTML (keep all H2 headings and structure; expand EVERY section with new India plant scenarios, numeric ranges, comparison tables, and O&M detail):
${draft.content}

${wordCountRules}
${AI_OVERVIEW_SNIPPET_RULES}
${PUNCTUATION_RULES}

Return ONLY valid JSON:
{
  "title": "50-60 chars, max 72",
  "description": "meta description 150-160 chars",
  "content": "<p>expanded full HTML...</p>",
  "faqs": [ four FAQ objects matching expanded facts ]
}

Rules:
- content MUST be at least ${minWords} words (target ${wordPolicy.targetMin}–${wordPolicy.targetMax}). You need ~${wordsNeeded} more words than the draft above.
- Expand EXISTING sections in place; do NOT repeat or duplicate H2 headings.
- Opening <p> must directly answer the title in 2-3 sentences.
- Keep "Quick answer" H2 and one question-shaped H2.
- No "Frequently asked questions" heading in HTML.
- faqs: exactly 4 items; faqs[0] must phrase the primary keyword as a question.`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_expand" })
  );
  const expanded = normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
  return applyMonotonicContentExpansion(draft, expanded);
}

function applyMonotonicContentExpansion(
  previous: GeneratedBlogContent,
  candidate: GeneratedBlogContent
): GeneratedBlogContent {
  const prevWords = countPlainWords(previous.content);
  const nextWords = countPlainWords(candidate.content);
  if (nextWords < prevWords * 0.9) {
    console.warn(
      `Expansion shrank draft (${nextWords} vs ${prevWords} words); keeping previous content`
    );
    return previous;
  }
  return candidate;
}

async function repairBlogOpening(
  draft: GeneratedBlogContent,
  topic: string,
  primaryKeyword: string | undefined,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const keywordRule = primaryKeyword?.trim()
    ? `- Include the primary SEO keyword "${primaryKeyword}" naturally in the first ~100 words.\n`
    : "";
  const prompt = `Fix the OPENING of this utility-scale solar blog so the first two <p> tags directly answer the title question (2-3 sentences, no filler).
${keywordRule}
Title: ${draft.title}
Working topic: ${topic}
Primary SEO keyword: ${primaryKeyword?.trim() || "(none)"}

HTML (rewrite opening <p> tags only; keep all H2+ sections unchanged):
${draft.content}

Return ONLY valid JSON with the full HTML in "content", same title/description/faqs otherwise:
{ "title": "...", "description": "...", "content": "...", "faqs": [ ... ] }`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_repair" })
  );
  return normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
}

async function repairBlogIntentAlignment(
  draft: GeneratedBlogContent,
  topic: string,
  primaryKeyword: string | undefined,
  searchIntent: string | undefined,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const intent = buildBlogIntentContract({
    title: draft.title,
    primaryKeyword,
    searchIntent,
  });
  const intentBlock = formatBlogIntentPromptBlock(intent);

  const prompt = `Rewrite the OPENING and QUICK ANSWER of this blog so it matches the title search intent. The body drifted off-topic.
${intentBlock}

Title: ${draft.title}
Primary SEO keyword: ${primaryKeyword?.trim() || "(none)"}

Rewrite ONLY:
1) The first two <p> tags (direct answer to the title)
2) The "Quick answer" / "Summary for plant managers" H2 and its <ul> bullets

Keep ALL other H2 sections and content unchanged. Remove cleaning-robot sales pitch if the intent contract says robot pitch is OFF.

HTML:
${draft.content}

Return ONLY valid JSON:
{ "title": "...", "description": "...", "content": "...", "faqs": [ ... ] }`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_repair" })
  );
  return normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
}

async function repairBlogInternalLinks(
  draft: GeneratedBlogContent,
  topic: string,
  primaryKeyword: string | undefined,
  linkCandidates: BlogLinkCandidate[],
  robotPromotionRelevant: boolean,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const existing = extractQualifyingInternalLinkPaths(draft.content);
  const blogSlugs = existing.filter((p) => p.startsWith("/blog/"));
  const neededBlog = Math.max(MIN_BLOG_POST_LINKS - blogSlugs.length, 0);
  const neededTotal = Math.max(MIN_INTERNAL_LINKS - existing.length, 1);
  const keywordRule = primaryKeyword?.trim()
    ? `- Primary SEO keyword: "${primaryKeyword}"\n`
    : "";
  const candidateLines =
    linkCandidates.length > 0
      ? linkCandidates
          .slice(0, 6)
          .map((b) => `  /blog/${b.slug} — "${b.title}"`)
          .join("\n")
      : "  (pick relevant /blog/slug paths from the editorial context)";

  const prompt = `Add contextual internal links to this utility-scale solar blog HTML.
${keywordRule}
Rules:
- Insert <a href="/blog/slug"> links into EXISTING paragraphs only (no new H2 sections, no restructure).
- Add at least ${Math.max(neededBlog, 1)} links to related blog posts and enough total links to reach ${MIN_INTERNAL_LINKS}+.
- Anchor text must be descriptive (≥3 chars; not "here", "click here", "read more").
- Prefer these related posts (do not link to this article's own topic as a duplicate angle):
${candidateLines}
${
  robotPromotionRelevant
    ? "- You may add at most 1 pillar page link if the paragraph compares cleaning methods."
    : "- Do NOT add product/calculator pillar links; use /blog/ posts only."
}
- Place new links BEFORE any "Key takeaways" or "What plant managers should do next" H2.
- Keep all other HTML, title, description, and faqs unchanged.
- Do NOT add an H1; use only H2/H3 in body.

Topic: ${topic}
Title: ${draft.title}
Already linked: ${existing.length > 0 ? existing.join(", ") : "(none)"}

HTML:
${draft.content}

Return ONLY valid JSON:
{ "title": "...", "description": "...", "content": "...", "faqs": [ ... ] }`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_repair" })
  );
  return normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
}

async function appendBlogSections(
  draft: GeneratedBlogContent,
  topic: string,
  primaryKeyword: string | undefined,
  wordPolicy: BlogWordCountPolicy,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const wordCount = countPlainWords(draft.content);
  const minWords = wordPolicy.minWords;
  const wordsNeeded = Math.max(minWords - wordCount, 300);
  const wordCountRules = formatLongFormWordCountRules(wordPolicy);

  const prompt = `This utility-scale solar blog is ${wordCount} words but needs ${minWords}+ total. Add ${wordsNeeded}+ words as 2–3 NEW H2 sections (with H3 subsections and a comparison table or checklist if missing).

Topic: ${topic}
Primary keyword: ${primaryKeyword?.trim() || "(none)"}

EXISTING HTML (keep unchanged; insert new sections BEFORE any "Key takeaways" / "What plant managers" H2):
${draft.content}

${wordCountRules}
${PUNCTUATION_RULES}

Return ONLY valid JSON with the FULL merged HTML in "content" (original + new sections), same 4 faqs updated if needed, title 50-60 chars (max 72), description 150-160 chars.

Rules:
- Do NOT duplicate any existing H2 heading from EXISTING HTML; add only NEW H2 sections not already present.
- Insert new sections BEFORE any "Key takeaways" / "What plant managers" H2.`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_expand" })
  );
  const appended = normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
  return applyMonotonicContentExpansion(draft, appended);
}

async function generateBlogBodyFromPlan(
  topic: string,
  category: string,
  plan: BlogContentPlan,
  ctx: {
    knowledgeContext: string;
    editorial: string;
    authorBlock: string;
    seoBlock: string;
    excludeBlock: string;
    primaryKeyword?: string;
    researchBlock?: string;
    contractBlock?: string;
    wordCountRules?: string;
    structurePolicy?: ReturnType<typeof resolveBlogStructurePolicy>;
  },
  options?: GenerateTextOptions
): Promise<{ content: string; faqs: BlogFaqItem[] }> {
  const sectionCtx: SectionWriterContext = {
    topic,
    category,
    knowledgeContext: ctx.knowledgeContext,
    editorial: ctx.editorial,
    authorBlock: ctx.authorBlock,
    seoBlock: ctx.seoBlock,
    excludeBlock: ctx.excludeBlock,
    primaryKeyword: ctx.primaryKeyword,
    researchBlock: ctx.researchBlock,
    contractBlock: ctx.contractBlock,
    wordCountRules: ctx.wordCountRules,
    structurePolicy: ctx.structurePolicy,
  };

  const chunks = chunkH2Outline(plan.h2Outline, 2);
  const htmlParts: string[] = [];
  const priorH2Keys = new Set<string>();

  async function ingestSectionHtml(
    rawHtml: string,
    chunkIndex: number,
    chunkTotal: number
  ): Promise<boolean> {
    let sectionHtml = sanitizeEmDash(String(rawHtml).trim());
    if (!sectionHtml) return false;
    sectionHtml = stripPriorH2Sections(sectionHtml, priorH2Keys);
    if (!sectionHtml.trim()) {
      console.warn(
        `Section writer chunk ${chunkIndex + 1}/${chunkTotal} only repeated prior H2s; will retry missing sections`
      );
      return false;
    }
    for (const key of extractH2Headings(sectionHtml)) {
      priorH2Keys.add(key);
    }
    htmlParts.push(sectionHtml);
    return true;
  }

  async function writeSectionChunk(
    sectionH2s: string[],
    chunkIndex: number,
    chunkTotal: number,
    maxRetries = 2
  ): Promise<void> {
    for (let retry = 0; retry < maxRetries; retry++) {
      const previousSectionsHtml = assembleSectionHtml(htmlParts);
      const prompt = buildSectionWriterPrompt(sectionCtx, plan, sectionH2s, {
        isFirstChunk: htmlParts.length === 0,
        sectionIndex: chunkIndex,
        totalSections: chunkTotal,
        previousSectionsHtml:
          previousSectionsHtml.trim().length > 0 ? previousSectionsHtml : undefined,
      });
      const text = await generateText(
        prompt,
        blogSectionTextOptions({ ...options, purpose: "blog_section" })
      );
      const parsed = parseGeminiJsonObject<{ html?: string }>(text);
      const html = parsed.html;
      if (!html?.trim()) {
        continue;
      }
      if (await ingestSectionHtml(html, chunkIndex, chunkTotal)) {
        return;
      }
    }
  }

  for (let i = 0; i < chunks.length; i++) {
    await writeSectionChunk(chunks[i], i, chunks.length);
  }

  const missingH2s = missingH2OutlineSections(plan.h2Outline, priorH2Keys);
  if (missingH2s.length > 0) {
    console.warn(
      `Section writer missing ${missingH2s.length} planned H2(s); writing individually`
    );
    for (let i = 0; i < missingH2s.length; i++) {
      await writeSectionChunk([missingH2s[i]], chunks.length + i, chunks.length + missingH2s.length, 3);
    }
  }

  const stillMissing = missingH2OutlineSections(plan.h2Outline, priorH2Keys);
  if (stillMissing.length > 0) {
    throw new Error(
      `Section writer produced incomplete article (missing H2s: ${stillMissing.slice(0, 4).join("; ")})`
    );
  }

  const content = sanitizeGeneratedBlogBodyHtml(assembleSectionHtml(htmlParts), {
    title: topic,
    primaryKeyword: ctx.primaryKeyword,
  });
  const faqPrompt = buildFaqWriterPrompt(sectionCtx, plan, content);
  let faqs: BlogFaqItem[] = [];
  for (let attempt = 0; attempt < 2 && faqs.length < 4; attempt++) {
    const faqText = await generateText(
      faqPrompt,
      blogSectionTextOptions({ ...options, purpose: "blog_faq" })
    );
    const faqParsed = parseBlogJsonFromText(faqText);
    faqs = normalizeBlogFaqsInput(faqParsed.faqs);
  }
  if (faqs.length < 4) {
    throw new Error("FAQ writer must return at least 4 FAQs");
  }

  const repairedFaqs = ensurePrimaryKeywordInFirstFaq(
    faqs.slice(0, 5),
    ctx.primaryKeyword,
    plan.faqQuestions[0]
  );

  return { content, faqs: repairedFaqs };
}

function formatFocusedKeywordsBlock(
  keywords: string[],
  kind: "blog" | "project" = "blog"
): string {
  const cleaned = keywords.map((k) => k.trim()).filter(Boolean);
  if (!cleaned.length) return "";

  const [primary, ...related] = cleaned;
  const relatedLine = related.length
    ? `- Secondary keywords: ${related.join(", ")}\n`
    : "";
  const placement =
    kind === "project"
      ? "title, meta description, overview details, and at least one H2"
      : "title, meta description, first 100 words, at least one H2, and at least 2 FAQ questions";

  return `FOCUS KEYWORDS (admin-provided, prioritize for SEO; satisfy reader intent first):
- Primary keyword: "${primary}"
${relatedLine}- Work the primary phrase in: ${placement}.
- Use secondary terms naturally in H2/H3 and body, do NOT keyword-stuff.
`;
}

const PROJECT_CASE_STUDY_RULES = `PROJECT CASE STUDY (not a blog article):
- Write as a Taypro deployment / reference project page: site facts, soiling context, cleaning approach, outcomes.
- Word count: 1,000–1,800 words in "content" (minimum 900; no filler).
- Structure: 4–7 H2 sections (e.g. Site overview, Challenge, Taypro solution, Implementation, Results, What this means for similar plants).
- Include specific plant-scale signals: MW capacity, state/region in India, tracker/fixed-tilt if known from the brief, cleaning mode (automatic / semi-automatic / manual assist).
- "details" array: 4–8 short overview chips (2–8 words each) shown on the project card.
- REQUIRED category tags (use these EXACT English strings, one or more as applicable): "Automatic", "Semi-Automatic", "Capex", "Opex". These control site navigation; do not substitute phrases like "Automatic cleaning".
- Also include factual chips: MW capacity, Indian state/region, array type (e.g. "Utility-scale", "Single-axis trackers") when known from the brief.
- If the brief names a real location or capacity, use those exactly; otherwise use plausible utility-scale India ranges and label assumptions generically.
- Internal links to Taypro product and project pages are auto-injected on the live site (same as blogs); focus on natural phrases that match GLYDE, HELYX, ROI calculator, cleaning technology, etc.
- End with a short "Key outcomes" or "Why this matters" H2 with 3–5 bullets.
- Do NOT invent client names, exact ROI percentages, or Taypro specs not in the knowledge base.`;

/** Phase 2: cheap plan (meta + H2 outline) before full body generation. */
export async function planBlogContent(
  topic: string,
  _category: string,
  seoBrief: SeoKeywordBrief | null | undefined,
  editorialContext: string,
  options?: GenerateBlogContentOptions
): Promise<BlogContentPlan> {
  const seoBlock = seoBrief ? `\n${formatSeoPromptBlock(seoBrief)}\n` : "";
  const authorBlock = options?.author
    ? `\n${formatAuthorVoicePrompt(options.author)}\n`
    : "";
  const excludeBlock =
    options?.excludeTitles && options.excludeTitles.length > 0
      ? `\nDo NOT mirror these rejected titles/angles:\n${options.excludeTitles.map((t) => `- ${t}`).join("\n")}\n`
      : "";
  const researchBlock = buildResearchPromptBlock(options);
  const primaryKeyword =
    options?.focusedKeywords?.[0]?.trim() || seoBrief?.primary;
  const searchIntent =
    seoBrief?.searchIntent ?? options?.searchIntent?.trim();
  const wordPolicy = resolveGenerationWordCountPolicy(
    primaryKeyword,
    searchIntent,
    seoBrief,
    options
  );
  const wordCountRules = formatLongFormWordCountRules(wordPolicy);
  const structurePolicy = resolveBlogStructurePolicy(wordPolicy.tier);
  const intentContract = buildBlogIntentContract({
    title: topic,
    primaryKeyword,
    searchIntent,
    category: _category,
    angleId: options?.angleId,
  });
  const intentBlock = formatBlogIntentPromptBlock(intentContract);
  const clusterBlock = options?.keywordIntentClusterPrompt?.trim()
    ? `\n${options.keywordIntentClusterPrompt.trim()}\n`
    : "";

  const prompt = `You are a senior SEO editor for Taypro (utility-scale solar cleaning robots, India).

${intentBlock}
${clusterBlock}
Plan a long-form blog outline for: ${topic}
Category: ${_category}
${seoBlock}
${researchBlock}
${editorialContext}
${authorBlock}
${excludeBlock}
${ANTI_GENERIC_WRITING_RULES}
${SEO_AND_READER_RULES}
${AI_OVERVIEW_SNIPPET_RULES}
${wordCountRules}

Return ONLY valid JSON:
{
  "description": "Meta description 150-160 chars, specific outcome for this exact title",
  "intentFamily": "one of: ${formatIntentFamilyIdsForPrompt()}",
  "intentReason": "one sentence: why this intent fits the title and is not cannibalizing covered intents",
  "readerQuestion": "One sentence: what the searcher wants answered for THIS title/keyword",
  "mustCover": ["3-6 H2 themes that serve the title — not generic robot O&M"],
  "avoidTopics": ["2-4 off-topic drifts to avoid for this keyword"],
  "h2Outline": ["Quick answer", "Question-shaped H2 here", "..."],
  "quickAnswerBullets": ["bullet 1 with specific range", "..."],
  "faqQuestions": ["primary keyword as question", "...", "...", "..."]
}
Rules:
- intentFamily MUST match RECOMMENDED INTENT above when provided; otherwise pick the best uncovered cluster intent for this keyword.
- intentFamily must be an exact ID from the list (not a label).
- readerQuestion, mustCover, and avoidTopics MUST match the INTENT CONTRACT above (not a generic Taypro robot article).
- description must match THIS title angle (not a generic solar blog).
- h2Outline: ${structurePolicy.minH2}–${structurePolicy.maxH2Hint} items; first must be "Quick answer" or "Summary for plant managers"; include one People Also Ask style question H2.
- If SERP RESEARCH is provided: cover serpGaps with at least 2 dedicated H2s; align FAQ questions with People Also Ask where natural.
- If FACT RESEARCH is provided: weave verified stats into Quick answer bullets and relevant H2s; do not invent conflicting numbers.
- quickAnswerBullets: 3–5 specific bullets (MW, %, days, INR ranges as industry-typical or from verified stats).
- faqQuestions: exactly 4 natural search queries; first must use the primary SEO keyword when provided.`;

  const text = await generateText(
    prompt,
    blogTextOptions({
      preferQualityModel: options?.preferQualityModel,
      purpose: "blog_plan",
    })
  );

  let parsed: {
    description?: string;
    intentFamily?: unknown;
    intentReason?: unknown;
    readerQuestion?: string;
    mustCover?: unknown;
    avoidTopics?: unknown;
    h2Outline?: unknown;
    quickAnswerBullets?: unknown;
    faqQuestions?: unknown;
  };
  try {
    parsed = parseGeminiJsonObject(text);
  } catch {
    throw new Error("Could not parse outline JSON from AI response");
  }

  const h2Outline = Array.isArray(parsed.h2Outline)
    ? parsed.h2Outline
        .map((h) => (typeof h === "string" ? sanitizeEmDash(h.trim()) : ""))
        .filter(Boolean)
    : [];
  const description = sanitizeEmDash(String(parsed.description ?? "").trim());
  const quickAnswerBullets = Array.isArray(parsed.quickAnswerBullets)
    ? parsed.quickAnswerBullets
        .map((b) => (typeof b === "string" ? sanitizeEmDash(b.trim()) : ""))
        .filter(Boolean)
    : [];
  const faqQuestions = Array.isArray(parsed.faqQuestions)
    ? parsed.faqQuestions
        .map((q) => (typeof q === "string" ? sanitizeEmDash(q.trim()) : ""))
        .filter(Boolean)
    : [];
  const readerQuestion =
    typeof parsed.readerQuestion === "string" && parsed.readerQuestion.trim()
      ? sanitizeEmDash(parsed.readerQuestion.trim())
      : intentContract.readerQuestion;
  const mustCover = Array.isArray(parsed.mustCover)
    ? parsed.mustCover
        .map((m) => (typeof m === "string" ? sanitizeEmDash(m.trim()) : ""))
        .filter(Boolean)
    : [];
  const avoidTopics = Array.isArray(parsed.avoidTopics)
    ? parsed.avoidTopics
        .map((a) => (typeof a === "string" ? sanitizeEmDash(a.trim()) : ""))
        .filter(Boolean)
    : [];
  const mergedMustCover =
    mustCover.length > 0 ? mustCover : intentContract.mustCover;
  const mergedAvoidTopics =
    avoidTopics.length > 0 ? avoidTopics : intentContract.avoidTopics;

  const intentReason =
    typeof parsed.intentReason === "string" && parsed.intentReason.trim()
      ? sanitizeEmDash(parsed.intentReason.trim())
      : undefined;
  const resolvedIntent = primaryKeyword
    ? resolveStoredIntentFamily({
        keyword: primaryKeyword,
        aiIntent: parsed.intentFamily,
        angleId: options?.angleId,
        title: topic,
      })
    : null;
  if (
    resolvedIntent?.source === "code" &&
    parsed.intentFamily &&
    primaryKeyword
  ) {
    console.warn(
      `[planBlogContent] AI intent "${String(parsed.intentFamily)}" rejected for "${primaryKeyword}" — using ${resolvedIntent.intentFamily}`
    );
  }

  if (h2Outline.length < structurePolicy.minH2) {
    throw new Error(
      `Outline needs ≥${structurePolicy.minH2} H2 sections for ${wordPolicy.tier} tier (found ${h2Outline.length})`
    );
  }
  if (h2Outline.length > structurePolicy.maxH2Hint) {
    throw new Error(
      `Outline has too many H2 sections for ${wordPolicy.tier} tier (max ${structurePolicy.maxH2Hint}, found ${h2Outline.length})`
    );
  }
  if (description.length < 120 || description.length > 170) {
    throw new Error(
      `Outline meta description ${description.length} chars (target 150–160, allow 120–170)`
    );
  }

  const outlineJson = JSON.stringify(
    {
      description,
      intentFamily: resolvedIntent?.intentFamily,
      intentReason,
      readerQuestion,
      mustCover: mergedMustCover,
      avoidTopics: mergedAvoidTopics,
      h2Outline,
      quickAnswerBullets,
      faqQuestions,
    },
    null,
    2
  );

  return {
    description,
    h2Outline,
    quickAnswerBullets,
    faqQuestions,
    outlineJson,
    readerQuestion,
    mustCover: mergedMustCover,
    avoidTopics: mergedAvoidTopics,
    intentFamily: resolvedIntent?.intentFamily,
    intentReason,
  };
}

async function generateBlogOutline(
  topic: string,
  _category: string,
  seoBrief: SeoKeywordBrief | null | undefined,
  editorialContext: string,
  options?: GenerateBlogContentOptions
): Promise<string> {
  const plan = await planBlogContent(
    topic,
    _category,
    seoBrief,
    editorialContext,
    options
  );
  return plan.outlineJson;
}

export async function generateBlogContent(
  topic: string,
  _category: string,
  seoBrief?: SeoKeywordBrief | null,
  editorialContext?: string,
  options?: GenerateBlogContentOptions
): Promise<GeneratedBlogContent> {
  const primaryKeyword =
    options?.focusedKeywords?.[0]?.trim() || seoBrief?.primary;
  const searchIntent =
    seoBrief?.searchIntent ?? options?.searchIntent?.trim();
  const wordPolicy = resolveGenerationWordCountPolicy(
    primaryKeyword,
    searchIntent,
    seoBrief,
    options
  );
  const wordCountRules = formatLongFormWordCountRules(wordPolicy);
  const structurePolicy = resolveBlogStructurePolicy(wordPolicy.tier);
  const knowledgeContext = await buildBlogKnowledgeContext({
    topic,
    seoKeyword: primaryKeyword,
    extraTerms: _category,
    excludeSlugs: options?.excludeKnowledgeSlugs,
    forbiddenAngles: options?.forbiddenAngles,
    structuralPromise: options?.structuralPromise,
    requiredDifferentiator: options?.requiredDifferentiator,
    forbiddenH2Themes: options?.forbiddenH2Themes,
  });
  const linkCandidates = await findRelevantBlogExcerpts(
    {
      topic,
      seoKeyword: primaryKeyword,
      extraTerms: _category,
      excludeSlugs: options?.excludeKnowledgeSlugs,
    },
    6
  );
  const robotPromotionRelevant = isRobotPromotionRelevant({
    primaryKeyword,
    title: topic,
    angleId: options?.angleId,
    category: _category,
  });
  const internalLinkBlock = formatInternalLinkRulesForPrompt({
    blogCandidates: linkCandidates,
    robotPromotionRelevant,
  });
  const robotToneBlock = robotPromotionRelevant
    ? `- When the topic is cleaning/O&M, you may reference Taypro robots using PRODUCT KNOWLEDGE only; do not shoehorn robots into unrelated equipment specs sections.`
    : `- Do NOT pitch Taypro cleaning robots, product model names (GLYDE, NYUMA, HELYX), NECTYR, or the price calculator. Write as an authoritative equipment/O&M research guide for the primary keyword.`;
  const seoBlock = seoBrief ? `\n${formatSeoPromptBlock(seoBrief)}\n` : "";
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());
  const userBrief = options?.userBrief?.trim();
  const authorBlock = options?.author
    ? `\n${formatAuthorVoicePrompt(options.author)}\n`
    : "";
  const briefBlock = userBrief
    ? `
AUTHOR BRIEF (follow closely, audience, angle, must-cover points, tone):
${userBrief}
`
    : "";
  const focusedKeywordBlock = formatFocusedKeywordsBlock(
    options?.focusedKeywords ?? [],
    "blog"
  );
  const excludeBlock =
    options?.excludeTitles && options.excludeTitles.length > 0
      ? `\nDo NOT write about or reuse these rejected titles/angles:\n${options.excludeTitles.map((t) => `- ${t}`).join("\n")}\n`
      : "";
  const researchBlock = buildResearchPromptBlock(options);
  const intentContract = buildBlogIntentContract({
    title: topic,
    primaryKeyword,
    searchIntent,
    category: _category,
    angleId: options?.angleId,
  });
  const intentBlock = formatBlogIntentPromptBlock(intentContract);
  const clusterBlock = options?.keywordIntentClusterPrompt?.trim()
    ? options.keywordIntentClusterPrompt.trim()
    : "";
  const contractBlock = [
    intentBlock,
    clusterBlock,
    options?.structuralPromise?.trim()
      ? `Structural promise (must follow): ${options.structuralPromise.trim()}`
      : "",
    options?.requiredDifferentiator?.trim()
      ? `Required differentiator: ${options.requiredDifferentiator.trim()}`
      : "",
    options?.forbiddenH2Themes?.length
      ? `Do NOT reuse these H2 themes: ${options.forbiddenH2Themes.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  let outlineBlock = "";
  if (options?.preApprovedOutline?.trim()) {
    outlineBlock = `
APPROVED OUTLINE (follow section order and facts; expand each H2 into full sections):
${options.preApprovedOutline.trim()}
`;
  } else if (options?.useOutlinePass) {
    const outlineJson = await generateBlogOutline(
      topic,
      _category,
      seoBrief,
      editorial,
      options
    );
    outlineBlock = `
APPROVED OUTLINE (follow section order and facts; expand each H2 into full sections):
${outlineJson}
`;
  }

  const textGenOptions = blogTextOptions({
    preferQualityModel: options?.preferQualityModel,
  });

  const prompt = `You are an expert content writer for utility-scale solar in India (equipment research, plant O&M, and panel cleaning when relevant). Write a comprehensive, SEO-optimized blog post about: ${topic}

${intentBlock}

${editorial}
${authorBlock}
${briefBlock}
${focusedKeywordBlock}
${seoBlock}
${researchBlock}
${excludeBlock}
${outlineBlock}
CRITICAL: Accuracy (product specs, public proof stats, site positioning)
- Use ONLY the verified knowledge pack below. Do NOT invent features, specifications, fleet statistics, or product names.
- If unsure about a product detail, omit it or state it generically.

${knowledgeContext}

Requirements:
${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}
${AI_OVERVIEW_SNIPPET_RULES}
${wordCountRules}
- Use this exact working title: "${topic}"
- The JSON "title" field MUST be "${topic}" or a tighter paraphrase under 72 chars (do not swap to a different article angle)
- The full article must address the primary SEO keyword and working title; do NOT default to a generic "mistakes to avoid" listicle unless that is the working title
- Word count: ${wordPolicy.targetMin}–${wordPolicy.targetMax} words (minimum ${wordPolicy.minWords}; ${wordPolicy.tier} tier; do not pad with filler)
- Natural, conversational tone (avoid AI-sounding language)${options?.author ? "\n- Voice and examples must match the BYLINE AUTHOR block above" : ""}
- Factual, accurate information about solar panel cleaning and solar plant O&M
- For Taypro fleet/impact claims use PUBLIC PROOF POINTS from the knowledge pack only; for general industry data use verified stats from FACT RESEARCH when provided, otherwise typical ranges labeled as industry-typical
- Use headings (H2, H3) for structure
- Include bullet points and examples
- Natural keyword integration (use the SEO target above when provided; also solar plant maintenance, solar O&M, etc.)
- Good readability (aim for Flesch Reading Ease 60+)
- Original content (do not copy from other sources)
- Include practical tips and actionable insights
- Cover overall solar power plant operations and maintenance when relevant
${robotToneBlock}
${internalLinkBlock}
- Do NOT include a "Frequently asked questions" heading or FAQ list in the HTML; schema FAQs belong only in the "faqs" JSON array below.

Format the output as clean HTML with proper paragraph tags (<p>), headings (<h2>, <h3>), lists (<ul>, <ol>), and <table> where required.

Return the response in the following JSON format:
{
  "title": "Blog post title (SEO-optimized, 50-60 characters)",
  "description": "Meta description (150-160 characters, sentence case, one primary keyword naturally—never Title-Case keyword phrases mid-sentence)",
  "content": "<p>Full HTML content here...</p>",
  "faqs": [
    {
      "question": "Primary keyword phrased as a question (8–12 words, starts with How/What/Is/Which)",
      "answer": "Direct, factual answer in 2–4 sentences (40–80 words). No HTML."
    }
  ]
}

FAQ rules for the "faqs" array:
- Include exactly 4 items (required).
- faqs[0] must ask the primary SEO question; its answer must match the Quick answer H2 facts.
- Questions: 8–12 words, natural search queries (how often, how much, which is better, is X worth it).
- Answers: first sentence = direct yes/no, number, or verdict; remaining sentences = context. Plain text only (no HTML).
- Do not duplicate FAQ wording inside "content" HTML.`;

  try {
    let result: GeneratedBlogContent;

    if (options?.preApprovedOutline?.trim()) {
      const plan = parseBlogContentPlanJson(options.preApprovedOutline.trim());
      const { content, faqs } = await generateBlogBodyFromPlan(
        topic,
        _category,
        plan,
        {
          knowledgeContext,
          editorial,
          authorBlock,
          seoBlock,
          excludeBlock,
          primaryKeyword,
          researchBlock,
          contractBlock: contractBlock || undefined,
          wordCountRules,
          structurePolicy,
        },
        textGenOptions
      );
      result = {
        title: enforceSeoTitleLength(options?.lockedTitle?.trim() || topic),
        description: plan.description,
        content,
        faqs: faqs.map((faq) => ({
          question: sanitizeEmDash(faq.question),
          answer: sanitizeEmDash(faq.answer),
        })),
      };
    } else {
    const text = await generateText(prompt, {
      ...textGenOptions,
      purpose: "blog_section",
    });
    result = normalizeParsedBlog(parseBlogJsonFromText(text));
    }

    const lockedTitle = options?.lockedTitle?.trim();
    const lockedDescription =
      options?.lockedDescription?.trim() || result.description;

    const preserveLockedMetadata = () => {
      if (lockedTitle) {
        result = { ...result, title: enforceSeoTitleLength(lockedTitle) };
      }
      if (lockedDescription.trim()) {
        result = { ...result, description: lockedDescription };
      }
      result = {
        ...result,
        faqs: alignFirstFaqWithQuickAnswer(
          result.content,
          ensurePrimaryKeywordInFirstFaq(
            result.faqs,
            primaryKeyword,
            options?.plannedFaqQuestions?.[0]
          )
        ),
      };
    };

    if (
      !lockedTitle &&
      (isTooGenericTitle(result.title, primaryKeyword) ||
        isTooGenericDescription(result.description))
    ) {
      throw new Error(
        "Generated title or meta description was too generic; retry automation"
      );
    }
    if (lockedTitle && isTooGenericDescription(result.description)) {
      throw new Error(
        "Generated title or meta description was too generic; retry automation"
      );
    }

    const minWords = wordPolicy.minWords;
    const maxInPlacePasses = getBlogPipelineMaxInPlaceExpansions();
    for (let pass = 0; pass < maxInPlacePasses; pass++) {
      const wc = countPlainWords(result.content);
      if (wc >= minWords) break;
      const preferAppend = wc < minWords * 0.85;
      console.warn(
        preferAppend
          ? `Blog draft too short (${wc} words), append pass ${pass + 1}/${maxInPlacePasses} (${wordPolicy.tier} tier, min ${minWords})`
          : `Blog draft too short (${wc} words), expansion pass ${pass + 1}/${maxInPlacePasses} (${wordPolicy.tier} tier, min ${minWords})`
      );
      result = preferAppend
        ? await appendBlogSections(
            result,
            topic,
            primaryKeyword,
            wordPolicy,
            textGenOptions
          )
        : await expandShortBlogDraft(
            result,
            topic,
            primaryKeyword,
            wordPolicy,
            textGenOptions
          );
      preserveLockedMetadata();
    }

    let afterExpansion = countPlainWords(result.content);
    for (let appendPass = 0; appendPass < 2; appendPass++) {
      if (afterExpansion >= minWords) break;
      if (afterExpansion >= minWords * 0.85) break;
      console.warn(
        `Blog draft still short (${afterExpansion}/${minWords} words), append pass ${appendPass + 1}/2`
      );
      const appended = await appendBlogSections(
        result,
        topic,
        primaryKeyword,
        wordPolicy,
        textGenOptions
      );
      const appendedWords = countPlainWords(appended.content);
      if (appendedWords > afterExpansion) {
        result = appended;
        afterExpansion = appendedWords;
        preserveLockedMetadata();
      } else {
        break;
      }
    }

    if (afterExpansion >= minWords * 0.9 && afterExpansion < minWords) {
      console.warn(
        `Blog draft final top-up (${afterExpansion}/${minWords} words)`
      );
      result = await expandShortBlogDraft(
        result,
        topic,
        primaryKeyword,
        wordPolicy,
        textGenOptions
      );
      preserveLockedMetadata();
    }

    const wordsRemaining = minWords - countPlainWords(result.content);
    if (wordsRemaining > 0 && wordsRemaining <= 50) {
      console.warn(
        `Blog draft micro top-up (${wordsRemaining} words below ${minWords})`
      );
      result = await expandShortBlogDraft(
        result,
        topic,
        primaryKeyword,
        wordPolicy,
        textGenOptions
      );
      preserveLockedMetadata();
    }

    preserveLockedMetadata();

    result = {
      ...result,
      content: sanitizeGeneratedBlogBodyHtml(result.content, {
        title: result.title,
        primaryKeyword,
      }),
    };

    const validationInput = {
      title: result.title,
      description: result.description,
      content: result.content,
      faqs: result.faqs,
      primaryKeyword,
      searchIntent,
      angleId: options?.angleId,
      volumeBucket: options?.volumeBucket ?? seoBrief?.volumeBucket,
      competitionIndex: options?.competitionIndex ?? seoBrief?.competitionIndex,
    };

    let validation = validateGeneratedBlog(validationInput);

    if (
      !validation.ok &&
      validation.issues.some((issue) =>
        issue.includes("Opening must reflect") ||
        issue.includes("H2 sections must reflect") ||
        issue.includes("Content drifts into cleaning-robot") ||
        issue.includes("Primary keyword") ||
        issue.includes("Opening paragraphs should directly address")
      )
    ) {
      result = await repairBlogIntentAlignment(
        result,
        topic,
        primaryKeyword,
        searchIntent,
        textGenOptions
      );
      preserveLockedMetadata();
      result = {
        ...result,
        content: sanitizeGeneratedBlogBodyHtml(result.content, {
          title: result.title,
          primaryKeyword,
        }),
      };
      validation = validateGeneratedBlog({
        ...validationInput,
        title: result.title,
        description: result.description,
        content: result.content,
        faqs: result.faqs,
      });
    }

    if (
      !validation.ok &&
      validation.issues.length === 1 &&
      (validation.issues[0].includes("Opening paragraphs") ||
        validation.issues[0].includes("missing from opening"))
    ) {
      result = await repairBlogOpening(
        result,
        topic,
        primaryKeyword,
        textGenOptions
      );
      preserveLockedMetadata();
      validation = validateGeneratedBlog({
        ...validationInput,
        title: result.title,
        description: result.description,
        content: result.content,
        faqs: result.faqs,
      });
    }

    if (
      !validation.ok &&
      isInternalLinkOnlyFailure(validation.issues)
    ) {
      result = await repairBlogInternalLinks(
        result,
        topic,
        primaryKeyword,
        linkCandidates,
        robotPromotionRelevant,
        textGenOptions
      );
      preserveLockedMetadata();
      result = {
        ...result,
        content: sanitizeGeneratedBlogBodyHtml(result.content, {
          title: result.title,
          primaryKeyword,
        }),
      };
      validation = validateGeneratedBlog({
        ...validationInput,
        title: result.title,
        description: result.description,
        content: result.content,
        faqs: result.faqs,
      });
    }

    if (!validation.ok && isBodyHygieneOnlyFailure(validation.issues)) {
      result = {
        ...result,
        content: sanitizeGeneratedBlogBodyHtml(result.content, {
          title: result.title,
          primaryKeyword,
        }),
      };
      preserveLockedMetadata();
      validation = validateGeneratedBlog({
        ...validationInput,
        title: result.title,
        description: result.description,
        content: result.content,
        faqs: result.faqs,
      });
    }

    assertGeneratedBlogValid({
      ...validationInput,
      title: result.title,
      description: result.description,
      content: result.content,
      faqs: result.faqs,
    });

    return result;
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate blog content"
    );
  }
}

export type GeneratedProjectContent = {
  title: string;
  description: string;
  details: string[];
  content: string;
};

export type GenerateProjectContentOptions = {
  userBrief?: string;
  focusedKeywords?: string[];
  /** Byline author — bio/role steer case study voice (automation picks randomly) */
  author?: BlogAuthor;
};

function normalizeProjectDetails(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 10);
}

export async function generateProjectContent(
  topic: string,
  editorialContext?: string,
  options?: GenerateProjectContentOptions
): Promise<GeneratedProjectContent> {
  const primaryKeyword = options?.focusedKeywords?.[0]?.trim();
  const userBrief = options?.userBrief?.trim();
  const knowledgeContext = await buildProjectKnowledgeContext({
    topic,
    seoKeyword: primaryKeyword,
    extraTerms: userBrief?.slice(0, 300),
  });
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());
  const briefBlock = userBrief
    ? `
AUTHOR BRIEF (follow closely, site facts, deployment story, must-cover points):
${userBrief}
`
    : "";
  const focusedKeywordBlock = formatFocusedKeywordsBlock(
    options?.focusedKeywords ?? [],
    "project"
  );
  const authorBlock = options?.author
    ? `\n${formatAuthorVoicePrompt(options.author)}\n`
    : "";

  const prompt = `You are an expert writer for Taypro, a solar panel cleaning robot company. Write a detailed project case study page for: ${topic}

${editorial}
${authorBlock}
${briefBlock}
${focusedKeywordBlock}
CRITICAL: Accuracy (product specs, public proof stats, site positioning)
- Use ONLY the verified knowledge pack below. Do NOT invent features, specifications, fleet statistics, or product names.
- For Taypro fleet/impact claims use PUBLIC PROOF POINTS from the knowledge pack only; for this plant use AUTHOR BRIEF facts when provided.

${knowledgeContext}

${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}
${PROJECT_CASE_STUDY_RULES}
- Use this working title unless you can improve it with specific location/capacity: "${topic}"${options?.author ? "\n- Voice and examples must match the BYLINE AUTHOR block above" : ""}
- The JSON "title" should include capacity or location when the brief provides them (e.g. "Agar, Madhya Pradesh – 250 MW").

Format "content" as clean HTML with <p>, <h2>, <h3>, <ul>, <ol>.

Return ONLY valid JSON:
{
  "title": "Project title with location and/or MW (SEO-friendly)",
  "description": "Meta description (140-160 characters, specific outcome)",
  "details": ["250 MW", "Madhya Pradesh", "Automatic", "Capex", "Utility-scale"],
  "content": "<p>Case study HTML...</p>"
}`;

  try {
    const text = await generateText(prompt);

    let projectData: {
      title: string;
      description: string;
      details?: unknown;
      content: string;
    };
    try {
      projectData = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        projectData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON from AI response");
      }
    }

    if (!projectData.title || !projectData.description || !projectData.content) {
      throw new Error(
        "AI response missing required fields (title, description, content)"
      );
    }

    const details = canonicalizeCategoryDetailTags(
      normalizeProjectDetails(projectData.details)
    );
    if (details.length < 4) {
      throw new Error(
        "AI response must include at least 4 overview details in the details array"
      );
    }
    if (!projectHasCategoryTag(details)) {
      throw new Error(
        'AI response must include at least one category tag in details: "Automatic", "Semi-Automatic", "Capex", or "Opex"'
      );
    }

    if (
      isTooGenericTitle(projectData.title, primaryKeyword) ||
      isTooGenericDescription(projectData.description)
    ) {
      throw new Error(
        "Generated title or meta description was too generic; retry generation"
      );
    }

    return {
      title: sanitizeEmDash(projectData.title.trim()),
      description: sanitizeEmDash(projectData.description.trim()),
      details: details.map((d) => sanitizeEmDash(d)),
      content: sanitizeEmDash(projectData.content.trim()),
    };
  } catch (error) {
    console.error("Error generating project content:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to generate project content"
    );
  }
}

/** Exported for hybrid automation pickers (keyword/title). */
export async function generateGeminiPrompt(
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> {
  return generateText(prompt, options);
}
