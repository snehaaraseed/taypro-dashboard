import "server-only";

import {
  keywordFallbackImage,
  selectCandidatePoolForGemini,
} from "@/lib/seo/blog-image-catalog";
import type { BlogFeaturedImagePick } from "@/lib/seo/blog-image-types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  DEFAULT_FREE_GEMINI_TEXT_MODEL,
  resolveFreeGeminiTextModel,
} from "@/lib/gemini/free-tier-models";

const PICKER_MODEL =
  resolveFreeGeminiTextModel(
    process.env.GEMINI_BLOG_MODEL?.trim(),
    DEFAULT_FREE_GEMINI_TEXT_MODEL
  );

export type BlogInlineImage = {
  url: string;
  alt: string;
  source: string;
};

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

function buildFigureHtml(image: BlogInlineImage): string {
  const alt = image.alt.replace(/"/g, "&quot;");
  return `<figure class="blog-inline-figure my-8"><img src="${image.url}" alt="${alt}" loading="lazy" class="w-full rounded-lg" width="1024" height="576" /><figcaption class="text-sm text-gray-600 mt-2 text-center">${alt}</figcaption></figure>`;
}

/** Insert a figure after the Nth &lt;h2&gt; (or after first &lt;p&gt; if no headings). */
export function insertInlineFigureInContent(
  html: string,
  image: BlogInlineImage,
  options?: { afterH2Index?: number }
): string {
  if (!html.trim() || /<img\s/i.test(html)) {
    return html;
  }

  const figure = buildFigureHtml(image);
  const h2Matches = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) ?? [];
  const preferred = options?.afterH2Index ?? 2;
  const targetH2 = h2Matches.length >= preferred ? preferred : h2Matches.length;

  if (targetH2 > 0) {
    let count = 0;
    const updated = html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, (match) => {
      count += 1;
      if (count === targetH2) {
        return `${match}${figure}`;
      }
      return match;
    });
    if (updated !== html) {
      return updated;
    }
  }

  const firstParagraphEnd = html.search(/<\/p>/i);
  if (firstParagraphEnd !== -1) {
    const insertAt = firstParagraphEnd + 4;
    return `${html.slice(0, insertAt)}${figure}${html.slice(insertAt)}`;
  }

  return `${figure}${html}`;
}

async function pickInlineWithGemini(
  title: string,
  description: string,
  seoKeyword: string,
  pool: Awaited<ReturnType<typeof selectCandidatePoolForGemini>>,
  excludeUrls: string[]
): Promise<BlogInlineImage | null> {
  if (pool.length === 0) return null;

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: PICKER_MODEL });
  const excludeNote =
    excludeUrls.length > 0
      ? `\nDo NOT use these URLs (already used as hero): ${excludeUrls.join(", ")}`
      : "";

  const list = pool
    .map((c, i) => `${i + 1}. [${c.source}] ${c.url}\n   ${c.label}`)
    .join("\n");

  const prompt = `Select ONE image for an inline illustration inside a Taypro blog article (utility-scale solar, India).
This is NOT the hero image, pick a complementary photo (robot detail, project site, plant context).
${excludeNote}

Article title: ${title}
SEO keyword: ${seoKeyword}
Context: ${description.slice(0, 200)}

Candidates:
${list}

Return ONLY JSON: {"url":"/path/from/list","alt":"80-160 char alt, describes the photo"}`;

  let text: string;
  try {
    const result = await model.generateContent(prompt);
    text = result.response.text().trim();
  } finally {
    await pauseAfterGeminiCall();
  }
  const urls = new Set(pool.map((c) => c.url));
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as {
      url?: string;
      alt?: string;
    };
    const url = parsed.url?.trim();
    const alt = parsed.alt?.trim();
    if (url && urls.has(url) && alt && alt.length >= 20) {
      const candidate = pool.find((c) => c.url === url);
      return {
        url,
        alt,
        source: candidate ? `${candidate.source} (inline gemini)` : "inline gemini",
      };
    }
  } catch {
    // fall through
  }
  return null;
}

async function pickLibraryInlineImage(
  input: {
    title: string;
    description: string;
    seoKeyword: string;
  },
  excludeUrls: string[]
): Promise<BlogInlineImage | null> {
  const seoKeyword = input.seoKeyword.trim() || "solar panel cleaning robot";
  const all = await selectCandidatePoolForGemini(input.title, seoKeyword);
  const pool = all.filter((c) => !excludeUrls.includes(c.url));
  if (pool.length === 0) return null;

  try {
    const geminiPick = await pickInlineWithGemini(
      input.title,
      input.description,
      seoKeyword,
      pool,
      excludeUrls
    );
    if (geminiPick) return geminiPick;
  } catch (error) {
    console.warn("Inline image Gemini pick failed:", error);
  }

  const fallback = keywordFallbackImage(seoKeyword, pool);
  if (fallback) {
    return {
      url: fallback.url,
      alt: `${input.title.replace(/\s+/g, " ").trim()}, ${fallback.label} at a utility-scale solar site in India`,
      source: `${fallback.source} (inline keyword fallback)`,
    };
  }

  if (pool[0]) {
    return {
      url: pool[0].url,
      alt: `${input.title}, Taypro solar plant operations in India`,
      source: `${pool[0].source} (inline pool fallback)`,
    };
  }

  return null;
}

/**
 * Pick one inline body image (library for product posts; library or generated for O&M).
 */
export async function pickBlogInlineImage(input: {
  title: string;
  description: string;
  seoKeyword?: string;
  category?: string;
  excludeUrls?: string[];
  featured: BlogFeaturedImagePick;
}): Promise<BlogInlineImage | null> {
  if (process.env.BLOG_INLINE_IMAGES === "false") {
    return null;
  }

  const seoKeyword = input.seoKeyword?.trim() || "solar panel cleaning robot";
  const excludeUrls = [
    ...(input.excludeUrls ?? []),
    input.featured.url,
  ].filter(Boolean);

  return pickLibraryInlineImage(
    {
      title: input.title,
      description: input.description,
      seoKeyword,
    },
    excludeUrls
  );
}

/**
 * Add one relevant inline image to blog HTML (after 2nd H2 when possible).
 */
export async function enrichBlogContentWithInlineImages(input: {
  content: string;
  title: string;
  description: string;
  seoKeyword?: string;
  category?: string;
  featured: BlogFeaturedImagePick;
}): Promise<{ content: string; inlineImage?: BlogInlineImage }> {
  const inline = await pickBlogInlineImage({
    title: input.title,
    description: input.description,
    seoKeyword: input.seoKeyword,
    category: input.category,
    featured: input.featured,
  });

  if (!inline) {
    return { content: input.content };
  }

  return {
    content: insertInlineFigureInContent(input.content, inline),
    inlineImage: inline,
  };
}
