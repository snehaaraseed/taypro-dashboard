/**
 * Update author role + bio in cms.sqlite from scripts/author-profiles.json
 *
 * Usage:
 *   node scripts/update-author-bios.mjs
 *   node scripts/update-author-bios.mjs --dry-run
 *   CMS_SQLITE=/path/cms.sqlite node scripts/update-author-bios.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const profiles = JSON.parse(
  fs.readFileSync(path.join(__dirname, "author-profiles.json"), "utf8")
);

const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
if (!fs.existsSync(dbPath)) {
  console.error("Missing DB:", dbPath);
  process.exit(1);
}

const db = new Database(dbPath);
const now = new Date().toISOString();
const update = db.prepare(`
  UPDATE authors
  SET
    name = @name,
    role = @role,
    bio = @bio,
    avatar_url = COALESCE(@avatarUrl, avatar_url),
    updated_at = @updatedAt
  WHERE slug = @slug
`);

let updated = 0;
let missing = 0;

for (const p of profiles) {
  const row = db.prepare("SELECT slug FROM authors WHERE slug = ?").get(p.slug);
  if (!row) {
    console.warn("  skip (not in DB):", p.slug);
    missing += 1;
    continue;
  }
  if (!dryRun) {
    update.run({
      slug: p.slug,
      name: p.name,
      role: p.role,
      bio: p.bio,
      avatarUrl: p.avatarUrl ?? null,
      updatedAt: now,
    });
  }
  console.log(`${dryRun ? "[dry-run] " : ""}${p.name}`);
  console.log(`  role: ${p.role}`);
  console.log(`  bio: ${p.bio.slice(0, 90)}…`);
  updated += 1;
}

db.close();
console.log(
  `\n${dryRun ? "Would update" : "Updated"} ${updated} author(s). Missing slugs: ${missing}.`
);
