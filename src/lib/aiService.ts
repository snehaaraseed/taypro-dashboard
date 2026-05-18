import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomCategory } from "./topicCategories";
import { getProductKnowledgeBase } from "./productKnowledge";
import { createSlug } from "@/app/utils/blogFileUtils";
import {
  ANTI_GENERIC_WRITING_RULES,
  LONG_FORM_CONTENT_RULES,
  SEO_AND_READER_RULES,
  isTooGenericDescription,
  isTooGenericTitle,
} from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import {
  buildFallbackTopicTitle,
  formatSeoPromptBlock,
  pickSeoKeywordBrief,
  type SeoKeywordBrief,
} from "@/lib/seo/keyword-stats";
import { isTopicPublished } from "./topicTracker";

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
    throw new Error("GEMINI_API_KEY is not set — add it to run AI features.");
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
  editorialContext?: string
): Promise<GeneratedTopic> {
  const productKnowledge = getProductKnowledgeBase();
  const seoBrief = await pickSeoKeywordBrief();
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const category = getRandomCategory();
    const seoBlock = seoBrief
      ? `\n${formatSeoPromptBlock(seoBrief)}\n- At least 3 of the 5 titles MUST include the exact phrase "${seoBrief.primary}" or a word-order variant.\n`
      : "";

    const prompt = `You are a content strategist for a solar panel cleaning robot company called Taypro.

${editorial}

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

${ANTI_GENERIC_WRITING_RULES}
${SEO_AND_READER_RULES}

${productKnowledge}

IMPORTANT: 
- Only reference Taypro products if the topic naturally calls for it
- Use ONLY verified information from the knowledge base above
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
            title: topicTitle.trim(),
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
        title: fallbackTitle,
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
export async function generateBlogContent(
  topic: string,
  _category: string,
  seoBrief?: SeoKeywordBrief | null,
  editorialContext?: string
): Promise<{
  title: string;
  description: string;
  content: string;
}> {
  const productKnowledge = getProductKnowledgeBase();
  const seoBlock = seoBrief ? `\n${formatSeoPromptBlock(seoBrief)}\n` : "";
  const editorial =
    editorialContext ?? (await formatEditorialContextPrompt());

  const prompt = `You are an expert content writer specializing in solar panel cleaning robots and solar power plant operations & maintenance. Write a comprehensive, SEO-optimized blog post about: ${topic}

${editorial}
${seoBlock}
CRITICAL: Product/Service Information Accuracy
- ONLY use the following verified information about Taypro products/services. DO NOT invent or hallucinate any features, specifications, or capabilities.
- If you need to mention Taypro products, refer ONLY to this knowledge base:

${productKnowledge}

- DO NOT make up specifications, features, or capabilities
- DO NOT invent model numbers or product names
- If unsure about a product detail, either omit it or state it generically
- Always verify any technical claims against the knowledge base

Requirements:
${ANTI_GENERIC_WRITING_RULES}
${SEO_AND_READER_RULES}
${LONG_FORM_CONTENT_RULES}
- Use this exact working title unless you can improve it without making it vaguer: "${topic}"
- The JSON "title" field should match or tightly paraphrase that line (must stay specific)
- Word count: 2,800-3,200 words (minimum 2,600; do not pad with filler)
- Natural, conversational tone (avoid AI-sounding language)
- Factual, accurate information about solar panel cleaning and solar plant O&M
- Include relevant statistics and data points (use industry-standard ranges, not specific unverified numbers)
- Use headings (H2, H3) for structure
- Include bullet points and examples
- Natural keyword integration (use the SEO target above when provided; also solar plant maintenance, solar O&M, etc.)
- Good readability (aim for Flesch Reading Ease 60+)
- Original content (do not copy from other sources)
- Include practical tips and actionable insights
- Cover overall solar power plant operations and maintenance when relevant
- Reference Taypro's solutions naturally where relevant, but ONLY use verified information
- Include 3–5 internal links to Taypro pillar paths listed in the editorial strategy (use relative hrefs like href="/solar-panel-cleaning-system")

Format the output as clean HTML with proper paragraph tags (<p>), headings (<h2>, <h3>), and lists (<ul>, <ol>).

Return the response in the following JSON format:
{
  "title": "Blog post title (SEO-optimized, 50-60 characters)",
  "description": "Meta description (150-160 characters, SEO-optimized)",
  "content": "<p>Full HTML content here...</p>"
}`;

  try {
    const text = await generateText(prompt);

    let blogData: { title: string; description: string; content: string };
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

    if (
      isTooGenericTitle(blogData.title, seoBrief?.primary) ||
      isTooGenericDescription(blogData.description)
    ) {
      throw new Error(
        "Generated title or meta description was too generic; retry automation"
      );
    }

    return {
      title: blogData.title.trim(),
      description: blogData.description.trim(),
      content: blogData.content.trim(),
    };
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate blog content"
    );
  }
}
