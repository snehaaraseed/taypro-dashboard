/**
 * Set all English projects to draft (published = 0).
 * Use after cms:prepare-deploy -- --skip-publish on production QA.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const db = new Database(dbPath);
const rows = db
  .prepare(`SELECT slug, published FROM projects WHERE locale = 'en'`)
  .all();
const now = new Date().toISOString();
const wasPublished = rows.filter((r) => r.published).length;

if (!dryRun) {
  db.prepare(
    `UPDATE projects SET published = 0, updated_at = @now WHERE locale = 'en'`
  ).run({ now });
}

console.log(
  `${dryRun ? "Would set draft" : "Set draft"}: ${rows.length} English projects` +
    (wasPublished ? ` (${wasPublished} were published)` : "")
);
db.close();
