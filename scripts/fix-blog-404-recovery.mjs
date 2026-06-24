#!/usr/bin/env node
/**
 * Restore ranking blog URLs: republish cannibalization losers, fix trailing-dash slug,
 * apply weak-blog content where available.
 *
 *   node scripts/fix-blog-404-recovery.mjs           # dry run
 *   node scripts/fix-blog-404-recovery.mjs --apply
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() || path.join(root, "data", "cms.sqlite");
const apply = process.argv.includes("--apply");

const REPUBLISH_SLUGS = ["what-are-the-different-types-of-solar-panels"];

const SLUG_RENAMES = [
  {
    from: "how-does-a-solar-panel-cleaning-robot-work-",
    to: "how-does-a-solar-panel-cleaning-robot-work",
  },
];

function loadWeakBlogFix(slug) {
  const file = path.join(root, "data", "weak-blog-fixes", `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const db = new Database(dbPath);

const republish = db.prepare(
  `UPDATE blogs SET published = 1, updated_at = datetime('now') WHERE slug = ?`
);
const renameSlug = db.prepare(
  `UPDATE blogs SET slug = ?, updated_at = datetime('now') WHERE slug = ?`
);
const updateContent = db.prepare(
  `UPDATE blogs SET title = ?, description = ?, content = ?, faqs = ?, seo_keyword = ?,
                    updated_at = datetime('now')
   WHERE slug = ? AND locale = 'en'`
);

console.log(
  apply ? "fix-blog-404-recovery (APPLY):" : "fix-blog-404-recovery (dry run):"
);

for (const slug of REPUBLISH_SLUGS) {
  const rows = db
    .prepare(`SELECT locale, published FROM blogs WHERE slug = ?`)
    .all(slug);
  if (rows.length === 0) {
    console.log(`  skip missing slug: ${slug}`);
    continue;
  }
  for (const row of rows) {
    console.log(
      `  ${apply ? "republish" : "would republish"} ${slug} [${row.locale}] published=${row.published}`
    );
  }
  const patch = loadWeakBlogFix(slug);
  if (patch) {
    console.log(`  ${apply ? "apply" : "would apply"} weak-blog-fix content for ${slug}`);
    if (apply) {
      updateContent.run(
        patch.title,
        patch.description,
        patch.content,
        JSON.stringify(patch.faqs ?? []),
        patch.seoKeyword ?? null,
        slug
      );
    }
  }
  if (apply) republish.run(slug);
}

for (const { from, to } of SLUG_RENAMES) {
  const rows = db
    .prepare(`SELECT locale, published FROM blogs WHERE slug = ?`)
    .all(from);
  if (rows.length === 0) {
    console.log(`  skip rename (missing): ${from}`);
    continue;
  }
  const conflict = db
    .prepare(`SELECT COUNT(*) AS n FROM blogs WHERE slug = ?`)
    .get(to);
  if (conflict?.n > 0) {
    console.log(`  skip rename ${from} → ${to} (target exists)`);
    continue;
  }
  console.log(
    `  ${apply ? "rename" : "would rename"} ${from} → ${to} (${rows.length} rows)`
  );
  if (apply) renameSlug.run(to, from);
}

db.close();
if (!apply) console.log("  Re-run with --apply to write.");
