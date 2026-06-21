#!/usr/bin/env node
/**
 * Apply full rewrites (data/weak-blog-fixes/) and patches (data/blog-quality-patches/).
 *
 *   node scripts/apply-blog-quality-fixes.mjs
 *   node scripts/apply-blog-quality-fixes.mjs --apply
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const fullDir = path.join(root, "data", "weak-blog-fixes");
const patchDir = path.join(root, "data", "blog-quality-patches");
const dbPath = process.env.CMS_SQLITE?.trim() || path.join(root, "data", "cms.sqlite");
const apply = process.argv.includes("--apply");

function loadJsonDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

function hasQuickAnswer(html) {
  return /<h2[^>]*>[\s\S]*?(?:quick answer|summary for plant managers)/i.test(html || "");
}

function prependIfMissing(content, block) {
  if (!block?.trim()) return content;
  if (hasQuickAnswer(content)) return content;
  const firstP = content.match(/^(\s*<p>[\s\S]*?<\/p>)/i);
  if (firstP) {
    return content.replace(firstP[0], `${firstP[0]}\n\n${block.trim()}\n\n`);
  }
  return `${block.trim()}\n\n${content}`;
}

const db = new Database(dbPath);
const selectBlog = db.prepare(`SELECT id, slug, content FROM blogs WHERE slug = ? AND locale = 'en'`);
const updateBlog = db.prepare(
  `UPDATE blogs SET title = ?, description = ?, content = ?, faqs = ?, seo_keyword = ?,
                    updated_at = datetime('now') WHERE id = ?`
);
const patchBlog = db.prepare(
  `UPDATE blogs SET title = ?, description = ?, content = ?, faqs = ?, seo_keyword = ?,
                    updated_at = datetime('now') WHERE id = ?`
);

let fullCount = 0;
let patchCount = 0;

for (const data of loadJsonDir(fullDir)) {
  const row = selectBlog.get(data.slug);
  if (!row) {
    console.log(`  skip missing full: ${data.slug}`);
    continue;
  }
  console.log(`${apply ? "full" : "dry"} ${data.slug}`);
  if (apply) {
    updateBlog.run(
      data.title,
      data.description,
      data.content,
      JSON.stringify(data.faqs ?? []),
      data.seoKeyword,
      row.id
    );
  }
  fullCount++;
}

for (const patch of loadJsonDir(patchDir)) {
  const row = selectBlog.get(patch.slug);
  if (!row) {
    console.log(`  skip missing patch: ${patch.slug}`);
    continue;
  }
  const cur = db
    .prepare(`SELECT title, description, content, faqs, seo_keyword FROM blogs WHERE id = ?`)
    .get(row.id);

  let content = cur.content;
  if (patch.prependContent) content = prependIfMissing(content, patch.prependContent);
  if (patch.appendContent) content = `${content.trim()}\n\n${patch.appendContent.trim()}`;
  if (patch.content) content = patch.content;

  const title = patch.title ?? cur.title;
  const description = patch.description ?? cur.description;
  const seoKeyword = patch.seoKeyword ?? cur.seo_keyword;
  const faqs = patch.faqs ? JSON.stringify(patch.faqs) : cur.faqs;

  console.log(`${apply ? "patch" : "dry-patch"} ${patch.slug}`);
  if (apply) {
    patchBlog.run(title, description, content, faqs, seoKeyword, row.id);
  }
  patchCount++;
}

db.close();
console.log(`\n${apply ? "Applied" : "Would apply"}: ${fullCount} full, ${patchCount} patches`);
