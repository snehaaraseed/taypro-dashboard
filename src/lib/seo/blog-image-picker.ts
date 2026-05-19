import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { OG_PRESETS } from "@/lib/seo/open-graph";
import {
  keywordFallbackImage,
  selectCandidatePoolForGemini,
  type BlogImageCandidate,
} from "@/lib/seo/blog-image-catalog";
import {
  generateBlogFeaturedImage,
  isImageGenerationError,
} from "@/lib/seo/blog-image-generate";
import {
  getBlogImageMode,
  shouldUseProductLibraryImage,
} from "@/lib/seo/blog-image-strategy";
import type { BlogFeaturedImagePick } from "@/lib/seo/blog-image-types";

export type { BlogFeaturedImagePick } from "@/lib/seo/blog-image-types";

const PICKER_MODEL =
  process.env.GEMINI_BLOG_MODEL?.trim() || "gemini-3.1-flash-lite";

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

function formatCandidateList(candidates: BlogImageCandidate[]): string {
  return candidates
    .map((c, i) => `${i + 1}. [${c.source}] ${c.url}\n   ${c.label}`)
    .join("\n");
}

function parsePickerResponse(
  text: string,
  pool: BlogImageCandidate[]
): Omit<BlogFeaturedImagePick, "mode"> | null {
  const urls = new Set(pool.map((c) => c.url));
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as {
      url?: string;
      alt?: string;
    };
    const url = parsed.url?.trim();
    const alt = parsed.alt?.trim();
    if (url && urls.has(url) && alt && alt.length >= 20 && alt.length <= 200) {
      const candidate = pool.find((c) => c.url === url);
      return {
        url,
        alt,
        source: candidate ? `${candidate.source} (gemini)` : "gemini",
      };
    }
  } catch {
    // fall through
  }
  return null;
}

async function pickWithGemini(
  title: string,
  description: string,
  seoKeyword: string,
  pool: BlogImageCandidate[]
): Promise<Omit<BlogFeaturedImagePick, "mode"> | null> {
  if (pool.length === 0) return null;

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: PICKER_MODEL });

  const prompt = `You are selecting a featured hero image for a Taypro blog post (utility-scale solar panel cleaning robots, India).

Blog title: ${title}
Meta description: ${description}
SEO keyword: ${seoKeyword || "solar panel cleaning robot"}

Choose ONE image from the list below that best matches the article topic for human readers and SEO.
Rules:
- Pick ONLY a url from the list (exact path).
- Prefer real Taypro robots, plants, projects, or product photos over generic stock.
- Match intent: brush comparison → robots/cleaning; GLYDE/NYUMA fixed-tilt → model A image; HELYX → model B image; GLYDE-X/NYUMA-X tracker → model T image; service/opex → opex; project/case → project image.
- Write alt text: specific, 80–160 chars, describes what is shown, includes topic naturally. No "image of" prefix.

Candidates:
${formatCandidateList(pool)}

Return ONLY JSON:
{"url":"/exact/path/from/list","alt":"Descriptive alt text"}`;

  const result = await model.generateContent(prompt);
  return parsePickerResponse(result.response.text().trim(), pool);
}

/**
 * Pick from product pages, assets, projects, uploads (Gemini-assisted).
 */
async function pickFromProductLibrary(input: {
  title: string;
  description: string;
  seoKeyword: string;
}): Promise<BlogFeaturedImagePick> {
  const pool = await selectCandidatePoolForGemini(
    input.title,
    input.seoKeyword
  );

  try {
    const geminiPick = await pickWithGemini(
      input.title,
      input.description,
      input.seoKeyword,
      pool
    );
    if (geminiPick) {
      return { ...geminiPick, mode: "library" };
    }
  } catch (error) {
    console.warn("Gemini image pick failed, using fallback:", error);
  }

  const fallback = keywordFallbackImage(input.seoKeyword, pool);
  if (fallback) {
    return {
      url: fallback.url,
      alt: buildAltFromBlog(input.title, input.seoKeyword, fallback.label),
      source: `${fallback.source} (keyword fallback)`,
      mode: "library",
    };
  }

  return {
    url: OG_PRESETS.blog.path,
    alt: OG_PRESETS.blog.alt,
    source: "preset default",
    mode: "library",
  };
}

/**
 * Hybrid featured image: Taypro library for product posts, AI generation for general O&M/educational posts.
 */
export async function pickBlogFeaturedImage(input: {
  title: string;
  description: string;
  seoKeyword?: string;
  category?: string;
}): Promise<BlogFeaturedImagePick> {
  const seoKeyword = input.seoKeyword?.trim() || "solar panel cleaning robot";
  const mode = getBlogImageMode();

  const useLibrary =
    mode === "library" ||
    (mode === "hybrid" &&
      shouldUseProductLibraryImage({
        title: input.title,
        description: input.description,
        seoKeyword,
        category: input.category,
      }));

  if (useLibrary) {
    return pickFromProductLibrary({
      title: input.title,
      description: input.description,
      seoKeyword,
    });
  }

  try {
    return await generateBlogFeaturedImage({
      title: input.title,
      description: input.description,
      seoKeyword,
    });
  } catch (error) {
    const label = isImageGenerationError(error)
      ? "Image API limit or billing"
      : "Image generation failed";
    console.warn(`${label}, falling back to product library:`, error);
    return pickFromProductLibrary({
      title: input.title,
      description: input.description,
      seoKeyword,
    });
  }
}

function buildAltFromBlog(
  title: string,
  seoKeyword: string,
  contextLabel: string
): string {
  const base = title.replace(/\s+/g, " ").trim();
  if (contextLabel.toLowerCase().includes("project")) {
    return `${base} — Taypro utility-scale solar cleaning robot deployment in India`;
  }
  if (/glyde-x|glyde x/i.test(contextLabel)) {
    return `${base} — Taypro GLYDE-X dual-pass tracker solar cleaning robot`;
  }
  if (/\bglyde\b/i.test(contextLabel)) {
    return `${base} — Taypro GLYDE automatic dual-pass solar cleaning robot`;
  }
  if (/nyuma-x|nyuma x/i.test(contextLabel)) {
    return `${base} — Taypro NYUMA-X PBT tracker solar cleaning robot`;
  }
  if (/\bnyuma\b/i.test(contextLabel)) {
    return `${base} — Taypro NYUMA automatic PBT solar cleaning robot`;
  }
  if (/helyx/i.test(contextLabel)) {
    return `${base} — Taypro HELYX semi-automatic solar cleaning robot`;
  }
  if (/tracker/i.test(contextLabel)) {
    return `${base} — Taypro solar cleaning robot on single-axis trackers`;
  }
  if (/opex|service/i.test(contextLabel)) {
    return `${base} — Taypro robotic solar panel cleaning service at a utility plant`;
  }
  return `${base} — ${seoKeyword} | Taypro solar cleaning robots`;
}
