#!/usr/bin/env node
/**
 * Assign star codenames to existing English project rows (oldest first).
 * Copies codename to all locale rows for each slug.
 *
 *   node scripts/backfill-project-codenames.mjs
 *   node scripts/backfill-project-codenames.mjs --dry-run
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");
const poolPath = path.join(root, "data", "project-star-codenames.json");
const dryRun = process.argv.includes("--dry-run");

if (!fs.existsSync(dbPath)) {
  console.error(`Missing database: ${dbPath}`);
  process.exit(1);
}
if (!fs.existsSync(poolPath)) {
  console.error(`Missing star pool: ${poolPath}. Run generate-star-codenames.mjs first.`);
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, "utf8")).names;
const db = new Database(dbPath);

const cols = db.prepare("PRAGMA table_info(projects)").all();
if (!cols.some((c) => c.name === "codename")) {
  console.error("projects.codename column missing. Run apply-project-codename-migration.mjs first.");
  process.exit(1);
}

const used = new Set(
  db
    .prepare(
      `SELECT codename FROM projects WHERE locale = 'en' AND codename IS NOT NULL`
    )
    .all()
    .map((row) => row.codename.trim())
);

const needsCodename = db
  .prepare(
    `SELECT slug, title, created_at FROM projects
     WHERE locale = 'en' AND (codename IS NULL OR codename = '')
     ORDER BY datetime(created_at) ASC, id ASC`
  )
  .all();

let poolIndex = 0;
function nextStar() {
  while (poolIndex < pool.length) {
    const name = pool[poolIndex++];
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  return null;
}

const updateAllLocales = db.prepare(
  `UPDATE projects SET codename = ?, updated_at = ? WHERE slug = ?`
);

const now = new Date().toISOString();
let assigned = 0;

for (const row of needsCodename) {
  const star = nextStar();
  if (!star) {
    console.error("Star pool exhausted before backfill completed.");
    process.exit(1);
  }
  if (dryRun) {
    console.log(`[dry-run] ${row.slug} -> Project ${star} — ${row.title}`);
  } else {
    updateAllLocales.run(star, now, row.slug);
    console.log(`Assigned ${star} -> ${row.slug}`);
  }
  assigned++;
}

db.close();
console.log(
  dryRun
    ? `\nDry run: would assign ${assigned} codename(s).`
    : `\nDone. Assigned ${assigned} codename(s).`
);
