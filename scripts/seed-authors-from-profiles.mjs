/**
 * Upsert authors in cms.sqlite from scripts/author-profiles.json
 *
 *   npm run cms:seed-authors
 *   CMS_SQLITE=/path/cms.sqlite npm run cms:seed-authors
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

db.exec(`
  CREATE TABLE IF NOT EXISTS authors (
    slug text PRIMARY KEY,
    name text NOT NULL,
    role text NOT NULL DEFAULT '',
    bio text NOT NULL DEFAULT '',
    avatar_url text,
    linkedin_url text,
    created_at text NOT NULL,
    updated_at text NOT NULL
  );
`);

const upsert = db.prepare(`
  INSERT INTO authors (slug, name, role, bio, avatar_url, linkedin_url, created_at, updated_at)
  VALUES (@slug, @name, @role, @bio, @avatarUrl, @linkedinUrl, @createdAt, @updatedAt)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    role = excluded.role,
    bio = excluded.bio,
    avatar_url = COALESCE(excluded.avatar_url, authors.avatar_url),
    updated_at = excluded.updated_at
`);

let n = 0;
for (const p of profiles) {
  if (!dryRun) {
    upsert.run({
      slug: p.slug,
      name: p.name,
      role: p.role || "",
      bio: p.bio || "",
      avatarUrl: p.avatarUrl ?? null,
      linkedinUrl: p.linkedinUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`${dryRun ? "[dry-run] " : ""}${p.name} (${p.slug})`);
  n++;
}

const pool = db
  .prepare("SELECT name FROM authors ORDER BY name")
  .all()
  .map((r) => r.name);
console.log(`\nAuthors in DB: ${pool.length}`);
db.close();
console.log(dryRun ? `Would upsert ${n} profile(s).` : `Upserted ${n} profile(s).`);
