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
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars).trim()}…`;
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

KNOWLEDGE RULES:
- Product specs and names: use PRODUCT KNOWLEDGE BASE only.
- Company/fleet impact numbers: use PUBLIC PROOF POINTS only.
- Site-specific MW, location, and deployment facts: use the AUTHOR BRIEF when provided; do not invent client names.
- Do not invent statistics, client names, or model codes not listed above.
`.trim();
}
