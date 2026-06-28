/**
 * Internal link allowlists and counters for automated blog posts.
 * Prefer /blog/ cross-links; pillar money pages only when robot/O&M relevant.
 */
export const BLOG_PILLAR_LINK_PATHS = [
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-robot-price-calculator",
  "/solar-panel-cleaning-robot-price-india",
  "/cleaning-technology",
  "/compare/taypro-vs-solabot",
  "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
  "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
  "/compare/waterless-vs-water-based-solar-cleaning",
  "/solar-panel-cleaning-robot-rajasthan",
  "/solar-panel-cleaning-robot-gujarat",
  "/solar-panel-cleaning-robot-karnataka",
  "/solar-panel-cleaning-robot-maharashtra",
  "/solar-panel-cleaning-machine",
] as const;

/** @deprecated use MIN_INTERNAL_LINKS: kept for tests/docs */
export const MIN_PILLAR_INTERNAL_LINKS = 3;
export const MAX_PILLAR_INTERNAL_LINKS = 2;

export const MIN_INTERNAL_LINKS = 3;
export const MIN_BLOG_POST_LINKS = 2;
export const MAX_INTERNAL_LINKS = 8;

const PILLAR_PATH_SET = new Set<string>(BLOG_PILLAR_LINK_PATHS);
const BLOG_POST_PATH_RE = /^\/blog\/([^/?#]+)$/;

const GENERIC_ANCHORS = new Set([
  "here",
  "click here",
  "link",
  "read more",
  "learn more",
  "this page",
  "this post",
  "more",
  "page",
]);

export type BlogLinkCandidate = { slug: string; title: string };

function normalizeInternalHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return null;
  const withoutFragment = trimmed.split("#")[0] ?? trimmed;
  const normalized =
    withoutFragment.length > 1 && withoutFragment.endsWith("/")
      ? withoutFragment.slice(0, -1)
      : withoutFragment;
  return normalized;
}

function isPillarPath(path: string): boolean {
  return PILLAR_PATH_SET.has(path);
}

export function isInternalBlogPostPath(path: string): boolean {
  const match = path.match(BLOG_POST_PATH_RE);
  if (!match?.[1]) return false;
  const slug = match[1].toLowerCase();
  return slug !== "author" && slug !== "db";
}

export function isQualifyingInternalPath(path: string): boolean {
  return isInternalBlogPostPath(path) || isPillarPath(path);
}

/** Unique qualifying internal paths (pillar or /blog/slug). */
export function extractQualifyingInternalLinkPaths(html: string): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const normalized = normalizeInternalHref(match[1] ?? "");
    if (!normalized || !isQualifyingInternalPath(normalized) || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    paths.push(normalized);
  }
  return paths;
}

export function extractBlogPostLinkSlugs(html: string): string[] {
  return extractQualifyingInternalLinkPaths(html)
    .filter(isInternalBlogPostPath)
    .map((p) => p.slice("/blog/".length));
}

export function countQualifyingInternalLinks(html: string): number {
  return extractQualifyingInternalLinkPaths(html).length;
}

/** @deprecated use countQualifyingInternalLinks */
export function countPillarInternalLinks(html: string): number {
  return extractPillarInternalLinkPaths(html).length;
}

export function extractPillarInternalLinkPaths(html: string): string[] {
  return extractQualifyingInternalLinkPaths(html).filter(isPillarPath);
}

function stripAnchorText(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function findInternalLinkAnchorIssue(html: string): string | null {
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const normalized = normalizeInternalHref(match[1] ?? "");
    if (!normalized || !isQualifyingInternalPath(normalized)) continue;
    const anchor = stripAnchorText(match[2] ?? "");
    const lower = anchor.toLowerCase();
    if (anchor.length < 3) {
      return `Internal link to ${normalized} needs descriptive anchor text (found "${anchor || "(empty)"}")`;
    }
    if (GENERIC_ANCHORS.has(lower)) {
      return `Internal link to ${normalized} uses generic anchor "${anchor}"`;
    }
  }
  return null;
}

/** @deprecated use findInternalLinkAnchorIssue */
export function findPillarLinkAnchorIssue(html: string): string | null {
  return findInternalLinkAnchorIssue(html);
}

export function formatPillarLinkPathsForPrompt(): string {
  return BLOG_PILLAR_LINK_PATHS.map((p) => `  ${p}`).join("\n");
}

export function formatInternalLinkRulesForPrompt(input: {
  blogCandidates: BlogLinkCandidate[];
  robotPromotionRelevant: boolean;
}): string {
  const blogLines =
    input.blogCandidates.length > 0
      ? input.blogCandidates
          .slice(0, 6)
          .map((b) => `  /blog/${b.slug}, "${b.title}"`)
          .join("\n")
      : "  (link to other published /blog/ posts on related equipment or O&M topics when you know the slug)";

  const pillarBlock = input.robotPromotionRelevant
    ? `- Optional: up to ${MAX_PILLAR_INTERNAL_LINKS} links to Tier A pillar pages when comparing cleaning methods (not required on equipment-only posts):
${formatPillarLinkPathsForPrompt()}`
    : `- Do NOT link to product/calculator pillar pages unless the section is explicitly about panel cleaning methods; prefer /blog/ links.`;

  return `INTERNAL LINKS (validator enforced: ≥${MIN_INTERNAL_LINKS} total, including ≥${MIN_BLOG_POST_LINKS} links to other blog posts):
- Primary: link to ${MIN_BLOG_POST_LINKS}–4 related published posts using href="/blog/slug" (contextual anchor text; not "click here").
- Related posts you may link (pick topics that fit this article, not duplicates of this angle):
${blogLines}
${pillarBlock}
- Do not exceed ${MAX_INTERNAL_LINKS} internal links total; avoid repeating the same URL more than twice.`;
}

export function isInternalLinkValidationIssue(issue: string): boolean {
  return (
    issue.includes("internal links") ||
    issue.includes("Internal link to") ||
    issue.includes("links to related /blog/")
  );
}

export function isInternalLinkOnlyFailure(issues: string[]): boolean {
  return issues.length > 0 && issues.every(isInternalLinkValidationIssue);
}

/** @deprecated */
export function isPillarLinkValidationIssue(issue: string): boolean {
  return isInternalLinkValidationIssue(issue);
}

/** @deprecated */
export function isPillarLinkOnlyFailure(issues: string[]): boolean {
  return isInternalLinkOnlyFailure(issues);
}
