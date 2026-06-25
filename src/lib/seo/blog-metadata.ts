import type { Metadata } from "next";
import { slugifyAuthorName } from "@/app/data/blogAuthors";
import { trimSerpTitle } from "@/lib/seo/page-title";

const PRIMARY_KEYWORD = "Solar Panel Cleaning Robot";

export function blogAuthorProfileUrl(
  siteUrl: string,
  authorName: string,
  authorSlug?: string
): string {
  const slug =
    authorSlug ?? slugifyAuthorName(authorName || "Taypro Team");
  return `${siteUrl}/blog/author/${slug}`;
}

/**
 * True only when the post is primarily about Taypro-style cleaning robots /
 * robotic automation, not generic “solar panel cleaning” or ESG content.
 */
export function isRobotCleaningTopic(title: string, description: string): boolean {
  const t = title.toLowerCase();
  const text = `${title} ${description}`.toLowerCase();

  if (/\bcleaning robot(s)?\b/.test(text)) return true;
  if (/\bsolar (panel )?cleaning robot(s)?\b/.test(text)) return true;
  if (/\brobotic(s)?\b/.test(text) && /\b(solar|panel|clean)/.test(text)) return true;
  if (/\bwaterless\b/.test(text) && /\b(clean|robot|dry)\b/.test(text)) return true;
  if (
    /\b(automatic|semi-automatic|autonomous)\b/.test(text) &&
    /\b(robot|clean|waterless)\b/.test(text)
  ) {
    return true;
  }
  // “Robot” in the headline is a strong signal; body-only mentions stay generic.
  if (/\brobot(s)?\b/.test(t)) return true;

  return false;
}

/** Browser/SERP title; skips root layout `%s | Taypro` via `absolute`. */
export function blogPostMetadataTitle(
  postTitle: string,
  description: string
): Metadata["title"] {
  const base = `${postTitle} | Taypro Blog`;
  const absolute = isRobotCleaningTopic(postTitle, description)
    ? `${postTitle} · ${PRIMARY_KEYWORD} | Taypro Blog`
    : base;
  return {
    absolute: trimSerpTitle(absolute, { includeBrand: false }),
  };
}

export function blogPostMetadataDescription(
  postTitle: string,
  description: string
): string {
  return description.trim();
}

export function blogPostOpenGraphTitle(postTitle: string): string {
  return `${postTitle} | Taypro Blog`;
}

const TITLE_KEYWORD_STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "your",
  "how",
  "what",
  "when",
  "which",
  "why",
  "are",
  "you",
  "can",
  "should",
  "guide",
  "blog",
  "best",
  "top",
  "vs",
  "india",
]);

function extractTitleKeywordTokens(title: string): string[] {
  const tokens: string[] = [];
  const seen = new Set<string>();
  for (const raw of title.toLowerCase().split(/[^a-z0-9%]+/)) {
    const t = raw.trim();
    if (t.length < 2 || TITLE_KEYWORD_STOP.has(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    tokens.push(t);
    if (tokens.length >= 5) break;
  }
  return tokens;
}

/** Topic-aware meta keywords for blog post pages. */
export function buildBlogPostKeywords(input: {
  title: string;
  description: string;
  primaryKeyword?: string | null;
}): string[] {
  const keywords: string[] = [];
  const add = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (keywords.some((k) => k.toLowerCase() === lower)) return;
    keywords.push(trimmed);
  };

  const primary = input.primaryKeyword?.trim();
  if (primary) {
    add(primary);
  }

  for (const token of extractTitleKeywordTokens(input.title)) {
    add(token);
  }

  add("solar panel cleaning");
  if (isRobotCleaningTopic(input.title, input.description)) {
    add("solar panel cleaning robot");
  }
  add("Taypro");

  return keywords.slice(0, 12);
}

/** Prefer stored blog keyword, then automation topic, then GSC page queries. */
export function resolveBlogPrimaryKeyword(input: {
  seoKeyword?: string | null;
  publishedTopicKeyword?: string | null;
  gscKeywords?: string[];
}): string | null {
  return (
    input.seoKeyword?.trim() ||
    input.publishedTopicKeyword?.trim() ||
    input.gscKeywords?.[0]?.trim() ||
    null
  );
}
