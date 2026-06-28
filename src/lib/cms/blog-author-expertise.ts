import "server-only";

import type { BlogAuthor } from "@/app/data/blogAuthors";
import {
  BLOG_AUTHOR_EXPERTISE_TAGS,
  type BlogAuthorExpertiseTag,
} from "@/lib/cms/blog-author-expertise-ids";
import type { TopicCategory } from "@/lib/topicCategories";
import {
  getRandomCategory,
  topicCategories,
} from "@/lib/topicCategories";
import type { SeoKeywordBrief } from "@/lib/seo/keyword-stats";

export {
  BLOG_AUTHOR_EXPERTISE_TAGS,
  type BlogAuthorExpertiseTag,
} from "@/lib/cms/blog-author-expertise-ids";

const VALID_TAG_IDS = new Set<string>(
  BLOG_AUTHOR_EXPERTISE_TAGS.map((t) => t.id)
);

/** Category name → expertise tags (aligned with topicCategories.ts). */
export const CATEGORY_EXPERTISE_TAGS: Record<string, BlogAuthorExpertiseTag[]> =
  {
    "Cleaning Methods & Technology": ["cleaning-methods", "robot-products"],
    "Robot Models & Features": ["robot-products", "cleaning-methods"],
    "Efficiency & Performance": ["om-operations", "technical"],
    "Solar Power Plant Operations & Maintenance (O&M)": ["om-operations"],
    "Maintenance & Operations (Robots)": [
      "robot-products",
      "field-service",
      "om-operations",
    ],
    "ROI & Cost Analysis": ["roi-cost"],
    "Installation & Commissioning": ["installation", "robot-products"],
    "Industry Trends & Innovations": ["industry-trends"],
    "Regional & Climate-Specific": ["regional-climate", "om-operations"],
    "Technical Deep Dives": ["technical", "om-operations"],
  };

const KEYWORD_TAG_RULES: { pattern: RegExp; tags: BlogAuthorExpertiseTag[] }[] =
  [
    {
      pattern:
        /robot|glyde|nyuma|helyx|automatic|machine|system|model|tracker|dual-pass|pbt|waterless|brush|sprinkler|cleaning equipment/i,
      tags: ["robot-products", "cleaning-methods"],
    },
    {
      pattern: /cost|price|roi|calculator|tco|payback|opex|capex|budget/i,
      tags: ["roi-cost"],
    },
    {
      pattern: /service|company|vendor|partner|fleet|nectyr|monitoring/i,
      tags: ["field-service", "roi-cost"],
    },
    {
      pattern:
        /install|commission|site prep|deployment|integrat/i,
      tags: ["installation"],
    },
    {
      pattern:
        /india|dust|monsoon|coastal|regional|climate|weather|soil/i,
      tags: ["regional-climate"],
    },
    {
      pattern:
        /o&m|om\b|operations|maintenance|scada|pr\b|performance ratio|availability|inverter|utility|plant/i,
      tags: ["om-operations"],
    },
    {
      pattern: /esg|sustainab|trend|innovat|market|future/i,
      tags: ["industry-trends"],
    },
    {
      pattern: /technical|analytics|degradation|predictive|data/i,
      tags: ["technical"],
    },
  ];

const ROLE_BIO_TAG_RULES: { pattern: RegExp; tags: BlogAuthorExpertiseTag[] }[] =
  [
    {
      pattern: /product|growth|strategy|commercial|sales|marketing/i,
      tags: ["roi-cost", "robot-products", "industry-trends"],
    },
    {
      pattern: /engineer|technical|r&d|design|hardware|software/i,
      tags: ["technical", "robot-products", "cleaning-methods"],
    },
    {
      pattern: /o&m|operations|plant|asset|maintenance|scada/i,
      tags: ["om-operations", "field-service"],
    },
    {
      pattern: /service|field|deployment|commission|install/i,
      tags: ["field-service", "installation"],
    },
    {
      pattern: /finance|roi|cost|analyst/i,
      tags: ["roi-cost"],
    },
  ];

export function parseExpertiseTags(
  raw: string | null | undefined
): BlogAuthorExpertiseTag[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter((t): t is BlogAuthorExpertiseTag => VALID_TAG_IDS.has(t));
  } catch {
    return [];
  }
}

export function serializeExpertiseTags(
  tags: BlogAuthorExpertiseTag[]
): string {
  const unique = [...new Set(tags)].filter((t) => VALID_TAG_IDS.has(t));
  return JSON.stringify(unique);
}

/** Guess tags from role/bio when CMS tags are empty (migration-friendly). */
export function inferExpertiseFromAuthor(
  author: Pick<BlogAuthor, "role" | "bio" | "name">
): BlogAuthorExpertiseTag[] {
  const text = `${author.role} ${author.bio} ${author.name}`.toLowerCase();
  const found = new Set<BlogAuthorExpertiseTag>();
  for (const rule of ROLE_BIO_TAG_RULES) {
    if (rule.pattern.test(text)) {
      for (const tag of rule.tags) found.add(tag);
    }
  }
  if (found.size === 0) {
    return ["om-operations", "cleaning-methods"];
  }
  const tags = [...found];
  return tags.length > MAX_INFERRED_EXPERTISE_TAGS
    ? tags.slice(0, MAX_INFERRED_EXPERTISE_TAGS)
    : tags;
}

export function resolveAuthorExpertiseTags(
  author: BlogAuthor
): BlogAuthorExpertiseTag[] {
  const explicit = author.expertiseTags ?? [];
  if (explicit.length > 0) return explicit;
  return inferExpertiseFromAuthor(author);
}

export function tagsForSeoKeyword(
  keyword: string,
  searchIntent?: string
): Set<BlogAuthorExpertiseTag> {
  const text = `${keyword} ${searchIntent ?? ""}`.toLowerCase();
  const tags = new Set<BlogAuthorExpertiseTag>();
  for (const rule of KEYWORD_TAG_RULES) {
    if (rule.pattern.test(text)) {
      for (const t of rule.tags) tags.add(t);
    }
  }
  if (/comparison/i.test(searchIntent ?? "")) {
    tags.add("cleaning-methods");
    tags.add("roi-cost");
  }
  if (tags.size === 0) tags.add("om-operations");
  return tags;
}

export function tagsForCategory(
  category: TopicCategory
): Set<BlogAuthorExpertiseTag> {
  const mapped = CATEGORY_EXPERTISE_TAGS[category.name];
  if (mapped?.length) return new Set(mapped);
  return new Set<BlogAuthorExpertiseTag>(["om-operations"]);
}

export function mergeTopicTags(
  keyword: string,
  category: TopicCategory,
  searchIntent?: string
): Set<BlogAuthorExpertiseTag> {
  const merged = tagsForSeoKeyword(keyword, searchIntent);
  for (const t of tagsForCategory(category)) merged.add(t);
  return merged;
}

/** Cap inferred tags so backfill/CEO bios do not match every lane. */
const MAX_INFERRED_EXPERTISE_TAGS = 3;

function scoreAuthorAgainstTags(
  authorTags: BlogAuthorExpertiseTag[],
  topicTags: Set<BlogAuthorExpertiseTag>
): number {
  if (topicTags.size === 0 || authorTags.length === 0) return 0;
  let matchCount = 0;
  for (const tag of authorTags) {
    if (topicTags.has(tag)) matchCount += 1;
  }
  if (matchCount === 0) return 0;
  // Prefer specialists over authors tagged in every lane (e.g. CEO with 9 tags).
  const density = matchCount / authorTags.length;
  return Math.round(matchCount * 2 * density);
}

function normalizeAuthorName(name: string): string {
  return name.trim().toLowerCase();
}

function filterAuthorsByExclusion(
  authors: BlogAuthor[],
  excludeAuthorNames?: Set<string>
): BlogAuthor[] {
  if (!excludeAuthorNames || excludeAuthorNames.size === 0) {
    return authors;
  }
  return authors.filter(
    (author) => !excludeAuthorNames.has(normalizeAuthorName(author.name))
  );
}

export type PickBestAuthorOptions = {
  /** Lowercase display names to deprioritize (hybrid rotation). */
  excludeAuthorNames?: Set<string>;
  /** Normalized author display names → published English post count. */
  blogCountByAuthorName?: Map<string, number>;
};

function authorPublishedBlogCount(
  author: BlogAuthor,
  blogCountByAuthorName?: Map<string, number>
): number {
  if (!blogCountByAuthorName) return 0;
  return blogCountByAuthorName.get(normalizeAuthorName(author.name)) ?? 0;
}

/** Prefer authors with the fewest published posts; random tie-break within that tier. */
export function pickLeastUsedBlogAuthor(
  pool: BlogAuthor[],
  blogCountByAuthorName?: Map<string, number>
): BlogAuthor | null {
  if (pool.length === 0) return null;
  if (!blogCountByAuthorName || blogCountByAuthorName.size === 0) {
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  let minCount = Infinity;
  for (const author of pool) {
    const count = authorPublishedBlogCount(author, blogCountByAuthorName);
    if (count < minCount) minCount = count;
  }

  const leastUsed = pool.filter(
    (author) =>
      authorPublishedBlogCount(author, blogCountByAuthorName) === minCount
  );
  return leastUsed[Math.floor(Math.random() * leastUsed.length)] ?? null;
}

/**
 * Pick the best-matching eligible author; among ties, prefer fewest published posts.
 * When excludeAuthorNames is set, prefers authors outside that set within the tier.
 */
export function pickBestAuthorForTopicTags(
  pool: BlogAuthor[],
  topicTags: Set<BlogAuthorExpertiseTag>,
  options?: PickBestAuthorOptions
): BlogAuthor | null {
  if (pool.length === 0) return null;

  const scored = pool.map((author) => {
    const expertise = resolveAuthorExpertiseTags(author);
    const score = scoreAuthorAgainstTags(expertise, topicTags);
    return { author, score, expertise };
  });

  const maxScore = Math.max(...scored.map((s) => s.score));
  const tier =
    maxScore > 0
      ? scored.filter((s) => s.score >= maxScore - 1)
      : scored;

  const tierAuthors = tier.map((s) => s.author);
  let candidates = filterAuthorsByExclusion(
    tierAuthors,
    options?.excludeAuthorNames
  );

  if (candidates.length === 0 && options?.excludeAuthorNames?.size) {
    // Tier is all recently used, widen to full pool but keep rotation window.
    candidates = filterAuthorsByExclusion(pool, options.excludeAuthorNames);
  }
  if (candidates.length === 0) {
    // Every eligible author posted recently, pick least-used globally.
    candidates = pool;
  }

  return pickLeastUsedBlogAuthor(candidates, options?.blogCountByAuthorName);
}

/** Rank categories for today's SEO keyword (best match first). */
export function rankCategoriesForKeyword(
  keyword: string,
  searchIntent?: string
): TopicCategory[] {
  const topicTags = tagsForSeoKeyword(keyword, searchIntent);
  return [...topicCategories]
    .map((category) => {
      const catTags = tagsForCategory(category);
      let score = 0;
      for (const t of catTags) {
        if (topicTags.has(t)) score += 2;
      }
      const kw = keyword.toLowerCase();
      if (
        category.keywords.some((k) => {
          const fragment = k.toLowerCase().slice(0, 12);
          return fragment.length > 4 && kw.includes(fragment.split(" ")[0]!);
        })
      ) {
        score += 1;
      }
      return { category, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((row) => row.category);
}

export function pickCategoryForSeoBrief(
  brief: SeoKeywordBrief | null
): TopicCategory {
  if (!brief) return topicCategories[0]!;
  const ranked = rankCategoriesForKeyword(brief.primary, brief.searchIntent);
  const topScore = (() => {
    const topicTags = tagsForSeoKeyword(brief.primary, brief.searchIntent);
    const first = ranked[0];
    if (!first) return 0;
    let s = 0;
    for (const t of tagsForCategory(first)) {
      if (topicTags.has(t)) s += 2;
    }
    return s;
  })();
  const topTier = ranked.filter((cat) => {
    const topicTags = tagsForSeoKeyword(brief.primary, brief.searchIntent);
    let s = 0;
    for (const t of tagsForCategory(cat)) {
      if (topicTags.has(t)) s += 2;
    }
    return s >= Math.max(0, topScore - 1);
  });
  const pool = topTier.length > 0 ? topTier : ranked;
  return pool[Math.floor(Math.random() * pool.length)] ?? getRandomCategory();
}

export function formatExpertiseTagsForPrompt(
  tags: BlogAuthorExpertiseTag[]
): string {
  if (tags.length === 0) return "";
  const labels = tags.map(
    (id) =>
      BLOG_AUTHOR_EXPERTISE_TAGS.find((t) => t.id === id)?.label ?? id
  );
  return `Expertise lanes: ${labels.join(", ")}`;
}
