import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { readPublishedTopics } from "@/lib/cms/topicService";
import { passesSeoKeywordFilters } from "@/lib/seo/keyword-filters";
import { loadGscBoostKeywords } from "@/lib/seo/gsc-keyword-boost";
import { loadSeoBlogQueueKeywords } from "@/lib/seo/seo-blog-queue";

export type SeoKeywordRow = {
  keyword: string;
  /** Google Ads volume bucket (e.g. 500, 5000), not exact counts. */
  volumeBucket: number;
  competition: string;
  /** Ads competition index 0–100; lower is easier to rank. */
  competitionIndex: number;
};

export type SeoKeywordBrief = {
  primary: string;
  volumeBucket: number;
  competition: string;
  competitionIndex: number;
  searchIntent: string;
  related: string[];
};

const SEO_CATEGORY_PREFIX = "seo:";

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
    const competitionIndex = Number.parseInt(
      (cols[6] ?? "").replace(/,/g, ""),
      10
    );
    if (volumeBucket <= 0) continue;
    if (!passesSeoKeywordFilters(keyword)) continue;

    rows.push({
      keyword: keyword.toLowerCase(),
      volumeBucket,
      competition,
      competitionIndex: Number.isFinite(competitionIndex)
        ? competitionIndex
        : 50,
    });
  }

  rows.sort((a, b) => scoreKeywordRow(b) - scoreKeywordRow(a));
  cachedRows = rows;
  return rows;
}

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

function scoreKeywordRow(row: SeoKeywordRow): number {
  let score = row.volumeBucket * 10;
  const comp = row.competition.toLowerCase();
  if (comp === "low") score += 800;
  else if (comp === "medium") score += 400;
  if (row.competitionIndex > 0 && row.competitionIndex <= 25) score += 600;
  else if (row.competitionIndex <= 40) score += 300;
  if (/cleaning robot|cleaning service|automatic|waterless|brush/.test(row.keyword)) {
    score += 200;
  }
  if (/panel price|pv panel price|inverter|manufacturer|supplier|equipment/.test(row.keyword)) {
    score += 180;
  }
  return score;
}

export function inferSearchIntent(keyword: string): string {
  const k = keyword.toLowerCase();
  if (/manufacturer|supplier|wholesal|companies/.test(k)) {
    return "Commercial research, comparing vendors/specs for utility or C&I plants; bridge to post-commissioning O&M, soiling, and robotic cleaning—not a module sales page.";
  }
  if (/inverter|string combiner|transformer/.test(k)) {
    return "Equipment buyer researching BOS for solar plants; connect reliability and layout to long-term O&M including panel cleaning and dust management.";
  }
  if (/cost|price|roi|calculator/.test(k)) {
    return "Commercial, reader comparing capex/opex; include equipment price context and lifetime O&M (cleaning, soiling, robots); link to price calculator where relevant.";
  }
  if (/vs|compare|brush|manual|sprinkler/.test(k)) {
    return "Comparison, reader choosing between methods; use pros/cons and utility-scale examples.";
  }
  if (/how often|frequency|best way|when to/.test(k)) {
    return "Informational/decision, scheduling and O&M best practice for MW plants.";
  }
  if (/service|company/.test(k)) {
    return "Commercial, evaluating vendors/Opex; explain what to look for in robot cleaning partners.";
  }
  if (/equipment|machine|system|robot/.test(k)) {
    return "Research, understanding equipment options for 5MW+ sites; tie to Taypro models where accurate.";
  }
  return "Informational, utility operator researching cleaning/soiling; give actionable technical guidance.";
}

function buildSeoKeywordBrief(
  primary: SeoKeywordRow,
  available: SeoKeywordRow[]
): SeoKeywordBrief {
  const related = available
    .filter((r) => r.keyword !== primary.keyword)
    .slice(0, 12)
    .map((r) => r.keyword)
    .slice(0, 8);

  return {
    primary: primary.keyword,
    volumeBucket: primary.volumeBucket,
    competition: primary.competition,
    competitionIndex: primary.competitionIndex,
    searchIntent: inferSearchIntent(primary.keyword),
    related,
  };
}

function pickByKeywordPriority(
  priorityKeywords: string[],
  available: SeoKeywordRow[]
): SeoKeywordRow | null {
  const byKeyword = new Map(available.map((r) => [r.keyword, r]));
  for (const kw of priorityKeywords) {
    const row = byKeyword.get(kw.toLowerCase().trim());
    if (row) return row;
  }
  return null;
}

/** Unused keyword rows from the CSV pool. */
export async function listAvailableKeywordRows(): Promise<SeoKeywordRow[]> {
  const rows = loadSeoKeywordRows();
  if (rows.length === 0) return [];
  const used = await getUsedSeoKeywords();
  return rows.filter((r) => !used.has(r.keyword));
}

/**
 * Code-ranked candidate pool for hybrid Gemini keyword selection.
 * Order: editorial queue → GSC boost → scored remainder.
 */
export function buildKeywordCandidateBriefs(
  available: SeoKeywordRow[],
  maxCandidates = 12
): SeoKeywordBrief[] {
  const briefs: SeoKeywordBrief[] = [];
  const seen = new Set<string>();

  const addRow = (row: SeoKeywordRow | undefined) => {
    if (!row || seen.has(row.keyword) || briefs.length >= maxCandidates) return;
    seen.add(row.keyword);
    briefs.push(buildSeoKeywordBrief(row, available));
  };

  const byKeyword = new Map(available.map((r) => [r.keyword, r]));

  for (const kw of loadSeoBlogQueueKeywords()) {
    addRow(byKeyword.get(kw.toLowerCase().trim()));
  }
  for (const kw of loadGscBoostKeywords()) {
    addRow(byKeyword.get(kw.toLowerCase().trim()));
  }

  const scored = [...available].sort((a, b) => scoreKeywordRow(b) - scoreKeywordRow(a));
  for (const row of scored) {
    addRow(row);
  }

  return briefs;
}

/**
 * Pick next keyword: editorial queue → GSC boost list → scored random pool.
 * @deprecated Prefer pickSeoKeywordBriefHybrid for automation.
 */
export async function pickSeoKeywordBrief(): Promise<SeoKeywordBrief | null> {
  const rows = loadSeoKeywordRows();
  if (rows.length === 0) return null;

  const used = await getUsedSeoKeywords();
  const available = rows.filter((r) => !used.has(r.keyword));
  if (available.length === 0) return null;

  const queued = pickByKeywordPriority(loadSeoBlogQueueKeywords(), available);
  if (queued) return buildSeoKeywordBrief(queued, available);

  const boosted = pickByKeywordPriority(loadGscBoostKeywords(), available);
  if (boosted) return buildSeoKeywordBrief(boosted, available);

  const pool = available.slice(0, Math.min(40, available.length));
  const primary = pool[Math.floor(Math.random() * pool.length)];
  return buildSeoKeywordBrief(primary, available);
}

/** Category string persisted on published_topics for tracking. */
export function formatTopicCategory(
  categoryName: string,
  seoKeyword: string
): string {
  return `${categoryName}|${SEO_CATEGORY_PREFIX}${seoKeyword}`;
}

/** Deterministic, specific title when the model returns vague options. */
export function buildFallbackTopicTitle(keyword: string): string {
  const k = keyword.toLowerCase().trim();
  if (/manufacturer|supplier/.test(k)) {
    return `${keyword.replace(/\b\w/g, (c) => c.toUpperCase())}: What Utility Plant Owners Should Know Before O&M and Cleaning`;
  }
  if (/inverter/.test(k)) {
    return `${keyword.replace(/\b\w/g, (c) => c.toUpperCase())}: BOS Choices and Long-Term Cleaning O&M on Indian Solar Plants`;
  }
  if (/panel price|pv panel price|solar panel price/.test(k)) {
    return "Solar Panel Price in India: Capex Context and O&M (Cleaning, Soiling) After You Buy";
  }
  if (/brush/.test(k)) {
    return "Solar Panel Cleaning Brush vs Robot: TCO for Utility Plants in India";
  }
  if (/frequency|how often/.test(k)) {
    return "How Often Should You Clean Solar Panels on a 50 MW Plant in India?";
  }
  if (/cost|price/.test(k)) {
    return "Solar Panel Cleaning Cost on Utility Plants: Manual vs Robot Breakdown";
  }
  if (/waterless/.test(k)) {
    return "Waterless Solar Panel Cleaning Robots: When They Beat Sprinklers on MW Sites";
  }
  if (/automatic|robot|machine|system/.test(k)) {
    const phrase = keyword.replace(/\b\w/g, (c) => c.toUpperCase());
    return `${phrase}: What Indian Utility O&M Teams Should Evaluate`;
  }
  if (/service|company/.test(k)) {
    return `Choosing a ${keyword.replace(/\b\w/g, (c) => c.toUpperCase())} for MW-Scale Solar in India`;
  }
  const titled = keyword.replace(/\b\w/g, (c) => c.toUpperCase());
  return `${titled}: Practical Guide for Utility-Scale Solar O&M in India`;
}

export function isComparisonSearchIntent(searchIntent: string): boolean {
  return /comparison/i.test(searchIntent);
}

export function isVendorResearchIntent(keyword: string, searchIntent?: string): boolean {
  const k = keyword.toLowerCase();
  if (/manufacturer|supplier|companies|wholesal/.test(k)) return true;
  return /commercial research|evaluating vendors/i.test(searchIntent ?? "");
}

export function formatSeoPromptBlock(brief: SeoKeywordBrief): string {
  const volumeLabel =
    brief.volumeBucket >= 5000
      ? "high"
      : brief.volumeBucket >= 500
        ? "medium"
        : "niche";

  const comparisonTableRule = isComparisonSearchIntent(brief.searchIntent)
    ? "\n- Comparison intent: include an HTML <table> with <thead> comparing methods (e.g. water, labour, frequency, capex/opex notes, PR impact)."
    : "";

  const vendorTableRule = isVendorResearchIntent(brief.primary, brief.searchIntent)
    ? "\n- Vendor research intent: include an HTML <table> with <thead> comparing cleaning-robot approaches (include a Taypro column/row using COMPETITOR LANDSCAPE + PUBLIC PROOF; name other vendors only with facts from COMPETITOR LANDSCAPE; add criteria rows: plant type, waterless, CAPEX/Opex, India support, tracker fit)."
    : "";

  return `SEO TARGET (from Google Keyword Planner, India):
- Primary keyword: "${brief.primary}" (~${brief.volumeBucket}+ avg. monthly searches bucket, ${volumeLabel} volume, competition: ${brief.competition || "n/a"}, index: ${brief.competitionIndex})
- Search intent: ${brief.searchIntent}
- Work the primary phrase in: title, meta description, first 100 words, Quick answer H2, at least one question-shaped H2, and conclusion.
- Related terms for H2/H3 and body: ${brief.related.slice(0, 6).join(", ")}
- Add one question-shaped H2 (e.g. "How often…", "Is a robot worth it…") with a direct answer paragraph under it. Do not add a "Frequently asked questions" section in HTML.${comparisonTableRule}${vendorTableRule}
- Do NOT keyword-stuff; satisfy the reader's intent first, that is what earns rankings and AI overview citations.`;
}
