#!/usr/bin/env node
/**
 * Safe in-place fixes for legacy EN blogs (no slug changes, no redirects).
 * Preserves URLs and ranking signals; only hygiene + internal links + minor title bugs.
 *
 *   npx tsx scripts/fix-legacy-blogs.mjs              # dry run
 *   npx tsx scripts/fix-legacy-blogs.mjs --apply      # write changes
 *   npx tsx scripts/fix-legacy-blogs.mjs --slug=foo   # single post
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { addInternalLinks } from "../src/app/utils/internalLinking.ts";
import {
  extractQualifyingInternalLinkPaths,
  MIN_BLOG_POST_LINKS,
  MIN_INTERNAL_LINKS,
} from "../src/lib/seo/blog-pillar-links.ts";
import {
  buildDefaultInlineImgAlt,
  dedupeRepeatedH2Sections,
  demoteBodyH1ToH2,
  repairInlineImgAlts,
} from "../src/lib/seo/blog-body-hygiene.ts";
import { sanitizeEmDash } from "../src/lib/seo/content-quality.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

const INJECTION_MARKER = "<!-- taypro-internal-links -->";
const apply = process.argv.includes("--apply");
const slugFilter = process.argv
  .filter((a) => a.startsWith("--slug="))
  .map((a) => a.slice("--slug=".length).trim())
  .filter(Boolean);

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

function isLegacyPost(blog, topicCategory) {
  if (/seo:/i.test(topicCategory ?? "")) return false;
  if (blog.seoKeyword?.trim()) return false;
  return true;
}

function fixTitlePlusArtifact(title) {
  if (!/\s\+\s/.test(title)) return title;
  return title.replace(/\s\+\s/g, ": ");
}

function buildFeaturedAlt(title, seoKeyword) {
  const kw = seoKeyword?.trim();
  if (kw) {
    return `${title}: ${kw} for utility-scale solar in India`.slice(0, 140);
  }
  return `${title} — utility-scale solar panel cleaning in India`.slice(0, 140);
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
    for (const keyword of titleLower.split(/\s+/)) {
      if (keyword.length > 3 && contentLower.includes(keyword)) score += 2;
    }
    if (contentLower.includes("cleaning") && titleLower.includes("cleaning")) score += 2;
    if (contentLower.includes("soiling") && titleLower.includes("soiling")) score += 3;
    if (contentLower.includes("robot") && titleLower.includes("robot")) score += 3;
    if (score > 0) scored.push({ blog, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((item) => item.blog);
}

function countBlogLinks(paths) {
  return paths.filter((p) => p.startsWith("/blog/")).length;
}

function buildAppendix(pillarPaths, relatedBlogs) {
  const parts = [INJECTION_MARKER];
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
  if (content.includes(INJECTION_MARKER)) return content;
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
  return `${result.trim()}\n\n${buildAppendix(pillarPaths, relatedBlogs)}\n`;
}

function sanitizeBody(html, context) {
  let out = sanitizeEmDash(html);
  out = repairInlineImgAlts(demoteBodyH1ToH2(out), context);
  const { html: deduped } = dedupeRepeatedH2Sections(out);
  return deduped;
}

const db = new Database(dbPath);

const topicMap = new Map();
try {
  for (const row of db.prepare("SELECT slug, category FROM published_topics").all()) {
    topicMap.set(row.slug, row.category ?? "");
  }
} catch {
  // optional
}

const allPublished = db
  .prepare(
    `SELECT slug, title, description FROM blogs WHERE locale = 'en' AND published = 1`
  )
  .all()
  .map((row) => ({ ...row, href: `/blog/${row.slug}`, source: "db" }));

let candidates = db
  .prepare(
    `SELECT id, slug, title, description, content, seo_keyword AS seoKeyword,
            featured_image_alt AS featuredImageAlt, published
     FROM blogs WHERE locale = 'en'`
  )
  .all()
  .filter((b) => isLegacyPost(b, topicMap.get(b.slug)));

if (slugFilter.length > 0) {
  const set = new Set(slugFilter);
  candidates = candidates.filter((b) => set.has(b.slug));
}

const updateBlog = db.prepare(
  `UPDATE blogs SET title = ?, description = ?, content = ?,
                    featured_image_alt = ?, updated_at = datetime('now')
   WHERE id = ?`
);

const changes = [];

for (const blog of candidates) {
  const fixes = [];
  const context = { title: blog.title, primaryKeyword: blog.seoKeyword };

  let title = blog.title ?? "";
  let description = blog.description ?? "";
  let content = blog.content ?? "";
  let featuredAlt = blog.featuredImageAlt ?? "";

  const fixedTitle = fixTitlePlusArtifact(title);
  if (fixedTitle !== title) {
    fixes.push("title_plus_artifact");
    title = fixedTitle;
  }

  const sanitized = sanitizeBody(content, { ...context, title });
  if (sanitized !== content) {
    fixes.push("body_hygiene");
    content = sanitized;
  }

  const beforeLinks = extractQualifyingInternalLinkPaths(content).length;
  const linked = ensureInternalLinks(content, blog.slug, allPublished);
  const afterLinks = extractQualifyingInternalLinkPaths(linked).length;
  if (linked !== content) {
    fixes.push(`internal_links:${beforeLinks}->${afterLinks}`);
    content = linked;
  }

  description = sanitizeEmDash(description);

  const needFeaturedAlt = featuredAlt.trim().length < 20;
  if (needFeaturedAlt) {
    featuredAlt = buildFeaturedAlt(title, blog.seoKeyword);
    fixes.push("featured_alt");
  }

  if (fixes.length === 0) continue;

  changes.push({
    slug: blog.slug,
    fixes,
    titleChanged: title !== blog.title,
    descriptionChanged: description !== blog.description,
  });

  if (apply) {
    updateBlog.run(title, description, content, featuredAlt, blog.id);
  }
}

db.close();

console.log(
  apply ? "fix-legacy-blogs (APPLY):" : "fix-legacy-blogs (dry run):"
);
console.log(`  db: ${dbPath}`);
console.log(`  legacy candidates: ${candidates.length}`);
console.log(`  ${apply ? "updated" : "would update"}: ${changes.length}\n`);

for (const c of changes) {
  console.log(`  ${c.slug}`);
  console.log(`    fixes: ${c.fixes.join(", ")}`);
  if (c.titleChanged) console.log(`    title: adjusted (+ artifact fix only)`);
}

if (!apply && changes.length > 0) {
  console.log("\nRe-run with --apply after backup to write changes.");
}
