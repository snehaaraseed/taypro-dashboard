#!/usr/bin/env node
/**
 * Apply hand-written blog rewrites from data/manual-blog-rewrites/*.json
 * Content is authored manually; this only writes to cms.sqlite.
 *
 *   node scripts/apply-manual-blog-rewrites.mjs           # dry run
 *   node scripts/apply-manual-blog-rewrites.mjs --apply
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "data", "manual-blog-rewrites");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  path.join(root, "data", "cms.sqlite");
const apply = process.argv.includes("--apply");
const slugFilter = process.argv
  .find((a) => a.startsWith("--slug="))
  ?.slice("--slug=".length)
  .trim();

if (!fs.existsSync(dir)) {
  console.error(`Missing directory: ${dir}`);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const db = new Database(dbPath);

const selectBlog = db.prepare(
  `SELECT id, slug, title, featured_image AS featuredImage, featured_image_alt AS featuredImageAlt
   FROM blogs WHERE slug = ? AND locale = 'en'`
);
const updateBlog = db.prepare(
  `UPDATE blogs SET title = ?, description = ?, content = ?, faqs = ?, seo_keyword = ?,
                    featured_image_alt = CASE WHEN length(trim(?)) >= 20 THEN ? ELSE featured_image_alt END,
                    updated_at = datetime('now')
   WHERE id = ?`
);

let updated = 0;
let missing = 0;

console.log(apply ? "apply-manual-blog-rewrites (APPLY):" : "apply-manual-blog-rewrites (dry run):");
console.log(`  files: ${files.length}\n`);

for (const file of files.sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  if (slugFilter && data.slug !== slugFilter) continue;
  const row = selectBlog.get(data.slug);
  if (!row) {
    console.log(`  skip missing: ${data.slug}`);
    missing++;
    continue;
  }

  const faqsJson = JSON.stringify(data.faqs ?? []);
  const featuredAlt =
    data.featuredImageAlt ||
    `${data.title} — utility-scale solar panel cleaning in India`.slice(0, 140);

  console.log(`  ${apply ? "update" : "would update"} ${data.slug}`);
  console.log(`    title: ${data.title.slice(0, 72)}${data.title.length > 72 ? "…" : ""}`);
  console.log(`    seo: ${data.seoKeyword}`);
  console.log(`    faqs: ${(data.faqs ?? []).length}`);

  if (apply) {
    updateBlog.run(
      data.title,
      data.description,
      data.content,
      faqsJson,
      data.seoKeyword,
      featuredAlt,
      featuredAlt,
      row.id
    );

    try {
      const cat = `seo:${data.seoKeyword}|manual-rewrite-2026`;
      const existing = db
        .prepare("SELECT slug FROM published_topics WHERE slug = ?")
        .get(data.slug);
      if (existing) {
        db.prepare(
          `UPDATE published_topics SET title = ?, category = ? WHERE slug = ?`
        ).run(data.title, cat, data.slug);
      } else {
        db.prepare(
          `INSERT INTO published_topics (slug, title, category) VALUES (?, ?, ?)`
        ).run(data.slug, data.title, cat);
      }
    } catch (e) {
      console.warn(`    published_topics skip: ${e.message}`);
    }
  }
  updated++;
}

db.close();
console.log(`\n  ${apply ? "updated" : "would update"}: ${updated}, missing: ${missing}`);
if (!apply && updated > 0) console.log("  Re-run with --apply to write.");
