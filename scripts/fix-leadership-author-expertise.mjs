/**
 * Narrow over-broad expertise_tags on leadership / generalist bylines.
 *
 *   npm run cms:fix-leadership-author-expertise
 *   npm run cms:fix-leadership-author-expertise -- --dry-run
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

/** slug → focused lanes (CEO/strategy pieces, not every O&M topic). */
const LEADERSHIP_TAG_OVERRIDES = {
  "yogesh-kudale": ["roi-cost", "industry-trends", "robot-products"],
};

const MAX_EXPERTISE_TAGS = 4;

const db = new Database(dbPath);
const now = new Date().toISOString();

let updated = 0;
for (const [slug, tags] of Object.entries(LEADERSHIP_TAG_OVERRIDES)) {
  const row = db
    .prepare("SELECT slug, name, expertise_tags FROM authors WHERE slug = ?")
    .get(slug);
  if (!row) {
    console.warn(`Skip ${slug}: author not found`);
    continue;
  }
  const json = JSON.stringify(tags);
  let current = [];
  try {
    current = JSON.parse(row.expertise_tags || "[]");
  } catch {
    current = [];
  }
  if (JSON.stringify(current) === json) {
    console.log(`${row.name}: already ${json}`);
    continue;
  }
  console.log(`${row.name}: ${JSON.stringify(current)} → ${json}`);
  if (!dryRun) {
    db.prepare(
      "UPDATE authors SET expertise_tags = ?, updated_at = ? WHERE slug = ?"
    ).run(json, now, slug);
  }
  updated += 1;
}

const rows = db
  .prepare("SELECT slug, name, expertise_tags FROM authors")
  .all();

for (const row of rows) {
  if (LEADERSHIP_TAG_OVERRIDES[row.slug]) continue;
  let current = [];
  try {
    current = JSON.parse(row.expertise_tags || "[]");
  } catch {
    continue;
  }
  if (!Array.isArray(current) || current.length <= MAX_EXPERTISE_TAGS) continue;
  const trimmed = current.slice(0, MAX_EXPERTISE_TAGS);
  const json = JSON.stringify(trimmed);
  console.log(
    `${row.name}: cap ${current.length} tags → ${json}`
  );
  if (!dryRun) {
    db.prepare(
      "UPDATE authors SET expertise_tags = ?, updated_at = ? WHERE slug = ?"
    ).run(json, now, row.slug);
  }
  updated += 1;
}

console.log(
  dryRun
    ? `DRY RUN — would update ${updated} author(s)`
    : `Updated expertise_tags on ${updated} author(s)`
);
