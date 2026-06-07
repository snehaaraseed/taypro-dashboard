import "server-only";

import type { TayproLocale } from "@/i18n/markets";
import {
  getTranslationContentChunkChars,
  localeDisplayName,
} from "./config";
import { generateTranslationJson } from "./gemini-call";
import {
  maskMediaInHtml,
  repairTranslatedBlogHtml,
  unmaskMediaInHtml,
} from "./preserve-html";
import type { BlogFaqItem } from "@/lib/cms/blog-faqs";
import { PUNCTUATION_RULES, sanitizeEmDash } from "@/lib/seo/content-quality";

export type TranslatableFields = {
  title: string;
  description: string;
  content: string;
  featuredImageAlt?: string;
  imageAlt?: string;
};

export type TranslatedFields = TranslatableFields;

const BRAND_RULES =
  "Keep brand names (Taypro, GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, NECTYR, TÜV NORD) and standard units (MW, kWh) unless a well-known localized form exists.";

function splitMaskedHtmlForTranslation(html: string, maxChunkSize: number): string[] {
  if (html.length <= maxChunkSize) return [html];

  const chunks: string[] = [];
  let start = 0;

  while (start < html.length) {
    let end = Math.min(start + maxChunkSize, html.length);
    if (end < html.length) {
      const slice = html.slice(start, end);
      const breakTags = [...slice.matchAll(/<\/(?:p|section|h[1-6]|div|li|table|ul|ol)>/gi)];
      const last = breakTags[breakTags.length - 1];
      if (last?.index !== undefined && last.index > maxChunkSize * 0.4) {
        end = start + last.index + last[0].length;
      }
    }
    chunks.push(html.slice(start, end));
    start = end;
  }

  return chunks;
}

async function translateMetadataFields(
  source: Pick<
    TranslatableFields,
    "title" | "description" | "featuredImageAlt" | "imageAlt"
  >,
  targetLocale: TayproLocale
): Promise<{
  title: string;
  description: string;
  featuredImageAlt?: string;
  imageAlt?: string;
}> {
  const language = localeDisplayName(targetLocale);
  const altKeys: string[] = [];
  if (source.featuredImageAlt !== undefined) altKeys.push("featuredImageAlt");
  if (source.imageAlt !== undefined) altKeys.push("imageAlt");

  const prompt = `You are an expert B2B translator for the solar energy and solar panel cleaning robot industry (Taypro).

Translate the following metadata from English to ${language} (locale code: ${targetLocale}).

STRICT RULES:
1. Return ONLY valid JSON with keys: title, description${altKeys.length ? `, ${altKeys.join(", ")}` : ""}.
2. ${BRAND_RULES}
3. Meta description: stay within ~160 characters where possible.
4. Do NOT include HTML body content — metadata only.
${PUNCTUATION_RULES}

Source JSON:
${JSON.stringify({
    title: source.title,
    description: source.description,
    ...(source.featuredImageAlt !== undefined
      ? { featuredImageAlt: source.featuredImageAlt }
      : {}),
    ...(source.imageAlt !== undefined ? { imageAlt: source.imageAlt } : {}),
  })}`;

  const parsed = await generateTranslationJson<{
    title: string;
    description: string;
    featuredImageAlt?: string;
    imageAlt?: string;
  }>(prompt);

  if (!parsed.title?.trim() || !parsed.description?.trim()) {
    throw new Error(`Incomplete metadata translation for locale ${targetLocale}`);
  }

  return {
    title: sanitizeEmDash(parsed.title.trim()),
    description: sanitizeEmDash(parsed.description.trim()),
    featuredImageAlt: parsed.featuredImageAlt
      ? sanitizeEmDash(parsed.featuredImageAlt.trim())
      : undefined,
    imageAlt: parsed.imageAlt ? sanitizeEmDash(parsed.imageAlt.trim()) : undefined,
  };
}

async function translateContentFragment(
  maskedFragment: string,
  targetLocale: TayproLocale,
  chunkIndex: number,
  chunkCount: number
): Promise<string> {
  const language = localeDisplayName(targetLocale);
  const chunkNote =
    chunkCount > 1
      ? `\n8. This is HTML fragment ${chunkIndex + 1} of ${chunkCount}. Translate the FULL fragment — do not summarize.`
      : "\n8. Output length should be similar to the English source.";

  const prompt = `You are an expert B2B translator for the solar energy and solar panel cleaning robot industry (Taypro).

Translate ONLY the HTML body fragment from English to ${language} (locale code: ${targetLocale}).

STRICT RULES:
1. Return ONLY valid JSON with a single key: "content".
2. Preserve EVERY media placeholder exactly as written (e.g. ⟦M0⟧, ⟦M1⟧). Do NOT remove, translate, or renumber them.
3. Preserve all HTML tags and attribute names. Only translate human-readable text nodes.
4. Do NOT change URLs, file paths, image src values, email addresses, or HTML attributes inside placeholders.
5. ${BRAND_RULES}
6. Use professional, natural ${language} suitable for utility-scale solar plant operators.
7. Preserve every <a href="/..."> internal link from the source (same href paths; translate anchor text only).${chunkNote}
${PUNCTUATION_RULES}

Source JSON:
${JSON.stringify({ content: maskedFragment })}`;

  const parsed = await generateTranslationJson<{ content: string }>(prompt);
  if (!parsed.content?.trim()) {
    throw new Error(
      `Incomplete content translation for locale ${targetLocale} (chunk ${chunkIndex + 1}/${chunkCount})`
    );
  }
  return sanitizeEmDash(parsed.content.trim());
}

async function translateContentField(
  masked: string,
  fragments: Map<string, string>,
  sourceContent: string,
  targetLocale: TayproLocale
): Promise<string> {
  const chunks = splitMaskedHtmlForTranslation(
    masked,
    getTranslationContentChunkChars()
  );
  const translatedParts: string[] = [];

  for (let i = 0; i < chunks.length; i += 1) {
    translatedParts.push(
      await translateContentFragment(chunks[i], targetLocale, i, chunks.length)
    );
  }

  let content = translatedParts.join("");
  content = unmaskMediaInHtml(content, fragments);
  content = repairTranslatedBlogHtml(sourceContent, content);
  return content;
}

/**
 * Translate CMS fields via Gemini while preserving masked media placeholders in HTML.
 * Metadata and body are separate API calls; large bodies are chunked.
 */
export async function translateFieldsWithGemini(
  source: TranslatableFields,
  targetLocale: TayproLocale
): Promise<TranslatedFields> {
  const { masked, fragments } = maskMediaInHtml(source.content);
  const metadata = await translateMetadataFields(source, targetLocale);
  const content = await translateContentField(
    masked,
    fragments,
    source.content,
    targetLocale
  );

  return {
    title: metadata.title,
    description: metadata.description,
    content,
    featuredImageAlt: metadata.featuredImageAlt,
    imageAlt: metadata.imageAlt,
  };
}

/** Translate a JSON array of short strings (e.g. project detail bullets). */
export async function translateStringListWithGemini(
  items: string[],
  targetLocale: TayproLocale
): Promise<string[]> {
  if (!items.length) return [];

  const language = localeDisplayName(targetLocale);
  const prompt = `Translate each string in this JSON array from English to ${language} (${targetLocale}).
Return ONLY a JSON array of strings with the same length and order. Keep numbers and units accurate.
${PUNCTUATION_RULES}

${JSON.stringify(items)}`;

  const parsed = await generateTranslationJson<string[]>(prompt);
  if (!Array.isArray(parsed) || parsed.length !== items.length) {
    throw new Error(`Project details translation length mismatch for ${targetLocale}`);
  }

  return parsed.map((s) => sanitizeEmDash(String(s).trim()));
}

/** Translate blog FAQ question/answer pairs. */
export async function translateBlogFaqsWithGemini(
  faqs: BlogFaqItem[],
  targetLocale: TayproLocale
): Promise<BlogFaqItem[]> {
  if (!faqs.length) return [];

  const language = localeDisplayName(targetLocale);
  const prompt = `Translate each FAQ object in this JSON array from English to ${language} (${targetLocale}).
Return ONLY a JSON array of objects with keys "question" and "answer", same length and order.
${BRAND_RULES}
Use professional ${language} for utility-scale solar plant operators.
${PUNCTUATION_RULES}

${JSON.stringify(faqs)}`;

  const parsed = await generateTranslationJson<BlogFaqItem[]>(prompt);
  if (!Array.isArray(parsed) || parsed.length !== faqs.length) {
    throw new Error(`FAQ translation length mismatch for ${targetLocale}`);
  }

  return parsed.map((item, i) => ({
    question: sanitizeEmDash(String(item?.question ?? faqs[i].question).trim()),
    answer: sanitizeEmDash(String(item?.answer ?? faqs[i].answer).trim()),
  }));
}
