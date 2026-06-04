/**
 * Assign project authors deterministically by slug (stable across local + production).
 * Does not change content, title, or published flag.
 *
 *   npm run cms:assign-project-authors
 *   npm run cms:assign-project-authors -- --dry-run
 *   CMS_SQLITE=/var/www/.../cms.sqlite npm run cms:assign-project-authors
 *
 * Optional: keep existing author when already set and eligible
 *   npm run cms:assign-project-authors -- --only-missing
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  isEligibleProjectAuthor,
  loadProjectAuthorPool,
  pickAuthorForSlug,
} from "./lib/project-author-pool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const onlyMissing = process.argv.includes("--only-missing");

const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
if (!fs.existsSync(dbPath)) {
  console.error("Missing DB:", dbPath);
  process.exit(1);
}

const db = new Database(dbPath);
const pool = loadProjectAuthorPool(db);
console.log(`Author pool (${pool.length}):`, pool.join(", "));

const rows = db
  .prepare(
    `SELECT slug, author FROM projects WHERE locale = 'en' ORDER BY slug`
  )
  .all();

const update = db.prepare(
  `UPDATE projects SET author = @author, updated_at = @updatedAt
   WHERE slug = @slug AND locale = 'en'`
);
const now = new Date().toISOString();
let changed = 0;
let skipped = 0;
const counts = {};

for (const row of rows) {
  const target = pickAuthorForSlug(row.slug, pool);
  const keep =
    onlyMissing &&
    row.author?.trim() &&
    isEligibleProjectAuthor(row.author) &&
    row.author !== "Taypro Team";
  const author = keep ? row.author.trim() : target;

  counts[author] = (counts[author] || 0) + 1;
  if (author === (row.author || "").trim()) {
    skipped++;
    continue;
  }
  if (!dryRun) {
    update.run({ slug: row.slug, author, updatedAt: now });
  }
  changed++;
}

console.log(`\nProjects: ${rows.length}`);
console.log(`${dryRun ? "Would change" : "Changed"}: ${changed}, unchanged: ${skipped}`);
console.log("\nDistribution:");
for (const [name, c] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${c}\t${name}`);
}

db.close();
