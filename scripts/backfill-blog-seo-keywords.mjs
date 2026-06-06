#!/usr/bin/env node
/**
 * Backfill blogs.seo_keyword from published_topics.category (seo:… segment).
 *
 *   npm run seo:backfill-blog-seo-keywords
 *   npm run seo:backfill-blog-seo-keywords -- --dry-run
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

const dryRun = process.argv.includes("--dry-run");

function parseSeoKeyword(category) {
  const match = (category ?? "").match(/seo:([^|]+)/i);
  return match?.[1]?.trim().toLowerCase() ?? null;
}

const db = new Database(dbPath);
const topics = db
  .prepare(
    "SELECT slug, category FROM published_topics WHERE category IS NOT NULL AND category != ''"
  )
  .all();

const update = db.prepare(
  `UPDATE blogs SET seo_keyword = ? WHERE slug = ? AND locale = 'en' AND (seo_keyword IS NULL OR trim(seo_keyword) = '')`
);

let updated = 0;
let skipped = 0;
let noBlog = 0;

for (const topic of topics) {
  const keyword = parseSeoKeyword(topic.category);
  if (!keyword) {
    skipped += 1;
    continue;
  }
  if (dryRun) {
    const row = db
      .prepare(
        "SELECT id, seo_keyword FROM blogs WHERE slug = ? AND locale = 'en' LIMIT 1"
      )
      .get(topic.slug);
    if (!row) {
      noBlog += 1;
      continue;
    }
    if (row.seo_keyword?.trim()) {
      skipped += 1;
      continue;
    }
    console.log(`  would set ${topic.slug} → "${keyword}"`);
    updated += 1;
    continue;
  }
  const result = update.run(keyword, topic.slug);
  if (result.changes > 0) {
    updated += 1;
  } else {
    const row = db
      .prepare("SELECT seo_keyword FROM blogs WHERE slug = ? AND locale = 'en' LIMIT 1")
      .get(topic.slug);
    if (!row) noBlog += 1;
    else skipped += 1;
  }
}

const withKeyword = db
  .prepare(
    "SELECT COUNT(*) AS n FROM blogs WHERE locale = 'en' AND seo_keyword IS NOT NULL AND trim(seo_keyword) != ''"
  )
  .get().n;

db.close();

console.log(
  dryRun ? "seo:backfill-blog-seo-keywords (dry run):" : "seo:backfill-blog-seo-keywords:"
);
console.log(`  topics scanned: ${topics.length}`);
console.log(`  ${dryRun ? "would update" : "updated"}: ${updated}`);
console.log(`  skipped (no seo: or already set): ${skipped}`);
console.log(`  no EN blog row: ${noBlog}`);
console.log(`  EN blogs with seo_keyword now: ${withKeyword}`);
