/**
 * Replace blog author "Taypro Team" with a random name from the authors table.
 * One author per slug (all locales get the same name).
 *
 * Usage:
 *   node scripts/assign-random-blog-authors.mjs
 *   node scripts/assign-random-blog-authors.mjs --dry-run
 *   CMS_SQLITE=/path/cms.sqlite node scripts/assign-random-blog-authors.mjs
 *   node scripts/assign-random-blog-authors.mjs --also-standalone
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const alsoStandalone = process.argv.includes("--also-standalone");

const EXCLUDED_AUTHOR_NAMES = new Set([
  "taypro team",
  "taypro",
  "",
  "suraj kadam",
]);

function isEligibleAuthor(name) {
  return !EXCLUDED_AUTHOR_NAMES.has(String(name || "").trim().toLowerCase());
}

function loadAuthorPool(db) {
  const rows = db.prepare("SELECT name FROM authors ORDER BY name").all();
  const pool = rows
    .map((r) => r.name?.trim())
    .filter((name) => name && isEligibleAuthor(name));
  if (pool.length === 0) {
    throw new Error("No authors in authors table (add authors in /admin/authors first).");
  }
  return pool;
}

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function processDb(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log(`Skip: ${dbPath} (not found)`);
    return { updated: 0, slugs: 0 };
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const pool = loadAuthorPool(db);
  console.log(`\n${dbPath}: ${pool.length} author(s) in pool`);

  const slugs = db
    .prepare(
      `SELECT DISTINCT slug FROM blogs
       WHERE LOWER(TRIM(author)) IN ('taypro team', 'taypro', '')`
    )
    .all()
    .map((r) => r.slug);

  if (slugs.length === 0) {
    const teamCount = db
      .prepare(
        `SELECT COUNT(*) AS n FROM blogs WHERE LOWER(TRIM(author)) = 'taypro team'`
      )
      .get().n;
    console.log(`  No slugs to update (taypro team rows: ${teamCount})`);
    db.close();
    return { updated: 0, slugs: 0 };
  }

  const update = db.prepare(
    `UPDATE blogs SET author = @author, updated_at = @updatedAt WHERE slug = @slug`
  );

  let rowUpdates = 0;
  const now = new Date().toISOString();
  const assignments = [];

  for (const slug of slugs) {
    const author = pickRandom(pool);
    assignments.push({ slug, author });
    if (!dryRun) {
      const info = update.run({ slug, author, updatedAt: now });
      rowUpdates += info.changes;
    }
  }

  console.log(
    `  ${dryRun ? "[dry-run] would assign" : "Assigned"} ${slugs.length} slug(s), ${dryRun ? "(rows not counted)" : `${rowUpdates} row(s) updated`}`
  );
  for (const { slug, author } of assignments.slice(0, 15)) {
    console.log(`    ${slug} → ${author}`);
  }
  if (assignments.length > 15) {
    console.log(`    … and ${assignments.length - 15} more`);
  }

  const remaining = db
    .prepare(
      `SELECT COUNT(*) AS n FROM blogs WHERE LOWER(TRIM(author)) IN ('taypro team', 'taypro', '')`
    )
    .get().n;
  console.log(`  Remaining generic author rows: ${remaining}`);

  db.close();
  return { updated: rowUpdates, slugs: slugs.length };
}

const dbPaths = [
  process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite"),
];
if (alsoStandalone) {
  dbPaths.push(path.join(root, ".next/standalone/data/cms.sqlite"));
}

console.log(dryRun ? "DRY RUN — no writes" : "Updating blog authors…");
let total = 0;
for (const p of dbPaths) {
  const r = processDb(p);
  total += r.updated;
}
console.log(`\nDone.${dryRun ? "" : ` Total rows updated: ${total}`}`);
