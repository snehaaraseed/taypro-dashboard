#!/usr/bin/env node
/**
 * Bake contextual internal links into EN blog HTML (stored in cms.sqlite).
 * 1) Keyword injection via addInternalLinks (in-body)
 * 2) Fallback appendix: pillar pages + related blog posts when < MIN counts
 *
 *   npx tsx scripts/inject-blog-internal-links.mjs --apply
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { addInternalLinks } from "../src/app/utils/internalLinking.ts";
import {
  extractQualifyingInternalLinkPaths,
  MIN_BLOG_POST_LINKS,
  MIN_INTERNAL_LINKS,
} from "../src/lib/seo/blog-pillar-links.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

const INJECTION_MARKER = "<!-- taypro-internal-links -->";

const DEFAULT_SLUGS = [
  "average-soiling-losses-in-high-dust-regions-of-india-rajasthan-gujarat",
  "seasonal-variation-in-soiling-rates-and-energy-yield-loss-in-india",
  "waterless-robotic-vs-manual-cleaning-cost-comparison-for-10-mw-plant-india",
  "annual-water-and-operational-cost-savings-from-switching-to-waterless-robotic-cleaning",
  "robotic-cleaning-systems-for-single-axis-trackers-operational-challenges-vs-fixed-tilt",
  "opex-vs-capex-for-solar-om-contracts-india-combined-with-which-model-suits-ipps",
  "improving-performance-ratio-in-utility-scale-solar-plants-india-inverter-efficiency-optimization",
];

const PILLAR_ANCHORS = {
  "/solar-panel-cleaning-system": "solar panel cleaning robots and models",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system":
    "GLYDE automatic solar panel cleaning robot",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service":
    "Taypro robotic solar panel cleaning service",
  "/solar-panel-cleaning-robot-price-calculator":
    "solar panel cleaning robot ROI calculator",
  "/solar-panel-cleaning-robot-price-india":
    "solar panel cleaning robot price guide for India",
  "/cleaning-technology": "Taypro waterless solar panel cleaning technology",
  "/compare/taypro-vs-solabot": "Taypro vs Solabot comparison",
  "/compare/solar-panel-cleaning-robot-vs-manual-cleaning":
    "robotic vs manual solar panel cleaning",
  "/compare/waterless-vs-water-based-solar-cleaning":
    "waterless vs water-based solar cleaning",
  "/solar-panel-cleaning-robot-rajasthan":
    "solar panel cleaning robots in Rajasthan",
  "/solar-panel-cleaning-robot-gujarat":
    "solar panel cleaning robots in Gujarat",
  "/solar-panel-cleaning-robot-karnataka":
    "solar panel cleaning robots in Karnataka",
  "/solar-panel-cleaning-robot-maharashtra":
    "solar panel cleaning robots in Maharashtra",
  "/utility-scale-solar-operations": "utility-scale solar O&M in India",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers":
    "GLYDE-X single-axis tracker cleaning robot",
  "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot":
    "NYUMA-X tracker cleaning robot",
};

const KEYWORD_RULES = [
  { re: /\btracker\b/i, path: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers" },
  { re: /\b(single-axis|single axis)\b/i, path: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers" },
  { re: /\b(waterless|dry clean|dual-pass)\b/i, path: "/compare/waterless-vs-water-based-solar-cleaning" },
  { re: /\b(manual|wet wash|brush crew|labour|labor)\b/i, path: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning" },
  { re: /\b(opex|capex|contract|amc|service)\b/i, path: "/solar-panel-cleaning-system/solar-panel-cleaning-service" },
  { re: /\b(price|cost|roi|payback)\b/i, path: "/solar-panel-cleaning-robot-price-india" },
  { re: /\b rajasthan\b/i, path: "/solar-panel-cleaning-robot-rajasthan" },
  { re: /\b gujarat\b/i, path: "/solar-panel-cleaning-robot-gujarat" },
  { re: /\b karnataka\b/i, path: "/solar-panel-cleaning-robot-karnataka" },
  { re: /\b maharashtra\b/i, path: "/solar-panel-cleaning-robot-maharashtra" },
  { re: /\b(soiling|performance ratio|pr\b|o&m|om\b|utility-scale|utility scale)\b/i, path: "/utility-scale-solar-operations" },
  { re: /\b(cleaning robot|panel cleaning|solar cleaning)\b/i, path: "/solar-panel-cleaning-system" },
];

const DEFAULT_PILLAR_PATHS = [
  "/utility-scale-solar-operations",
  "/solar-panel-cleaning-system",
  "/cleaning-technology",
];

function parseSlugs() {
  const out = [];
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--slug=")) {
      out.push(arg.slice("--slug=".length).trim());
    }
  }
  return out.length > 0 ? out : DEFAULT_SLUGS;
}

function countBlogLinks(paths) {
  return paths.filter((p) => p.startsWith("/blog/")).length;
}

function pickPillarPaths(content, existingPaths) {
  const existing = new Set(existingPaths);
  const toAdd = [];
  const haystack = content.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (toAdd.length >= 3) break;
    if (!rule.re.test(haystack)) continue;
    if (existing.has(rule.path) || toAdd.includes(rule.path)) continue;
    toAdd.push(rule.path);
  }

  for (const p of DEFAULT_PILLAR_PATHS) {
    if (toAdd.length >= 3) break;
    if (existing.has(p) || toAdd.includes(p)) continue;
    toAdd.push(p);
  }

  return toAdd.slice(0, 3);
}

function scoreRelevantBlogs(content, slug, blogs) {
  const contentLower = content.toLowerCase();
  const scored = [];

  for (const blog of blogs) {
    if (blog.slug === slug) continue;
    let score = 0;
    const titleLower = (blog.title || "").toLowerCase();
    const descLower = (blog.description || "").toLowerCase();

    for (const keyword of titleLower.split(/\s+/)) {
      if (keyword.length > 3 && contentLower.includes(keyword)) score += 2;
    }
    for (const keyword of descLower.split(/\s+/)) {
      if (keyword.length > 3 && contentLower.includes(keyword)) score += 1;
    }
    if (contentLower.includes("robot") && titleLower.includes("robot")) score += 3;
    if (contentLower.includes("cleaning") && titleLower.includes("cleaning")) score += 2;
    if (contentLower.includes("soiling") && (titleLower.includes("soiling") || titleLower.includes("cleaning"))) score += 3;
    if (contentLower.includes("efficiency") && titleLower.includes("efficiency")) score += 2;
    if (contentLower.includes("performance") && titleLower.includes("performance")) score += 2;
    if (contentLower.includes("waterless") && titleLower.includes("waterless")) score += 3;
    if (contentLower.includes("tracker") && titleLower.includes("tracker")) score += 3;
    if (contentLower.includes("opex") && (titleLower.includes("opex") || titleLower.includes("capex"))) score += 2;

    if (score > 0) scored.push({ blog, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((item) => item.blog);
}

function buildAppendix(pillarPaths, relatedBlogs) {
  const parts = [`${INJECTION_MARKER}`];

  if (pillarPaths.length > 0) {
    parts.push("<h2>Related resources</h2>");
    parts.push("<p>For procurement and O&amp;M teams evaluating robotic cleaning in India:</p>");
    parts.push("<ul>");
    for (const p of pillarPaths) {
      parts.push(`<li><a href="${p}">${PILLAR_ANCHORS[p] ?? p}</a></li>`);
    }
    parts.push("</ul>");
  }

  if (relatedBlogs.length > 0) {
    parts.push("<h2>Related reading</h2>");
    parts.push("<ul>");
    for (const blog of relatedBlogs) {
      parts.push(`<li><a href="${blog.href}">${blog.title}</a></li>`);
    }
    parts.push("</ul>");
  }

  return parts.join("\n");
}

function ensureInternalLinks(content, slug, linkableBlogs) {
  if (content.includes(INJECTION_MARKER)) {
    return content;
  }

  let result = addInternalLinks(content, linkableBlogs, slug, 8);
  let paths = extractQualifyingInternalLinkPaths(result);

  if (
    paths.length >= MIN_INTERNAL_LINKS &&
    countBlogLinks(paths) >= MIN_BLOG_POST_LINKS
  ) {
    return result;
  }

  const pillarPaths = pickPillarPaths(`${content}\n${result}`, paths);
  const relatedBlogs = scoreRelevantBlogs(result, slug, linkableBlogs).slice(
    0,
    Math.max(MIN_BLOG_POST_LINKS, 3)
  );

  const appendix = buildAppendix(pillarPaths, relatedBlogs);
  result = `${result.trim()}\n\n${appendix}\n`;

  return result;
}

const apply = process.argv.includes("--apply");
const slugs = parseSlugs().filter(Boolean);
const db = new Database(dbPath);

const publishedRows = db
  .prepare(
    `SELECT slug, title, description, featured_image AS featuredImage,
            featured_image_alt AS featuredImageAlt, author, publish_date AS publishDate,
            updated_at AS updatedAt
     FROM blogs WHERE locale = 'en' AND published = 1`
  )
  .all();

const linkableBlogs = publishedRows.map((row) => ({
  ...row,
  href: `/blog/${row.slug}`,
  source: "db",
}));

const selectPost = db.prepare(
  `SELECT id, slug, content, title FROM blogs WHERE locale = 'en' AND slug = ?`
);
const updatePost = db.prepare(
  `UPDATE blogs SET content = ?, updated_at = datetime('now') WHERE id = ?`
);

let updated = 0;
let unchanged = 0;
let missing = 0;

console.log(
  apply
    ? "inject-blog-internal-links (apply):"
    : "inject-blog-internal-links (dry run):"
);
console.log(
  `  db: ${dbPath}\n  targets: ${slugs.length} slug(s), link corpus: ${linkableBlogs.length} published EN posts\n`
);

for (const slug of slugs) {
  const row = selectPost.get(slug);
  if (!row) {
    console.log(`  skip (missing): ${slug}`);
    missing += 1;
    continue;
  }

  const content = row.content ?? "";
  const beforePaths = extractQualifyingInternalLinkPaths(content);
  const linked = ensureInternalLinks(content, slug, linkableBlogs);
  const afterPaths = extractQualifyingInternalLinkPaths(linked);

  if (linked === content) {
    console.log(
      `  unchanged ${slug} (${beforePaths.length} links: ${beforePaths.join(", ") || "none"})`
    );
    unchanged += 1;
    continue;
  }

  console.log(
    `  ${apply ? "update" : "would update"} ${slug}: ${beforePaths.length} → ${afterPaths.length} links (${countBlogLinks(beforePaths)} → ${countBlogLinks(afterPaths)} blog)`
  );
  console.log(
    `    added: ${afterPaths.filter((p) => !beforePaths.includes(p)).join(", ")}`
  );

  if (apply) {
    updatePost.run(linked, row.id);
  }
  updated += 1;
}

db.close();

console.log(
  `\n  ${apply ? "updated" : "would update"}: ${updated}, unchanged: ${unchanged}, missing: ${missing}`
);
if (!apply && updated > 0) {
  console.log("  Re-run with --apply to write to cms.sqlite");
}
