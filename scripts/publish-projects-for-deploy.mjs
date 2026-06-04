/**
 * Publish English projects ready for deploy (excludes UNPUBLISH_SLUGS set).
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UNPUBLISH_SLUGS } from "./lib/project-deploy-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const db = new Database(dbPath);
const slugs = db
  .prepare(`SELECT slug FROM projects WHERE locale = 'en'`)
  .all()
  .map((r) => r.slug);

const toPublish = slugs.filter((s) => !UNPUBLISH_SLUGS.has(s));
const now = new Date().toISOString();

if (!dryRun) {
  const stmt = db.prepare(
    `UPDATE projects SET published = 1, updated_at = @now WHERE locale = 'en' AND slug = @slug`
  );
  for (const slug of toPublish) stmt.run({ slug, now });
}

const held = slugs.filter((s) => UNPUBLISH_SLUGS.has(s));
console.log(
  `${dryRun ? "Would publish" : "Published"}: ${toPublish.length}, kept draft: ${held.length}`
);
if (held.length) console.log("Draft:", held.join(", "));
db.close();
