import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { readPublishedTopics } from "@/lib/cms/topicService";

export type SeoKeywordRow = {
  keyword: string;
  /** Google Ads volume bucket (e.g. 500, 5000), not exact counts. */
  volumeBucket: number;
  competition: string;
};

export type SeoKeywordBrief = {
  primary: string;
  volumeBucket: number;
  competition: string;
  related: string[];
};

const SEO_CATEGORY_PREFIX = "seo:";

/** Taypro-relevant queries from Keyword Planner export. */
const RELEVANT =
  /clean|robot|maintenance|soil|waterless|automatic|sprinkler|tracker|utility|commercial solar|solar plant|solar farm|pv panel|performance ratio|om\b|o&m|dry clean|cleaning system|cleaning machine|cleaning equipment|cleaning service|solar washing|module clean/i;

/** Low-intent, geo, or off-brand terms to skip. */
const EXCLUDE =
  /near me|san diego|sydney|melbourne|austin|tucson|fresno|gold coast|canberra|utah|geelong|central coast|san antonio|diy\b|cleaning jobs|cleaning license|gutter and|www solar|cheap solar|panel price|pv panel installation|solar panel installation|^solar panels$|^best solar panels$|^top 10 solar|^top solar panel in india$|^solar panel companies$|^solar panel manufacturers$|^pv panels$|^photovoltaic panels$/i;

let cachedRows: SeoKeywordRow[] | null = null;

function resolveCsvPath(): string {
  const envPath = process.env.SEO_KEYWORDS_CSV_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-keywords.csv");
}

function parseVolumeBucket(raw: string): number {
  const normalized = raw.replace(/,/g, "").trim();
  if (!normalized || normalized === "0") return 0;
  const n = Number.parseInt(normalized, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Parse Google Keyword Planner TSV export (skips header rows). */
export function loadSeoKeywordRows(): SeoKeywordRow[] {
  if (cachedRows) return cachedRows;

  const filePath = resolveCsvPath();
  if (!fs.existsSync(filePath)) {
    cachedRows = [];
    return cachedRows;
  }

  const buf = fs.readFileSync(filePath);
  const text =
    buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe
      ? buf.toString("utf16le").replace(/^\uFEFF/, "")
      : buf.toString("utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  const rows: SeoKeywordRow[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split("\t");
    if (cols.length < 7) continue;
    const keyword = cols[0]?.trim();
    if (!keyword || keyword === "Keyword" || keyword.startsWith("Keyword Stats")) {
      continue;
    }

    const volumeBucket = parseVolumeBucket(cols[2] ?? "");
    const competition = (cols[5] ?? "").trim();
    if (volumeBucket <= 0) continue;
    if (!RELEVANT.test(keyword)) continue;
    if (EXCLUDE.test(keyword)) continue;

    rows.push({
      keyword: keyword.toLowerCase(),
      volumeBucket,
      competition,
    });
  }

  rows.sort((a, b) => b.volumeBucket - a.volumeBucket);
  cachedRows = rows;
  return rows;
}

/** Keywords already used by automation (stored in published_topics.category). */
export async function getUsedSeoKeywords(): Promise<Set<string>> {
  const used = new Set<string>();
  const topics = await readPublishedTopics();
  for (const topic of topics) {
    const cat = topic.category ?? "";
    const match = cat.match(/seo:([^|]+)/i);
    if (match?.[1]) used.add(match[1].trim().toLowerCase());
  }
  return used;
}

/** Pick the highest-volume unused keyword, with light randomness in the top tier. */
export async function pickSeoKeywordBrief(): Promise<SeoKeywordBrief | null> {
  const rows = loadSeoKeywordRows();
  if (rows.length === 0) return null;

  const used = await getUsedSeoKeywords();
  const available = rows.filter((r) => !used.has(r.keyword));
  if (available.length === 0) return null;

  const topVolume = available[0].volumeBucket;
  const tier = available.filter(
    (r) => r.volumeBucket >= Math.max(50, topVolume / 2)
  );
  const pool = tier.slice(0, Math.min(12, tier.length));
  const primary = pool[Math.floor(Math.random() * pool.length)];

  const related = available
    .filter((r) => r.keyword !== primary.keyword)
    .slice(0, 8)
    .map((r) => r.keyword);

  return {
    primary: primary.keyword,
    volumeBucket: primary.volumeBucket,
    competition: primary.competition,
    related,
  };
}

/** Category string persisted on published_topics for tracking. */
export function formatTopicCategory(
  categoryName: string,
  seoKeyword: string
): string {
  return `${categoryName}|${SEO_CATEGORY_PREFIX}${seoKeyword}`;
}

export function formatSeoPromptBlock(brief: SeoKeywordBrief): string {
  const volumeLabel =
    brief.volumeBucket >= 5000
      ? "high"
      : brief.volumeBucket >= 500
        ? "medium"
        : "niche";

  return `SEO TARGET (from Google Keyword Planner — India):
- Primary keyword: "${brief.primary}" (~${brief.volumeBucket}+ avg. monthly searches bucket, ${volumeLabel} volume, competition: ${brief.competition || "n/a"})
- Work this phrase naturally into the title, meta description, first paragraph, at least one H2, and conclusion.
- Related terms to weave in where natural: ${brief.related.slice(0, 6).join(", ")}
- Do NOT keyword-stuff; write for plant owners and O&M managers first.`;
}
