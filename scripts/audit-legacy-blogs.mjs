#!/usr/bin/env node
/**
 * Audit EN blogs for safe legacy fixes (no slug/title changes unless flagged).
 *
 *   npx tsx scripts/audit-legacy-blogs.mjs
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import {
  countDuplicateH2Headings,
  splitHtmlByH2Sections,
} from "../src/lib/seo/blog-body-hygiene.ts";
import { extractQualifyingInternalLinkPaths } from "../src/lib/seo/blog-pillar-links.ts";
import { isTooGenericDescription } from "../src/lib/seo/content-quality.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

const db = new Database(dbPath, { readonly: true });

const topicRows = new Map();
try {
  for (const row of db.prepare("SELECT slug, category FROM published_topics").all()) {
    topicRows.set(row.slug, row.category ?? "");
  }
} catch {
  // optional
}

const blogs = db
  .prepare(
    `SELECT id, slug, title, description, content, seo_keyword AS seoKeyword,
            publish_date AS publishDate, published, featured_image_alt AS featuredImageAlt
     FROM blogs WHERE locale = 'en'`
  )
  .all();

db.close();

function isLegacyPost(blog) {
  const category = topicRows.get(blog.slug) ?? "";
  if (/seo:/i.test(category)) return false;
  if (blog.seoKeyword?.trim()) return false;
  return true;
}

function hasBodyH1(html) {
  return /<h1\b/i.test(html);
}

function shortImgAltIssue(html) {
  const imgRe = /<img\b[^>]*>/gi;
  let match;
  while ((match = imgRe.exec(html)) !== null) {
    const tag = match[0] ?? "";
    const altMatch = tag.match(/\balt\s*=\s*["']([^"']*)["']/i);
    const alt = altMatch?.[1]?.trim() ?? "";
    if (alt.length < 20) return true;
  }
  return false;
}

function titleHasPlusArtifact(title) {
  return /\s\+\s/.test(title);
}

function descriptionIssue(desc) {
  const d = (desc ?? "").trim();
  if (d.length < 100) return "short";
  if (isTooGenericDescription(d)) return "generic";
  return null;
}

const issues = [];
const legacy = [];
const automation = [];

for (const blog of blogs) {
  const legacyFlag = isLegacyPost(blog);
  const entry = {
    slug: blog.slug,
    title: blog.title,
    published: !!blog.published,
    publishDate: blog.publishDate,
    legacy: legacyFlag,
    problems: [],
  };

  if (legacyFlag) legacy.push(blog.slug);
  else automation.push(blog.slug);

  if (titleHasPlusArtifact(blog.title)) {
    entry.problems.push("title_plus_artifact");
  }
  if (hasBodyH1(blog.content ?? "")) {
    entry.problems.push("body_h1");
  }
  const dupH2 = countDuplicateH2Headings(blog.content ?? "");
  if (dupH2 > 0) {
    entry.problems.push(`duplicate_h2:${dupH2}`);
  }
  const { sections } = splitHtmlByH2Sections(blog.content ?? "");
  if (sections.length >= 8 && sections.length % 2 === 0) {
    entry.problems.push("possible_mirrored_block");
  }
  if (shortImgAltIssue(blog.content ?? "")) {
    entry.problems.push("short_img_alt");
  }
  const descIssue = descriptionIssue(blog.description);
  if (descIssue) {
    entry.problems.push(`description_${descIssue}`);
  }
  const linkCount = extractQualifyingInternalLinkPaths(blog.content ?? "").length;
  if (linkCount < 3) {
    entry.problems.push(`low_internal_links:${linkCount}`);
  }
  const alt = (blog.featuredImageAlt ?? "").trim();
  if (alt.length < 20) {
    entry.problems.push("short_featured_alt");
  }

  if (entry.problems.length > 0) {
    issues.push(entry);
  }
}

const legacyWithIssues = issues.filter((i) => i.legacy);
const automationWithIssues = issues.filter((i) => !i.legacy);

console.log(`Database: ${dbPath}`);
console.log(`EN blogs: ${blogs.length} (${legacy.length} legacy, ${automation.length} automation)`);
console.log(`Posts with fixable issues: ${issues.length}`);
console.log(`  legacy: ${legacyWithIssues.length}`);
console.log(`  automation: ${automationWithIssues.length}`);
console.log("");

const problemCounts = {};
for (const e of issues) {
  for (const p of e.problems) {
    const key = p.split(":")[0];
    problemCounts[key] = (problemCounts[key] ?? 0) + 1;
  }
}
console.log("Issue breakdown:");
for (const [k, v] of Object.entries(problemCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}

console.log("\n--- Legacy posts needing fixes ---");
for (const e of legacyWithIssues.sort((a, b) => b.problems.length - a.problems.length)) {
  console.log(`\n${e.slug}`);
  console.log(`  title: ${e.title.slice(0, 90)}${e.title.length > 90 ? "…" : ""}`);
  console.log(`  problems: ${e.problems.join(", ")}`);
}
