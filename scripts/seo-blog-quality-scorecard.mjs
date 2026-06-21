#!/usr/bin/env node
/**
 * SEO quality scorecard for all EN published blogs (production CMS).
 *   npx tsx scripts/seo-blog-quality-scorecard.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stripHtmlToPlainText } from "../src/lib/seo/blog-similarity.ts";
import {
  extractQualifyingInternalLinkPaths,
  MIN_BLOG_POST_LINKS,
  MIN_INTERNAL_LINKS,
} from "../src/lib/seo/blog-pillar-links.ts";
import {
  isTooGenericDescription,
  isTooGenericTitle,
} from "../src/lib/seo/content-quality.ts";
import { extractH2Headings } from "../src/lib/seo/blog-similarity.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");

const db = new Database(dbPath, { readonly: true });

const topicMap = new Map();
try {
  for (const row of db.prepare("SELECT slug, category, h2_outline FROM published_topics").all()) {
    topicMap.set(row.slug, row);
  }
} catch {
  // optional
}

const blogs = db
  .prepare(
    `SELECT slug, title, description, content, faqs, seo_keyword AS seoKeyword,
            publish_date AS publishDate, published, featured_image_alt AS featuredImageAlt
     FROM blogs WHERE locale = 'en' AND published = 1`
  )
  .all();

db.close();

function wordCount(html) {
  return stripHtmlToPlainText(html).split(/\s+/).filter(Boolean).length;
}

function parseFaqs(raw) {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function isLegacy(slug, seoKeyword) {
  const cat = topicMap.get(slug)?.category ?? "";
  if (/seo:/i.test(cat)) return false;
  if (seoKeyword?.trim()) return false;
  return true;
}

function hasQuickAnswer(h2s) {
  return h2s.some((h) => /quick answer|summary for plant managers/i.test(h));
}

function hasQuestionH2(h2s) {
  return h2s.some((h) => /\b(how|what|which|when|why|should|does|worth)\b/i.test(h));
}

function hasTable(html) {
  return /<table\b/i.test(html);
}

const scores = [];
const buckets = { legacy: [], automation: [] };

for (const blog of blogs) {
  const legacy = isLegacy(blog.slug, blog.seoKeyword);
  const h2s = extractH2Headings(blog.content ?? "");
  const words = wordCount(blog.content ?? "");
  const faqs = parseFaqs(blog.faqs);
  const links = extractQualifyingInternalLinkPaths(blog.content ?? "");
  const blogLinks = links.filter((p) => p.startsWith("/blog/")).length;
  const kw = blog.seoKeyword?.trim() || "";

  let pts = 0;
  const max = 100;
  const notes = [];

  // Title (15)
  if (!isTooGenericTitle(blog.title, kw || undefined)) pts += 15;
  else {
    notes.push("generic_title");
    if (blog.title.length >= 30) pts += 6;
  }

  // Meta description (10)
  const desc = (blog.description ?? "").trim();
  if (desc.length >= 120 && desc.length <= 165 && !isTooGenericDescription(desc)) pts += 10;
  else if (desc.length >= 80 && !isTooGenericDescription(desc)) pts += 6;
  else notes.push("weak_meta");

  // Depth (15)
  if (words >= 1800) pts += 15;
  else if (words >= 1200) pts += 12;
  else if (words >= 800) pts += 8;
  else if (words >= 400) pts += 4;
  else notes.push("thin");

  // Structure (15)
  let struct = 0;
  if (h2s.length >= 6) struct += 5;
  else if (h2s.length >= 4) struct += 3;
  if (hasQuickAnswer(h2s)) struct += 4;
  if (hasQuestionH2(h2s)) struct += 3;
  if (hasTable(blog.content)) struct += 3;
  pts += Math.min(15, struct);
  if (struct < 8) notes.push("weak_structure");

  // Internal links (15)
  if (links.length >= MIN_INTERNAL_LINKS && blogLinks >= MIN_BLOG_POST_LINKS) pts += 15;
  else if (links.length >= 3) pts += 10;
  else if (links.length >= 1) pts += 5;
  else notes.push("no_links");

  // FAQs schema (10)
  if (faqs.length >= 4) pts += 10;
  else if (faqs.length >= 2) pts += 6;
  else if (faqs.length >= 1) pts += 3;
  else notes.push("no_faqs");

  // Keyword targeting (10)
  if (kw) pts += 5;
  if (/seo:/i.test(topicMap.get(blog.slug)?.category ?? "")) pts += 5;
  else if (!legacy) pts += 3;
  else notes.push("no_seo_keyword");

  // Technical hygiene (10)
  let hyg = 10;
  if (/<h1\b/i.test(blog.content ?? "")) hyg -= 3;
  if ((blog.featuredImageAlt ?? "").trim().length < 20) hyg -= 2;
  if (new Set(h2s).size < h2s.length) hyg -= 4;
  pts += Math.max(0, hyg);

  const pct = pts / max;
  const entry = {
    slug: blog.slug,
    title: blog.title.slice(0, 70),
    legacy,
    words,
    h2Count: h2s.length,
    links: links.length,
    blogLinks,
    faqs: faqs.length,
    seoKeyword: kw,
    score: Math.round(pct * 10 * 10) / 10,
    notes,
  };
  scores.push(entry);
  (legacy ? buckets.legacy : buckets.automation).push(entry);
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, x) => s + x.score, 0) / arr.length;
}

scores.sort((a, b) => a.score - b.score);

const overall = avg(scores);
const legacyAvg = avg(buckets.legacy);
const autoAvg = avg(buckets.automation);

const band = (s) =>
  s >= 8 ? "strong" : s >= 6.5 ? "decent" : s >= 5 ? "weak" : "poor";

console.log("=== Taypro EN Blog SEO Scorecard (production CMS) ===\n");
console.log(`Published posts: ${scores.length}`);
console.log(`  Legacy: ${buckets.legacy.length}  |  Automation: ${buckets.automation.length}`);
console.log("");
console.log(`Overall SEO score:     ${overall.toFixed(1)} / 10  (${band(overall)})`);
console.log(`Legacy average:        ${legacyAvg.toFixed(1)} / 10`);
console.log(`Automation average:    ${autoAvg.toFixed(1)} / 10`);
console.log("");

const dist = { strong: 0, decent: 0, weak: 0, poor: 0 };
for (const s of scores) dist[band(s.score)]++;
console.log("Distribution:");
console.log(`  8.0+ strong:  ${dist.strong}`);
console.log(`  6.5-7.9 decent: ${dist.decent}`);
console.log(`  5.0-6.4 weak:   ${dist.weak}`);
console.log(`  <5.0 poor:    ${dist.poor}`);
console.log("");

const issueCounts = {};
for (const s of scores) {
  for (const n of s.notes) issueCounts[n] = (issueCounts[n] ?? 0) + 1;
}
console.log("Top issue tags:");
for (const [k, v] of Object.entries(issueCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
console.log("");

console.log("--- Bottom 10 (weakest SEO) ---");
for (const s of scores.slice(0, 10)) {
  console.log(`  ${s.score}/10  ${s.slug}`);
  console.log(`         ${s.notes.join(", ") || "ok"}`);
}

console.log("\n--- Top 10 (strongest SEO) ---");
for (const s of [...scores].sort((a, b) => b.score - a.score).slice(0, 10)) {
  console.log(`  ${s.score}/10  ${s.slug}`);
}

// Intent registry if present
const registryPath = path.join(root, "data", "seo-keyword-intent-registry.json");
if (fs.existsSync(registryPath)) {
  const reg = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const byKw = reg.byKeyword ?? reg.keywords ?? reg;
  const keywords = Object.keys(byKw).filter(
    (k) => !["description", "updatedAt"].includes(k)
  );
  let complete = 0;
  for (const k of keywords) {
    const intents = byKw[k];
    if (Array.isArray(intents) && intents.length >= 5) complete++;
  }
  console.log(
    `\nIntent clusters: ${keywords.length} keywords tracked, ${complete} with 5+ intent records`
  );
}
