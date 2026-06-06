import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { listBlogsForSimilarityCheck } from "@/lib/cms/blogService";
import { readPublishedTopics } from "@/lib/cms/topicService";
import {
  buildContentFingerprint,
  extractH2Headings,
  parseH2OutlineJson,
} from "@/lib/seo/blog-similarity";
import { calculateBlogSimilarity } from "@/lib/seo/blog-similarity-scoring";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export type StructuralArchetype =
  | "mistakes_listicle"
  | "manual_vs_robot"
  | "frequency_guide"
  | "cost_breakdown"
  | "vendor_shortlist"
  | "complete_guide"
  | "weather_soiling"
  | "robot_evaluation"
  | "price_capex_bridge"
  | "comparison_matrix"
  | "checklist_playbook"
  | "general_om";

export type CorpusIndexEntry = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string | null;
  structuralArchetype: StructuralArchetype;
  h2Outline: string[];
  fingerprint: string;
};

export type CorpusIndexFile = {
  builtAt: string;
  locale: string;
  entries: CorpusIndexEntry[];
};

let cachedIndex: CorpusIndexFile | null = null;

function resolveIndexPath(): string {
  const envPath = process.env.SEO_CORPUS_INDEX_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-corpus-index.json");
}

export function classifyStructuralArchetype(input: {
  title: string;
  description?: string;
  h2Outline?: string[];
}): StructuralArchetype {
  const title = input.title.toLowerCase();
  const desc = (input.description ?? "").toLowerCase();
  const h2 = (input.h2Outline ?? []).join(" ").toLowerCase();
  const blob = `${title} ${desc} ${h2}`;

  if (/\bmistake(s)?\b|\bavoid\b|\bpitfall/.test(blob)) {
    return "mistakes_listicle";
  }
  if (/\bmanual\b.+\brobot\b|\bbrush\b.+\brobot\b|\bvs\b.+\bmanual\b/.test(blob)) {
    return "manual_vs_robot";
  }
  if (/how often|frequency|cleaning schedule|interval/.test(blob)) {
    return "frequency_guide";
  }
  if (/cost breakdown|per[- ]mw|budget line|opex|capex vs|tco/.test(blob)) {
    return "cost_breakdown";
  }
  if (/shortlist|manufacturer|supplier|vendor|companies/.test(blob)) {
    return "vendor_shortlist";
  }
  if (/weather|monsoon|dust belt|soiling|performance ratio|\bpr\b/.test(blob)) {
    return "weather_soiling";
  }
  if (/panel price|module price|per watt|pv panel price/.test(blob)) {
    return "price_capex_bridge";
  }
  if (/evaluate|evaluation|what to look|checklist|playbook/.test(blob)) {
    return "robot_evaluation";
  }
  if (/complete guide|ultimate guide|everything you need|comprehensive/.test(blob)) {
    return "complete_guide";
  }
  if (/\bvs\b|compare|comparison|pros and cons/.test(blob)) {
    return "comparison_matrix";
  }
  if (/checklist|step[- ]by[- ]step|playbook/.test(blob)) {
    return "checklist_playbook";
  }
  return "general_om";
}

function parsePrimaryKeyword(category?: string): string | null {
  const match = (category ?? "").match(/seo:([^|]+)/i);
  return match?.[1]?.trim().toLowerCase() ?? null;
}

function inferKeywordFromTitle(title: string, queueKeywords: string[]): string | null {
  const lower = title.toLowerCase();
  let best: string | null = null;
  let bestLen = 0;
  for (const kw of queueKeywords) {
    if (lower.includes(kw) && kw.length > bestLen) {
      best = kw;
      bestLen = kw.length;
    }
  }
  return best;
}

export async function buildCorpusIndex(): Promise<CorpusIndexFile> {
  const posts = await listBlogsForSimilarityCheck(true, SOURCE_LOCALE);
  const topics = await readPublishedTopics();
  const h2BySlug = new Map<string, string[]>();
  const keywordBySlug = new Map<string, string | null>();

  for (const topic of topics) {
    if (topic.h2Outline?.length) {
      h2BySlug.set(topic.slug, topic.h2Outline);
    }
    keywordBySlug.set(topic.slug, parsePrimaryKeyword(topic.category));
  }

  const entries: CorpusIndexEntry[] = posts.map((post) => {
    const h2Outline =
      h2BySlug.get(post.slug) ??
      (post.content ? extractH2Headings(post.content) : []);
    const primaryKeyword = keywordBySlug.get(post.slug) ?? null;
    const archetype = classifyStructuralArchetype({
      title: post.title,
      description: post.description,
      h2Outline,
    });

    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      primaryKeyword,
      structuralArchetype: archetype,
      h2Outline,
      fingerprint: buildContentFingerprint(
        post.title,
        post.description,
        post.content
      ),
    };
  });

  return {
    builtAt: new Date().toISOString(),
    locale: SOURCE_LOCALE,
    entries,
  };
}

export function loadCorpusIndex(): CorpusIndexFile {
  if (cachedIndex) return cachedIndex;
  const filePath = resolveIndexPath();
  if (!fs.existsSync(filePath)) {
    cachedIndex = { builtAt: "", locale: SOURCE_LOCALE, entries: [] };
    return cachedIndex;
  }
  try {
    cachedIndex = JSON.parse(fs.readFileSync(filePath, "utf8")) as CorpusIndexFile;
    return cachedIndex;
  } catch {
    cachedIndex = { builtAt: "", locale: SOURCE_LOCALE, entries: [] };
    return cachedIndex;
  }
}

export function invalidateCorpusIndexCache(): void {
  cachedIndex = null;
}

export function writeCorpusIndex(index: CorpusIndexFile): void {
  const filePath = resolveIndexPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(index, null, 2));
  cachedIndex = index;
}

/** Posts whose title contains the keyword phrase (keyword cluster). */
export function corpusEntriesInKeywordCluster(
  keyword: string,
  index: CorpusIndexFile = loadCorpusIndex()
): CorpusIndexEntry[] {
  const kw = keyword.toLowerCase().trim();
  if (kw.length < 8) {
    return index.entries.filter(
      (e) => e.primaryKeyword?.toLowerCase() === kw
    );
  }
  return index.entries.filter(
    (e) =>
      e.title.toLowerCase().includes(kw) ||
      e.primaryKeyword?.toLowerCase() === kw ||
      (e.primaryKeyword && e.primaryKeyword.includes(kw))
  );
}

export function exhaustedArchetypesForKeywordCluster(
  keyword: string,
  index: CorpusIndexFile = loadCorpusIndex()
): Set<StructuralArchetype> {
  const cluster = corpusEntriesInKeywordCluster(keyword, index);
  return new Set(cluster.map((e) => e.structuralArchetype));
}

export function findSimilarCorpusEntries(
  probe: { title: string; description: string; keyword?: string },
  limit = 5,
  index: CorpusIndexFile = loadCorpusIndex()
): CorpusIndexEntry[] {
  const input = {
    title: probe.title,
    description: probe.description || probe.keyword || probe.title,
  };

  return index.entries
    .map((entry) => ({
      entry,
      score: calculateBlogSimilarity(input, {
        title: entry.title,
        description: entry.description,
      }),
    }))
    .filter((row) => row.score > 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.entry);
}

export function h2OutlineFromTopicRow(
  raw: string | null | undefined
): string[] {
  return parseH2OutlineJson(raw);
}
