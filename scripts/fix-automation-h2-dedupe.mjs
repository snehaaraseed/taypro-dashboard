#!/usr/bin/env node
/**
 * Remove exact duplicate H2 blocks from automation posts (writer bug).
 * Does not change slugs or titles.
 *
 *   npx tsx scripts/fix-automation-h2-dedupe.mjs --apply
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dedupeRepeatedH2Sections } from "../src/lib/seo/blog-body-hygiene.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  path.join(root, "data", "cms.sqlite");
const apply = process.argv.includes("--apply");

const db = new Database(dbPath);
const topicMap = new Map();
try {
  for (const row of db.prepare("SELECT slug, category FROM published_topics").all()) {
    topicMap.set(row.slug, row.category ?? "");
  }
} catch {
  // optional
}

const rows = db
  .prepare(
    `SELECT id, slug, title, content, seo_keyword AS seoKeyword
     FROM blogs WHERE locale = 'en' AND published = 1`
  )
  .all()
  .filter((b) => /seo:/i.test(topicMap.get(b.slug) ?? "") || b.seoKeyword?.trim());

const update = db.prepare(
  `UPDATE blogs SET content = ?, updated_at = datetime('now') WHERE id = ?`
);

let fixed = 0;
for (const row of rows) {
  const { html, removedCount } = dedupeRepeatedH2Sections(row.content ?? "");
  if (removedCount === 0) continue;
  console.log(`  ${apply ? "fix" : "would fix"} ${row.slug}: removed ${removedCount} duplicate H2 section(s)`);
  if (apply) update.run(html, row.id);
  fixed++;
}

db.close();
console.log(`\n${apply ? "fixed" : "would fix"}: ${fixed} automation post(s)`);
if (!apply && fixed > 0) console.log("Re-run with --apply to write.");
