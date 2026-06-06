import "server-only";

import type { BlogFaqItem } from "@/lib/cms/blog-faqs";
import { isComparisonSearchIntent } from "@/lib/seo/keyword-stats";
import { extractH2Headings, stripHtmlToPlainText } from "@/lib/seo/blog-similarity";

export class BlogContentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      `Blog structure validation failed: ${issues.slice(0, 6).join("; ")}${issues.length > 6 ? ` (+${issues.length - 6} more)` : ""}`
    );
    this.name = "BlogContentValidationError";
    this.issues = issues;
  }
}

export type BlogContentValidationInput = {
  title: string;
  description: string;
  content: string;
  faqs: BlogFaqItem[];
  primaryKeyword?: string;
  searchIntent?: string;
};

export type BlogContentValidationResult =
  | { ok: true }
  | { ok: false; issues: string[] };

const QUICK_ANSWER_H2 =
  /quick answer|summary for plant managers/i;
const FAQ_HEADING_IN_BODY = /frequently asked questions/i;
const QUESTION_H2 =
  /\b(how|what|which|when|why|is|are|can|should|does|do|worth)\b/i;

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getBlogMinWordCount(): number {
  return envInt("BLOG_MIN_WORD_COUNT", 2000);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function extractQuickAnswerSection(html: string): string {
  const re =
    /<h2[^>]*>[\s\S]*?(?:quick answer|summary for plant managers)[\s\S]*?<\/h2>([\s\S]*?)(?=<h2|$)/i;
  const match = html.match(re);
  return match?.[1]?.trim() ?? "";
}

function quickAnswerBulletCount(html: string): number {
  const section = extractQuickAnswerSection(html);
  if (!section) return 0;
  const lis = section.match(/<li[^>]*>/gi);
  return lis?.length ?? 0;
}

function firstParagraphsPlain(html: string, maxChars: number): string {
  const paragraphs: string[] = [];
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const plain = stripHtmlToPlainText(match[1]);
    if (plain.length > 20) paragraphs.push(plain);
    if (paragraphs.join(" ").length >= maxChars) break;
  }
  return paragraphs.join(" ").slice(0, maxChars);
}

function significantTokens(text: string): Set<string> {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "for",
    "to",
    "in",
    "on",
    "of",
    "is",
    "are",
    "your",
    "you",
    "with",
    "at",
    "by",
    "from",
    "that",
    "this",
    "it",
    "as",
    "be",
    "can",
    "how",
    "what",
    "when",
    "which",
    "why",
    "solar",
    "panel",
    "panels",
    "plant",
    "plants",
    "india",
    "indian",
  ]);
  const tokens = new Set<string>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9%]+/)) {
    const t = raw.trim();
    if (t.length < 3 || stop.has(t)) continue;
    tokens.add(t);
  }
  return tokens;
}

function tokenOverlap(a: string, b: string): number {
  const setA = significantTokens(a);
  const setB = significantTokens(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const t of setA) {
    if (setB.has(t)) shared += 1;
  }
  return shared / Math.min(setA.size, setB.size);
}

function keywordInText(text: string, keyword: string): boolean {
  const lower = text.toLowerCase();
  const kw = keyword.toLowerCase().trim();
  if (!kw) return true;
  if (lower.includes(kw)) return true;
  const words = kw.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const matched = words.filter((w) => lower.includes(w)).length;
  return matched >= Math.min(2, words.length);
}

function faqQuestionReflectsKeyword(question: string, keyword: string): boolean {
  const q = question.toLowerCase();
  const kw = keyword.toLowerCase().trim();
  if (!kw) return true;
  if (q.includes(kw)) return true;
  const words = kw.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const matched = words.filter((w) => q.includes(w)).length;
  return matched >= Math.max(2, Math.ceil(words.length * 0.5));
}

function hasComparisonTable(html: string): boolean {
  return /<table[\s>]/i.test(html) && /<thead[\s>]/i.test(html);
}

function openingAnswersTitle(title: string, content: string): boolean {
  const titleTokens = significantTokens(title);
  const opening = firstParagraphsPlain(content, 600);
  const openingTokens = significantTokens(opening);
  if (titleTokens.size === 0 || openingTokens.size === 0) return false;
  let hit = 0;
  for (const t of titleTokens) {
    if (openingTokens.has(t)) hit += 1;
  }
  return hit >= Math.min(2, Math.max(1, Math.ceil(titleTokens.size * 0.2)));
}

/**
 * Structural SEO / AI-overview checks beyond generic title/meta filters.
 */
export function validateGeneratedBlog(
  input: BlogContentValidationInput
): BlogContentValidationResult {
  const issues: string[] = [];
  const plain = stripHtmlToPlainText(input.content);
  const wordCount = countWords(plain);
  const minWords = getBlogMinWordCount();

  if (wordCount < minWords) {
    issues.push(`Body too short (${wordCount} words; need ≥${minWords})`);
  }

  const titleLen = input.title.trim().length;
  if (titleLen < 35 || titleLen > 72) {
    issues.push(`Title length ${titleLen} chars (target 50–60, allow 35–72)`);
  }

  const descLen = input.description.trim().length;
  if (descLen < 120 || descLen > 170) {
    issues.push(`Meta description ${descLen} chars (target 150–160, allow 120–170)`);
  }

  const h2s = extractH2Headings(input.content);
  if (h2s.length < 6) {
    issues.push(`Need ≥6 H2 sections (found ${h2s.length})`);
  }

  if (!h2s.some((h) => QUICK_ANSWER_H2.test(h))) {
    issues.push('Missing H2 "Quick answer" or "Summary for plant managers"');
  }

  const bullets = quickAnswerBulletCount(input.content);
  if (bullets < 3 || bullets > 6) {
    issues.push(`Quick answer needs 3–5 bullets (found ${bullets} <li> items)`);
  }

  if (!h2s.some((h) => QUESTION_H2.test(h) && !QUICK_ANSWER_H2.test(h))) {
    issues.push("Missing People Also Ask style H2 (how/what/which/is/worth…)");
  }

  if (FAQ_HEADING_IN_BODY.test(input.content)) {
    issues.push('Remove "Frequently asked questions" heading from HTML body');
  }

  const primary = input.primaryKeyword?.trim();
  if (primary) {
    const first100 = plain.slice(0, 600);
    if (!keywordInText(first100, primary)) {
      issues.push(`Primary keyword "${primary}" missing from opening ~100 words`);
    }
  }

  if (
    input.searchIntent &&
    isComparisonSearchIntent(input.searchIntent) &&
    !hasComparisonTable(input.content)
  ) {
    issues.push("Comparison intent requires HTML <table> with <thead>");
  }

  if (input.faqs.length < 4) {
    issues.push(`Need 4 FAQs in JSON (found ${input.faqs.length})`);
  }

  if (primary && input.faqs[0] && !faqQuestionReflectsKeyword(input.faqs[0].question, primary)) {
    issues.push("faqs[0] question must include the primary SEO keyword");
  }

  const quickSection = stripHtmlToPlainText(extractQuickAnswerSection(input.content));
  const faq0Answer = input.faqs[0]?.answer ?? "";
  if (quickSection && faq0Answer) {
    const overlap = tokenOverlap(quickSection, faq0Answer);
    if (overlap < 0.12) {
      issues.push("faqs[0] answer must align with Quick answer section facts");
    }
  }

  if (!openingAnswersTitle(input.title, input.content)) {
    issues.push("Opening paragraphs should directly address the title topic");
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true };
}

export function assertGeneratedBlogValid(
  input: BlogContentValidationInput
): void {
  const result = validateGeneratedBlog(input);
  if (!result.ok) {
    throw new BlogContentValidationError(result.issues);
  }
}

/** Sync faqs[0] answer from Quick answer H2 when auto-repair changed the question. */
export function alignFirstFaqWithQuickAnswer(
  content: string,
  faqs: BlogFaqItem[]
): BlogFaqItem[] {
  if (faqs.length === 0) return faqs;
  const quickSection = stripHtmlToPlainText(extractQuickAnswerSection(content));
  if (!quickSection || quickSection.length < 40) return faqs;

  const sentences =
    quickSection.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()).filter(Boolean) ??
    [];
  const answer = (sentences.slice(0, 2).join(" ") || quickSection)
    .trim()
    .slice(0, 420);
  if (!answer) return faqs;

  return [{ ...faqs[0], answer }, ...faqs.slice(1)];
}

export type TranslationValidationInput = {
  sourceTitle: string;
  sourceDescription: string;
  sourceContent: string;
  sourceFaqs: BlogFaqItem[];
  translatedTitle: string;
  translatedDescription: string;
  translatedContent: string;
  translatedFaqs: BlogFaqItem[];
};

export function validateTranslatedBlog(
  input: TranslationValidationInput
): BlogContentValidationResult {
  const issues: string[] = [];
  const srcWords = countWords(stripHtmlToPlainText(input.sourceContent));
  const trWords = countWords(stripHtmlToPlainText(input.translatedContent));
  const minRatio = 0.45;

  if (!input.translatedTitle.trim()) issues.push("Translated title is empty");
  if (!input.translatedDescription.trim()) {
    issues.push("Translated description is empty");
  }
  if (srcWords > 0 && trWords / srcWords < minRatio) {
    issues.push(
      `Translated body too short (${trWords} vs ${srcWords} words; need ≥${Math.round(minRatio * 100)}% of source)`
    );
  }

  if (input.sourceFaqs.length > 0) {
    if (input.translatedFaqs.length !== input.sourceFaqs.length) {
      issues.push(
        `FAQ count mismatch (${input.translatedFaqs.length} vs ${input.sourceFaqs.length})`
      );
    }
    const placeholderRe = /⟦M\d+⟧/g;
    const srcPlaceholders = input.sourceContent.match(placeholderRe)?.length ?? 0;
    const trPlaceholders = input.translatedContent.match(placeholderRe)?.length ?? 0;
    if (srcPlaceholders > 0 && trPlaceholders !== srcPlaceholders) {
      issues.push("Translated content lost media placeholders");
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true };
}

export function assertTranslatedBlogValid(
  input: TranslationValidationInput
): void {
  const result = validateTranslatedBlog(input);
  if (!result.ok) {
    throw new BlogContentValidationError(result.issues);
  }
}
