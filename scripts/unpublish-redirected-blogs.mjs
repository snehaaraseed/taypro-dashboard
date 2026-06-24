#!/usr/bin/env node
/**
 * Unpublish blog slugs that 301 to canonical winners (SEO-020).
 *   node scripts/unpublish-redirected-blogs.mjs           # dry run
 *   node scripts/unpublish-redirected-blogs.mjs --apply
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() || path.join(root, "data", "cms.sqlite");
const apply = process.argv.includes("--apply");

const SLUGS = [
  "what-is-the-solar-panel-efficiency-in-2025",
];

const db = new Database(dbPath);
const select = db.prepare(
  `SELECT slug, locale, published FROM blogs WHERE slug = ?`
);
const unpublish = db.prepare(
  `UPDATE blogs SET published = 0, updated_at = datetime('now') WHERE slug = ?`
);

console.log(
  apply ? "unpublish-redirected-blogs (APPLY):" : "unpublish-redirected-blogs (dry run):"
);

for (const slug of SLUGS) {
  const rows = select.all(slug);
  if (rows.length === 0) {
    console.log(`  skip missing: ${slug}`);
    continue;
  }
  for (const row of rows) {
    console.log(
      `  ${apply ? "unpublish" : "would unpublish"} ${slug} [${row.locale}] published=${row.published}`
    );
  }
  if (apply) unpublish.run(slug);
}

db.close();
if (!apply) console.log("  Re-run with --apply to write.");
