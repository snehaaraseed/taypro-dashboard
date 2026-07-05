import "server-only";

import { getProjectBySlug, listAllProjects } from "@/lib/cms/projectService";
import { getProductKnowledgeBase } from "@/lib/productKnowledge";
import { calculateBlogSimilarity } from "@/lib/seo/blog-similarity-scoring";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import {
  formatPublicProofBlock,
  loadLlmsSiteSummary,
} from "@/lib/seo/blog-knowledge-context";
import { SOURCE_LOCALE } from "@/lib/translation/config";

const EXCERPT_MAX_CHARS = 600;
const MAX_RELATED_PROJECTS = 2;

const PROJECT_CLEANING_CADENCE_RULES = `
PROJECT CLEANING CADENCE RULES (mandatory):
- Automatic robot projects (details/category include "Automatic", or facts.automaticRobots > 0, or products GLYDE / GLYDE-X / NYUMA / NYUMA-X): describe DAILY waterless cleaning cycles, daily scheduled autonomous cleaning, or daily NECTYR-logged operations.
- Do NOT say automatic robot sites run only "3–10 dry cycles per month", "3-10 cycles per month", or "not daily washing of every module"; that cadence is wrong for fully automatic projects.
- Pick-and-place / semi-automatic HELYX projects (details/category include "Semi-Automatic", facts.semiAutomaticRobots > 0, or HELYX-only deployments): describe site-specific scheduled dry cycles, commonly about 3–10 dry cycles per month, weather and access permitting.
- Mixed fleets: if automatic robots cover rows, describe those automatic rows as daily cleaning; if HELYX/pick-and-place is also present, limit 3–10 monthly cycles only to the pick-and-place scope.
- Never use "daily washing" for Taypro robotic cleaning; use "daily waterless cleaning" or "daily dry cleaning cycles" for automatic robots.
`.trim();

export type ProjectKnowledgeContextOptions = {
  /** Working title or site name for relevance ranking */
  topic?: string;
  /** Primary SEO keyword when available */
  seoKeyword?: string;
  /** Extra terms from author brief */
  extraTerms?: string;
  /** Omit this slug from related excerpts (e.g. when regenerating) */
  excludeSlug?: string;
};

function buildQueryText(options: ProjectKnowledgeContextOptions): string {
  return [options.topic, options.seoKeyword, options.extraTerms]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function truncateExcerpt(text: string, maxChars: number): string {
  const normalized = sanitizeCadenceLanguageForKnowledgeExcerpt(text)
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars).trim()}…`;
}

function sanitizeCadenceLanguageForKnowledgeExcerpt(text: string): string {
  return text
    .replace(
      /utility programmes commonly align with roughly\s+3[–-]10\s+dry-cleaning cycles per month[^.]*\./gi,
      "Automatic robot projects use daily waterless cleaning cycles; pick-and-place scopes use site-specific scheduled dry cycles."
    )
    .replace(
      /programmes commonly align with roughly\s+3[–-]10\s+dry-cleaning cycles per month[^.]*\./gi,
      "Automatic robot projects use daily waterless cleaning cycles; pick-and-place scopes use site-specific scheduled dry cycles."
    )
    .replace(
      /frequency philosophy\s+to the\s+3[–-]10 cycles per month\s+band used on automatic peers[^.]*\./gi,
      "frequency philosophy to the 3–10 cycles per month band used for pick-and-place scopes, without implying automatic-row daily autonomy."
    )
    .replace(
      /Typically\s+3[–-]10 cleaning cycles per month depending on site conditions\./gi,
      "Automatic robots are scheduled for daily waterless cleaning cycles; pick-and-place sites use site-specific monthly cycles."
    );
}

/** Top published English case studies by keyword similarity (for consistency, not copying). */
export async function findRelevantProjectExcerpts(
  options: ProjectKnowledgeContextOptions,
  limit = MAX_RELATED_PROJECTS
): Promise<{ slug: string; title: string; excerpt: string }[]> {
  const query = buildQueryText(options);
  if (!query) return [];

  const posts = await listAllProjects(false, SOURCE_LOCALE);
  if (posts.length === 0) return [];

  const queryInput = {
    title: query,
    description: options.seoKeyword ?? query,
  };

  const ranked = posts
    .filter((post) => post.slug !== options.excludeSlug)
    .map((post) => ({
      post,
      score: calculateBlogSimilarity(queryInput, {
        title: post.title,
        description: post.description,
      }),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const excerpts: { slug: string; title: string; excerpt: string }[] = [];

  for (const { post } of ranked) {
    const full = await getProjectBySlug(post.slug, {
      locale: SOURCE_LOCALE,
      includeDraft: false,
    });
    if (!full?.content) {
      const fallback = truncateExcerpt(
        [post.description, ...(post.details ?? [])].join(" "),
        EXCERPT_MAX_CHARS
      );
      if (fallback) {
        excerpts.push({ slug: post.slug, title: post.title, excerpt: fallback });
      }
      continue;
    }

    excerpts.push({
      slug: post.slug,
      title: post.title,
      excerpt: truncateExcerpt(
        stripHtmlToPlainText(full.content),
        EXCERPT_MAX_CHARS
      ),
    });
  }

  return excerpts;
}

/**
 * Knowledge pack for AI case studies: product KB + public proof + site map + related projects.
 */
export async function buildProjectKnowledgeContext(
  options: ProjectKnowledgeContextOptions = {}
): Promise<string> {
  const productKnowledge = getProductKnowledgeBase();
  const proofBlock = formatPublicProofBlock();
  const llmsSummary = loadLlmsSiteSummary();
  const excerpts = await findRelevantProjectExcerpts(options);

  const llmsBlock = llmsSummary
    ? `SITE POSITIONING & ROUTES (from live site map; align tone and product paths):
${llmsSummary}`
    : "";

  const excerptBlock =
    excerpts.length > 0
      ? `RELATED PUBLISHED CASE STUDIES (for consistency only; do NOT copy sentences or structure; write a new deployment story):
${excerpts
  .map(
    (e, i) =>
      `${i + 1}. "${e.title}" (/projects/${e.slug})
   Excerpt: ${e.excerpt}`
  )
  .join("\n")}`
      : "";

  return `
${productKnowledge}

${proofBlock}

${llmsBlock}

${excerptBlock}

${PROJECT_CLEANING_CADENCE_RULES}

KNOWLEDGE RULES:
- Product specs and names: use PRODUCT KNOWLEDGE BASE only.
- Company/fleet impact numbers: use PUBLIC PROOF POINTS only.
- Site-specific MW, location, and deployment facts: use the AUTHOR BRIEF when provided; do not invent client names.
- Do not invent statistics, client names, or model codes not listed above.
`.trim();
}
