import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomCategory, type TopicCategory } from "./topicCategories";
import { buildBlogKnowledgeContext } from "@/lib/seo/blog-knowledge-context";
import { buildProjectKnowledgeContext } from "@/lib/seo/project-knowledge-context";
import { createSlug } from "@/app/utils/blogFileUtils";
import {
  AI_OVERVIEW_SNIPPET_RULES,
  ANTI_GENERIC_WRITING_RULES,
  LONG_FORM_CONTENT_RULES,
  PUNCTUATION_RULES,
  SEO_AND_READER_RULES,
  isTooGenericDescription,
  isTooGenericTitle,
  sanitizeEmDash,
} from "@/lib/seo/content-quality";
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
  normalizeBlogFaqsInput,
  type BlogFaqItem,
} from "@/lib/cms/blog-faqs";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  assertGeminiCallAllowed,
  recordGeminiCall,
  type GeminiCallPurpose,
} from "@/lib/gemini/daily-budget";
import { freeGeminiTextModelCandidates } from "@/lib/gemini/free-tier-models";
import {
  assertGeneratedBlogValid,
  getBlogMinWordCount,
  validateGeneratedBlog,
} from "@/lib/seo/blog-content-validator";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { parseBlogContentPlanJson } from "@/lib/seo/blog-content-plan";
import {
  assembleSectionHtml,
  buildFaqWriterPrompt,
  buildSectionWriterPrompt,
  chunkH2Outline,
  type SectionWriterContext,
} from "@/lib/seo/blog-section-writer";

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set, add it to run AI features.");
  }
  return new GoogleGenerativeAI(key);
}

function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || message.toLowerCase().includes("quota");
}

function quotaErrorMessage(error: unknown): string {
  const base =
    "Gemini API free-tier quota exceeded. Retry after the daily limit resets (Google AI Studio usage).";
  if (error instanceof Error && error.message) {
    return `${base} (${error.message.slice(0, 200)})`;
  }
  return base;
}

type GenerateTextOptions = {
  /** On retry, rotate to another free-tier model ID (e.g. flash-lite-preview). */
  preferQualityModel?: boolean;
  /** Override output token cap (blog generation uses BLOG_MAX_OUTPUT_TOKENS). */
  maxOutputTokens?: number;
  /** Daily RPD accounting bucket. */
  purpose?: GeminiCallPurpose;
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
  const genAI = getGenAI();
  let lastError: unknown;

  for (const modelName of blogModelCandidates(options)) {
    try {
      assertGeminiCallAllowed(options?.purpose ?? "other");
      const generationConfig =
        options?.maxOutputTokens && options.maxOutputTokens > 0
          ? { maxOutputTokens: options.maxOutputTokens }
          : undefined;
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(generationConfig ? { generationConfig } : {}),
      });
      let text: string;
      try {
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
      } finally {
        recordGeminiCall(options?.purpose ?? "other");
        await pauseAfterGeminiCall();
      }
      return text;
    } catch (error) {
      lastError = error;
      if (isQuotaError(error)) {
        throw new Error(quotaErrorMessage(error));
      }
      console.warn(`Gemini model ${modelName} failed, trying next...`, error);
    }
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
};

import type { BlogContentPlan } from "@/lib/seo/blog-content-plan";
export type { BlogContentPlan } from "@/lib/seo/blog-content-plan";

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
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse JSON from AI response");
  }
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
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const wordCount = countPlainWords(draft.content);
  const minWords = getBlogMinWordCount();
  const wordsNeeded = Math.max(minWords - wordCount, 400);
  const prompt = `You are expanding a SHORT utility-scale solar blog draft (${wordCount} words). Add at least ${wordsNeeded} more words so the total reaches ${minWords}–3,200.

Working title: ${topic}
Current title: ${draft.title}
Primary SEO keyword: ${primaryKeyword?.trim() || "(none)"}

CURRENT HTML (keep all H2 headings and structure; expand EVERY section with new India plant scenarios, numeric ranges, comparison tables, and O&M detail):
${draft.content}

${LONG_FORM_CONTENT_RULES}
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
- content MUST be at least ${minWords} words (target 2,800–3,200). You need ~${wordsNeeded} more words than the draft above.
- Opening <p> must directly answer the title in 2-3 sentences.
- Keep "Quick answer" H2 and one question-shaped H2.
- No "Frequently asked questions" heading in HTML.
- faqs: exactly 4 items; faqs[0] must phrase the primary keyword as a question.`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_expand" })
  );
  return normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
}

async function repairBlogOpening(
  draft: GeneratedBlogContent,
  topic: string,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const prompt = `Fix the OPENING of this utility-scale solar blog so the first two <p> tags directly answer the title question (2-3 sentences, no filler).

Title: ${draft.title}
Working topic: ${topic}

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

async function appendBlogSections(
  draft: GeneratedBlogContent,
  topic: string,
  primaryKeyword: string | undefined,
  options?: GenerateTextOptions
): Promise<GeneratedBlogContent> {
  const wordCount = countPlainWords(draft.content);
  const minWords = getBlogMinWordCount();
  const wordsNeeded = Math.max(minWords - wordCount, 300);

  const prompt = `This utility-scale solar blog is ${wordCount} words but needs ${minWords}+ total. Add ${wordsNeeded}+ words as 2–3 NEW H2 sections (with H3 subsections and a comparison table or checklist if missing).

Topic: ${topic}
Primary keyword: ${primaryKeyword?.trim() || "(none)"}

EXISTING HTML (keep unchanged; insert new sections BEFORE any "Key takeaways" / "What plant managers" H2):
${draft.content}

${LONG_FORM_CONTENT_RULES}
${PUNCTUATION_RULES}

Return ONLY valid JSON with the FULL merged HTML in "content" (original + new sections), same 4 faqs updated if needed, title 50-60 chars (max 72), description 150-160 chars.`;

  const text = await generateText(
    prompt,
    blogTextOptions({ ...options, purpose: "blog_expand" })
  );
  return normalizeParsedBlog(parseBlogJsonFromText(text), draft.faqs);
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
  };

  const chunks = chunkH2Outline(plan.h2Outline, 2);
  const htmlParts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const previousSectionsHtml = assembleSectionHtml(htmlParts);
    const prompt = buildSectionWriterPrompt(sectionCtx, plan, chunks[i], {
      isFirstChunk: i === 0,
      sectionIndex: i,
      totalSections: chunks.length,
      previousSectionsHtml: i > 0 ? previousSectionsHtml : undefined,
    });
    const text = await generateText(
      prompt,
      blogSectionTextOptions({ ...options, purpose: "blog_section" })
    );
    let html: string;
    try {
      html = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? text).html;
    } catch {
      throw new Error("Could not parse section HTML from AI response");
    }
    if (!html?.trim()) {
      throw new Error("Section writer returned empty HTML");
    }
    htmlParts.push(sanitizeEmDash(String(html).trim()));
  }

  const content = assembleSectionHtml(htmlParts);
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

  return { content, faqs: faqs.slice(0, 5) };
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
- REQUIRED category tags (use these EXACT English strings, one or more as applicable): "Automatic", "Semi-Automatic", "Capex". These control site navigation; do not substitute phrases like "Automatic cleaning".
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

  const prompt = `You are a senior SEO editor for Taypro (utility-scale solar cleaning robots, India).

Plan a long-form blog outline for: ${topic}
Category: ${_category}
${seoBlock}
${editorialContext}
${authorBlock}
${excludeBlock}
${ANTI_GENERIC_WRITING_RULES}
${SEO_AND_READER_RULES}
${AI_OVERVIEW_SNIPPET_RULES}
${LONG_FORM_CONTENT_RULES}

Return ONLY valid JSON:
{
  "description": "Meta description 150-160 chars, specific outcome for this exact title",
  "h2Outline": ["Quick answer", "Question-shaped H2 here", "..."],
  "quickAnswerBullets": ["bullet 1 with specific range", "..."],
  "faqQuestions": ["primary keyword as question", "...", "...", "..."]
}
Rules:
- description must match THIS title angle (not a generic solar blog).
- h2Outline: 6–10 items; first must be "Quick answer" or "Summary for plant managers"; include one People Also Ask style question H2.
- quickAnswerBullets: 3–5 specific bullets (MW, %, days, INR ranges as industry-typical).
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
    h2Outline?: unknown;
    quickAnswerBullets?: unknown;
    faqQuestions?: unknown;
  };
  try {
    parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? text);
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

  if (h2Outline.length < 6) {
    throw new Error(`Outline needs ≥6 H2 sections (found ${h2Outline.length})`);
  }
  if (description.length < 120 || description.length > 170) {
    throw new Error(
      `Outline meta description ${description.length} chars (target 150–160, allow 120–170)`
    );
  }

  const outlineJson = JSON.stringify(
    {
      description,
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
  const knowledgeContext = await buildBlogKnowledgeContext({
    topic,
    seoKeyword: primaryKeyword,
    extraTerms: _category,
  });
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

  const prompt = `You are an expert content writer specializing in solar panel cleaning robots and solar power plant operations & maintenance. Write a comprehensive, SEO-optimized blog post about: ${topic}

${editorial}
${authorBlock}
${briefBlock}
${focusedKeywordBlock}
${seoBlock}
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
${LONG_FORM_CONTENT_RULES}
- Use this exact working title: "${topic}"
- The JSON "title" field MUST be "${topic}" or a tighter paraphrase under 72 chars (do not swap to a different article angle)
- The full article must address the primary SEO keyword and working title; do NOT default to a generic "mistakes to avoid" listicle unless that is the working title
- Word count: 2,800-3,200 words (minimum 2,600; do not pad with filler)
- Natural, conversational tone (avoid AI-sounding language)${options?.author ? "\n- Voice and examples must match the BYLINE AUTHOR block above" : ""}
- Factual, accurate information about solar panel cleaning and solar plant O&M
- For Taypro fleet/impact claims use PUBLIC PROOF POINTS from the knowledge pack only; for general industry data use typical ranges and do not invent precise studies
- Use headings (H2, H3) for structure
- Include bullet points and examples
- Natural keyword integration (use the SEO target above when provided; also solar plant maintenance, solar O&M, etc.)
- Good readability (aim for Flesch Reading Ease 60+)
- Original content (do not copy from other sources)
- Include practical tips and actionable insights
- Cover overall solar power plant operations and maintenance when relevant
- Reference Taypro's solutions naturally where relevant, but ONLY use verified information
- Include 3–5 internal links to Taypro pillar paths listed in the editorial strategy (use relative hrefs like href="/solar-panel-cleaning-system")
- Do NOT include a "Frequently asked questions" heading or FAQ list in the HTML; schema FAQs belong only in the "faqs" JSON array below.

Format the output as clean HTML with proper paragraph tags (<p>), headings (<h2>, <h3>), lists (<ul>, <ol>), and <table> where required.

Return the response in the following JSON format:
{
  "title": "Blog post title (SEO-optimized, 50-60 characters)",
  "description": "Meta description (150-160 characters, SEO-optimized)",
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

    if (
      isTooGenericTitle(result.title, primaryKeyword) ||
      isTooGenericDescription(result.description)
    ) {
      throw new Error(
        "Generated title or meta description was too generic; retry automation"
      );
    }

    const minWords = getBlogMinWordCount();
    const maxExpansionPasses = options?.preApprovedOutline?.trim() ? 2 : 3;
    for (let pass = 0; pass < maxExpansionPasses; pass++) {
      const wc = countPlainWords(result.content);
      if (wc >= minWords) break;
      console.warn(
        `Blog draft too short (${wc} words), expansion pass ${pass + 1}/${maxExpansionPasses}`
      );
      result = await expandShortBlogDraft(
        result,
        topic,
        primaryKeyword,
        textGenOptions
      );
    }

    let afterExpansion = countPlainWords(result.content);
    for (let appendPass = 0; appendPass < 2; appendPass++) {
      if (afterExpansion >= minWords) break;
      if (afterExpansion < minWords * 0.75) break;
      console.warn(
        `Blog draft near target (${afterExpansion}/${minWords} words), appending sections (${appendPass + 1}/2)`
      );
      const appended = await appendBlogSections(
        result,
        topic,
        primaryKeyword,
        textGenOptions
      );
      const appendedWords = countPlainWords(appended.content);
      if (appendedWords > afterExpansion) {
        result = appended;
        afterExpansion = appendedWords;
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
        textGenOptions
      );
    }

    let validation = validateGeneratedBlog({
      title: result.title,
      description: result.description,
      content: result.content,
      faqs: result.faqs,
      primaryKeyword,
      searchIntent,
    });
    if (
      !validation.ok &&
      validation.issues.length === 1 &&
      validation.issues[0].includes("Opening paragraphs")
    ) {
      result = await repairBlogOpening(result, topic, textGenOptions);
      validation = validateGeneratedBlog({
        title: result.title,
        description: result.description,
        content: result.content,
        faqs: result.faqs,
        primaryKeyword,
        searchIntent,
      });
    }

    if (options?.lockedTitle?.trim()) {
      result = { ...result, title: enforceSeoTitleLength(options.lockedTitle.trim()) };
    }

    assertGeneratedBlogValid({
      title: result.title,
      description: result.description,
      content: result.content,
      faqs: result.faqs,
      primaryKeyword,
      searchIntent,
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
        'AI response must include at least one category tag in details: "Automatic", "Semi-Automatic", or "Capex"'
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
