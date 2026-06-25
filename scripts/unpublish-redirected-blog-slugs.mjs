#!/usr/bin/env node
/**
 * Unpublish CMS blog rows whose slugs 301 to a canonical winner.
 * Usage: CMS_SQLITE=/path/to/cms.sqlite node scripts/unpublish-redirected-blog-slugs.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

if (!fs.existsSync(dbPath)) {
  console.error(`CMS DB not found: ${dbPath}`);
  process.exit(1);
}

const slugs = JSON.parse(
  execSync(
    `npx tsx -e "import { REDIRECTED_BLOG_SLUGS } from './src/lib/seo/redirected-blog-slugs.ts'; console.log(JSON.stringify([...REDIRECTED_BLOG_SLUGS]));"`,
    { cwd: root, encoding: "utf8" }
  )
);

const db = new Database(dbPath);
const stmt = db.prepare(
  "UPDATE blogs SET published = 0 WHERE slug = ? AND published != 0"
);

let total = 0;
for (const slug of slugs) {
  const result = stmt.run(slug);
  total += result.changes;
  if (result.changes) {
    console.log(`Unpublished ${result.changes} row(s) for ${slug}`);
  }
}

console.log(`Done. ${total} redirected blog row(s) unpublished.`);
