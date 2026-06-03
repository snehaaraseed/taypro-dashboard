import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomCategory } from "./topicCategories";
import { buildBlogKnowledgeContext } from "@/lib/seo/blog-knowledge-context";
import { getProductKnowledgeBase } from "./productKnowledge";
import { createSlug } from "@/app/utils/blogFileUtils";
import {
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

/** Free tier: prefer 3.1 Flash Lite (500 RPD) over 2.5 Flash (20 RPD). */
const DEFAULT_BLOG_MODEL = "gemini-3.1-flash-lite";

const BLOG_MODEL_CANDIDATES = [
  process.env.GEMINI_BLOG_MODEL?.trim(),
  DEFAULT_BLOG_MODEL,
  "gemini-3.1-flash-lite-preview",
].filter((m): m is string => Boolean(m));

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
    "Gemini API quota exceeded. Enable billing at https://aistudio.google.com/apikey or retry after the daily limit resets.";
  if (error instanceof Error && error.message) {
    return `${base} (${error.message.slice(0, 200)})`;
  }
  return base;
}

async function generateText(prompt: string): Promise<string> {
  const genAI = getGenAI();
  let lastError: unknown;

  for (const modelName of BLOG_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
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

export async function generateUniqueTopic(
  maxRetries: number = 3,
  editorialContext?: string,
  author?: BlogAuthor
): Promise<GeneratedTopic> {
  const seoBrief = await pickSeoKeywordBrief();
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());
  const authorBlock = author ? `\n${formatAuthorVoicePrompt(author)}\n` : "";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const category = getRandomCategory();
    const knowledgeContext = await buildBlogKnowledgeContext({
      seoKeyword: seoBrief?.primary,
      extraTerms: category.name,
    });
    const seoBlock = seoBrief
      ? `\n${formatSeoPromptBlock(seoBrief)}\n- At least 3 of the 5 titles MUST include the exact phrase "${seoBrief.primary}" or a word-order variant.\n`
      : "";

    const prompt = `You are a content strategist for a solar panel cleaning robot company called Taypro.

${editorial}
${authorBlock}
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
      const text = await generateText(prompt);

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
    const category = getRandomCategory();
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
};

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
- "details" array: 4–8 short overview chips (2–8 words each) shown on the project card, e.g. "250 MW", "Madhya Pradesh", "Automatic cleaning", "Utility-scale".
- If the brief names a real location or capacity, use those exactly; otherwise use plausible utility-scale India ranges and label assumptions generically.
- Include 1–2 internal links to Taypro product pages (relative hrefs like href="/solar-panel-cleaning-system").
- End with a short "Key outcomes" or "Why this matters" H2 with 3–5 bullets.
- Do NOT invent client names, exact ROI percentages, or Taypro specs not in the knowledge base.`;

export async function generateBlogContent(
  topic: string,
  _category: string,
  seoBrief?: SeoKeywordBrief | null,
  editorialContext?: string,
  options?: GenerateBlogContentOptions
): Promise<GeneratedBlogContent> {
  const primaryKeyword =
    options?.focusedKeywords?.[0]?.trim() || seoBrief?.primary;
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
  const prompt = `You are an expert content writer specializing in solar panel cleaning robots and solar power plant operations & maintenance. Write a comprehensive, SEO-optimized blog post about: ${topic}

${editorial}
${authorBlock}
${briefBlock}
${focusedKeywordBlock}
${seoBlock}
CRITICAL: Accuracy (product specs, public proof stats, site positioning)
- Use ONLY the verified knowledge pack below. Do NOT invent features, specifications, fleet statistics, or product names.
- If unsure about a product detail, omit it or state it generically.

${knowledgeContext}

Requirements:
${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}
${LONG_FORM_CONTENT_RULES}
- Use this exact working title unless you can improve it without making it vaguer: "${topic}"
- The JSON "title" field should match or tightly paraphrase that line (must stay specific)
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
- Do NOT include a "Frequently asked questions" section in the HTML, FAQs belong only in the "faqs" JSON array below.

Format the output as clean HTML with proper paragraph tags (<p>), headings (<h2>, <h3>), and lists (<ul>, <ol>).

Return the response in the following JSON format:
{
  "title": "Blog post title (SEO-optimized, 50-60 characters)",
  "description": "Meta description (150-160 characters, SEO-optimized)",
  "content": "<p>Full HTML content here...</p>",
  "faqs": [
    {
      "question": "Specific reader question tied to the primary keyword (8–15 words)",
      "answer": "Direct, factual answer in 2–4 sentences (40–80 words). No HTML."
    }
  ]
}

FAQ rules for the "faqs" array:
- Include exactly 4 items (minimum 3, maximum 5).
- Questions must be natural search queries (how often, how much, which is better, is X worth it).
- Answers must be self-contained plain text (no HTML tags).
- Do not duplicate FAQ text inside "content".`;

  try {
    const text = await generateText(prompt);

    let blogData: {
      title: string;
      description: string;
      content: string;
      faqs?: unknown;
    };
    try {
      blogData = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blogData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON from AI response");
      }
    }

    if (!blogData.title || !blogData.description || !blogData.content) {
      throw new Error(
        "AI response missing required fields (title, description, content)"
      );
    }

    const faqs = normalizeBlogFaqsInput(blogData.faqs);
    if (faqs.length < 3) {
      throw new Error(
        "AI response must include at least 3 FAQs in the faqs array"
      );
    }

    if (
      isTooGenericTitle(blogData.title, primaryKeyword) ||
      isTooGenericDescription(blogData.description)
    ) {
      throw new Error(
        "Generated title or meta description was too generic; retry automation"
      );
    }

    return {
      title: sanitizeEmDash(blogData.title.trim()),
      description: sanitizeEmDash(blogData.description.trim()),
      content: sanitizeEmDash(blogData.content.trim()),
      faqs: faqs.slice(0, 5).map((faq) => ({
        question: sanitizeEmDash(faq.question),
        answer: sanitizeEmDash(faq.answer),
      })),
    };
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
  const productKnowledge = getProductKnowledgeBase();
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());
  const userBrief = options?.userBrief?.trim();
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
  const primaryKeyword = options?.focusedKeywords?.[0]?.trim();

  const prompt = `You are an expert writer for Taypro, a solar panel cleaning robot company. Write a detailed project case study page for: ${topic}

${editorial}
${briefBlock}
${focusedKeywordBlock}
CRITICAL: Product/Service Information Accuracy
- ONLY use verified Taypro product information from this knowledge base:

${productKnowledge}

- DO NOT invent model numbers, client names, or unverified performance claims.

${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}
${PROJECT_CASE_STUDY_RULES}
- Use this working title unless you can improve it with specific location/capacity: "${topic}"
- The JSON "title" should include capacity or location when the brief provides them (e.g. "Agar, Madhya Pradesh – 250 MW").

Format "content" as clean HTML with <p>, <h2>, <h3>, <ul>, <ol>.

Return ONLY valid JSON:
{
  "title": "Project title with location and/or MW (SEO-friendly)",
  "description": "Meta description (140-160 characters, specific outcome)",
  "details": ["250 MW", "Madhya Pradesh", "Automatic cleaning", "Utility-scale"],
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

    const details = normalizeProjectDetails(projectData.details);
    if (details.length < 3) {
      throw new Error(
        "AI response must include at least 3 overview details in the details array"
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
