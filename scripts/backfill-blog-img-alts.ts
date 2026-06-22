#!/usr/bin/env node
/**
 * Backfill missing/short inline <img> alt text in CMS blog HTML.
 *
 *   npm run seo:backfill-blog-img-alts
 *   npm run seo:backfill-blog-img-alts -- --dry-run
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import {
  findInlineImgAltIssue,
  repairInlineImgAlts,
} from "../src/lib/seo/blog-body-hygiene";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

const dryRun = process.argv.includes("--dry-run");

const db = new Database(dbPath);
const rows = db
  .prepare(
    "SELECT id, slug, locale, title, seo_keyword, content FROM blogs WHERE content LIKE '%<img%'"
  )
  .all() as Array<{
  id: number;
  slug: string;
  locale: string;
  title: string;
  seo_keyword: string | null;
  content: string;
}>;

const update = db.prepare(
  "UPDATE blogs SET content = ?, updated_at = ? WHERE id = ?"
);

let updated = 0;
let skipped = 0;
const now = new Date().toISOString();

for (const row of rows) {
  const issue = findInlineImgAltIssue(row.content);
  if (!issue) {
    skipped += 1;
    continue;
  }

  const repaired = repairInlineImgAlts(row.content, {
    title: row.title,
    primaryKeyword: row.seo_keyword,
  });

  if (repaired === row.content) {
    skipped += 1;
    continue;
  }

  if (dryRun) {
    console.log(`  would repair ${row.slug} (${row.locale}) — ${issue}`);
    updated += 1;
    continue;
  }

  update.run(repaired, now, row.id);
  updated += 1;
}

console.log(
  dryRun
    ? `[dry-run] Would update ${updated} blog row(s); ${skipped} already OK.`
    : `Updated ${updated} blog row(s); ${skipped} already OK.`
);
