import type { Metadata } from "next";
import { slugifyAuthorName } from "@/app/data/blogAuthors";

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
  return { absolute };
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
