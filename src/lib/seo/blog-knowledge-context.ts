import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { getBlogBySlug, listAllBlogs } from "@/lib/cms/blogService";
import { getProductKnowledgeBase } from "@/lib/productKnowledge";
import { TAYPRO_PUBLIC_PROOF } from "@/lib/marketing/public-proof-stats";
import { calculateBlogSimilarity } from "@/lib/seo/blog-similarity-scoring";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { SOURCE_LOCALE } from "@/lib/translation/config";

const LLMS_MAX_CHARS = 3_500;
const EXCERPT_MAX_CHARS = 600;
const MAX_RELATED_POSTS = 2;

let cachedLlmsSummary: string | null = null;

export type BlogKnowledgeContextOptions = {
  /** Working title or topic line for relevance ranking */
  topic?: string;
  /** Primary SEO keyword when available */
  seoKeyword?: string;
  /** Extra terms (e.g. category name) for matching related posts */
  extraTerms?: string;
};

export function formatPublicProofBlock(): string {
  const p = TAYPRO_PUBLIC_PROOF;
  return `PUBLIC PROOF POINTS (use ONLY these figures when citing Taypro fleet/marketing impact; do not invent other company stats):
- Robot capacity deployed: ${p.capacityGw}
- Sites live: ${p.sitesLive}
- Additional clean generation recovered: ${p.generationRecoveredGwh}
- Water saved annually: ${p.waterSavedLitres} litres
- CO2 emission reduced annually: ${p.co2ReducedTons} metric tons
- Cleaning efficiency: ${p.cleaningEfficiency}
- Warehouses in India: ${p.warehouses}
- Manufacturing capacity: ${p.manufacturingPerMonth} robots per month`;
}

/** Trim public/llms.txt to a compact site positioning block (comments stripped). */
export function loadLlmsSiteSummary(): string {
  if (cachedLlmsSummary !== null) return cachedLlmsSummary;

  const filePath = path.join(getDeploymentRoot(), "public", "llms.txt");
  if (!fs.existsSync(filePath)) {
    cachedLlmsSummary = "";
    return cachedLlmsSummary;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  let summary = lines.join("\n");
  if (summary.length > LLMS_MAX_CHARS) {
    summary = `${summary.slice(0, LLMS_MAX_CHARS).trim()}…`;
  }

  cachedLlmsSummary = summary;
  return cachedLlmsSummary;
}

function buildQueryText(options: BlogKnowledgeContextOptions): string {
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

/** Top published English posts by keyword similarity (for consistency, not copying). */
export async function findRelevantBlogExcerpts(
  options: BlogKnowledgeContextOptions,
  limit = MAX_RELATED_POSTS
): Promise<{ slug: string; title: string; excerpt: string }[]> {
  const query = buildQueryText(options);
  if (!query) return [];

  const posts = await listAllBlogs(false, SOURCE_LOCALE);
  if (posts.length === 0) return [];

  const queryInput = {
    title: query,
    description: options.seoKeyword ?? query,
  };

  const ranked = posts
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
    const full = await getBlogBySlug(post.slug, {
      locale: SOURCE_LOCALE,
      includeDraft: false,
    });
    if (!full?.content) continue;

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
 * Phase 1 knowledge pack: product KB + live public proof + site map summary + related post excerpts.
 */
export async function buildBlogKnowledgeContext(
  options: BlogKnowledgeContextOptions = {}
): Promise<string> {
  const productKnowledge = getProductKnowledgeBase();
  const proofBlock = formatPublicProofBlock();
  const llmsSummary = loadLlmsSiteSummary();
  const excerpts = await findRelevantBlogExcerpts(options);

  const llmsBlock = llmsSummary
    ? `SITE POSITIONING & ROUTES (from live site map; align tone and product paths):
${llmsSummary}`
    : "";

  const excerptBlock =
    excerpts.length > 0
      ? `RELATED PUBLISHED POSTS (for consistency only; do NOT copy sentences or structure; write a new angle):
${excerpts
  .map(
    (e, i) =>
      `${i + 1}. "${e.title}" (/blog/${e.slug})
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
- Do not invent statistics, client names, or model codes not listed above.
`.trim();
}
