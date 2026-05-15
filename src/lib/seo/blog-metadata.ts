import type { Metadata } from "next";
import { slugifyAuthorName } from "@/app/data/blogAuthors";

const PRIMARY_KEYWORD = "Solar Panel Cleaning Robot";

export function blogAuthorProfileUrl(
  siteUrl: string,
  authorName: string
): string {
  return `${siteUrl}/blog/author/${slugifyAuthorName(authorName || "Taypro Team")}`;
}

/** True when the post is clearly about robots, cleaning systems, or automation. */
export function isRobotCleaningTopic(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return (
    text.includes("robot") ||
    text.includes("cleaning robot") ||
    text.includes("panel cleaning") ||
    text.includes("cleaning system") ||
    text.includes("waterless") ||
    text.includes("autonomous clean")
  );
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
  if (isRobotCleaningTopic(postTitle, description)) return description;
  return `${description} Learn about ${PRIMARY_KEYWORD} technology and solutions.`;
}

export function blogPostOpenGraphTitle(postTitle: string): string {
  return `${postTitle} | Taypro Blog`;
}
