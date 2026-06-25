#!/usr/bin/env node
/**
 * Unpublish draft project slugs in CMS (all locales).
 * Usage: CMS_SQLITE=/path/to/cms.sqlite node scripts/unpublish-draft-cms-slugs.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const DRAFT_SLUGS = ["yavatmal-undarni-7-mw"];

if (!fs.existsSync(dbPath)) {
  console.error(`CMS DB not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);
const stmt = db.prepare(
  "UPDATE projects SET published = 0 WHERE slug = ? AND published != 0"
);

let total = 0;
for (const slug of DRAFT_SLUGS) {
  const result = stmt.run(slug);
  total += result.changes;
  if (result.changes) {
    console.log(`Unpublished ${result.changes} row(s) for ${slug}`);
  }
}

console.log(`Done. ${total} project row(s) unpublished.`);
