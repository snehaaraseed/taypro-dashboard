import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TayproLocale } from "@/i18n/markets";
import { geminiTranslationModel, localeDisplayName } from "./config";
import { maskMediaInHtml, unmaskMediaInHtml } from "./preserve-html";
import type { BlogFaqItem } from "@/lib/cms/blog-faqs";
import { pauseAfterGeminiCall } from "@/lib/gemini/call-delay";
import {
  assertGeminiCallAllowed,
  recordGeminiCall,
} from "@/lib/gemini/daily-budget";
import { PUNCTUATION_RULES, sanitizeEmDash } from "@/lib/seo/content-quality";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type TranslatableFields = {
  title: string;
  description: string;
  content: string;
  featuredImageAlt?: string;
  imageAlt?: string;
};

export type TranslatedFields = TranslatableFields;

function parseJsonObject<T>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini response did not contain JSON");
    return JSON.parse(match[0]) as T;
  }
}

/**
 * Translate CMS fields via Gemini while preserving masked media placeholders in HTML.
 */
export async function translateFieldsWithGemini(
  source: TranslatableFields,
  targetLocale: TayproLocale
): Promise<TranslatedFields> {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const { masked, fragments } = maskMediaInHtml(source.content);
  const language = localeDisplayName(targetLocale);

  const model = genAI.getGenerativeModel({ model: geminiTranslationModel() });

  const prompt = `You are an expert B2B translator for the solar energy and solar panel cleaning robot industry (Taypro).

Translate the following content from English to ${language} (locale code: ${targetLocale}).

STRICT RULES:
1. Return ONLY valid JSON with keys: title, description, content${source.featuredImageAlt !== undefined ? ", featuredImageAlt" : ""}${source.imageAlt !== undefined ? ", imageAlt" : ""}.
2. In "content", preserve EVERY media placeholder exactly as written (e.g. ⟦M0⟧, ⟦M1⟧). Do NOT remove, translate, or renumber them.
3. Preserve all HTML tags and attribute names in "content". Only translate human-readable text nodes.
4. Do NOT change URLs, file paths, image src values, email addresses, or HTML attributes inside placeholders.
5. Keep brand names (Taypro, GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, NECTYR, TÜV NORD) and standard units (MW, kWh) unless a well-known localized form exists.
6. Use professional, natural ${language} suitable for utility-scale solar plant operators.
7. Meta description: stay within ~160 characters where possible.
${PUNCTUATION_RULES}

Source JSON:
${JSON.stringify({
    title: source.title,
    description: source.description,
    content: masked,
    ...(source.featuredImageAlt !== undefined
      ? { featuredImageAlt: source.featuredImageAlt }
      : {}),
    ...(source.imageAlt !== undefined ? { imageAlt: source.imageAlt } : {}),
  })}`;

  let raw: string;
  try {
    assertGeminiCallAllowed("translation");
    const result = await model.generateContent(prompt);
    raw = result.response.text();
  } finally {
    recordGeminiCall("translation");
    await pauseAfterGeminiCall();
  }
  const parsed = parseJsonObject<TranslatedFields>(raw);

  if (!parsed.title?.trim() || !parsed.description?.trim() || !parsed.content?.trim()) {
    throw new Error(`Incomplete translation for locale ${targetLocale}`);
  }

  parsed.content = unmaskMediaInHtml(parsed.content, fragments);

  return {
    title: sanitizeEmDash(parsed.title.trim()),
    description: sanitizeEmDash(parsed.description.trim()),
    content: sanitizeEmDash(parsed.content.trim()),
    featuredImageAlt: parsed.featuredImageAlt
      ? sanitizeEmDash(parsed.featuredImageAlt.trim())
      : undefined,
    imageAlt: parsed.imageAlt ? sanitizeEmDash(parsed.imageAlt.trim()) : undefined,
  };
}

/** Translate a JSON array of short strings (e.g. project detail bullets). */
export async function translateStringListWithGemini(
  items: string[],
  targetLocale: TayproLocale
): Promise<string[]> {
  if (!items.length) return [];
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: geminiTranslationModel() });
  const language = localeDisplayName(targetLocale);

  const prompt = `Translate each string in this JSON array from English to ${language} (${targetLocale}).
Return ONLY a JSON array of strings with the same length and order. Keep numbers and units accurate.
${PUNCTUATION_RULES}

${JSON.stringify(items)}`;

  let responseText: string;
  try {
    assertGeminiCallAllowed("translation");
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } finally {
    recordGeminiCall("translation");
    await pauseAfterGeminiCall();
  }
  const parsed = parseJsonObject<string[]>(responseText);

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
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: geminiTranslationModel() });
  const language = localeDisplayName(targetLocale);

  const prompt = `Translate each FAQ object in this JSON array from English to ${language} (${targetLocale}).
Return ONLY a JSON array of objects with keys "question" and "answer", same length and order.
Keep brand names (Taypro, GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, NECTYR) unchanged unless a well-known localized form exists.
Use professional ${language} for utility-scale solar plant operators.
${PUNCTUATION_RULES}

${JSON.stringify(faqs)}`;

  let responseText: string;
  try {
    assertGeminiCallAllowed("translation");
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } finally {
    recordGeminiCall("translation");
    await pauseAfterGeminiCall();
  }
  const parsed = parseJsonObject<BlogFaqItem[]>(responseText);

  if (!Array.isArray(parsed) || parsed.length !== faqs.length) {
    throw new Error(`FAQ translation length mismatch for ${targetLocale}`);
  }

  return parsed.map((item, i) => ({
    question: sanitizeEmDash(String(item?.question ?? faqs[i].question).trim()),
    answer: sanitizeEmDash(String(item?.answer ?? faqs[i].answer).trim()),
  }));
}
