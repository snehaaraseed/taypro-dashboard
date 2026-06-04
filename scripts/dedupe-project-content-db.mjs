/**
 * Remove duplicate "Operations evidence summary" blocks from CMS project HTML.
 * Run on production: CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite node scripts/dedupe-project-content-db.mjs
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import {
  countOperationsEvidenceBlocks,
  dedupeOperationsEvidenceSummary,
} from "./lib/dedupe-operations-evidence-summary.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const db = new Database(dbPath);
const rows = db
  .prepare(`SELECT slug, content FROM projects WHERE locale = 'en'`)
  .all();
const update = db.prepare(
  `UPDATE projects SET content = @content, updated_at = @now WHERE slug = @slug AND locale = 'en'`
);
const now = new Date().toISOString();
let fixed = 0;

for (const row of rows) {
  const before = countOperationsEvidenceBlocks(row.content || "");
  if (before <= 1) continue;
  const content = dedupeOperationsEvidenceSummary(row.content);
  const after = countOperationsEvidenceBlocks(content);
  if (after !== 1) {
    console.warn(`  ⚠️  ${row.slug}: still ${after} blocks`);
    continue;
  }
  if (!dryRun) {
    update.run({ slug: row.slug, content, now });
  }
  fixed += 1;
  console.log(`${dryRun ? "would fix" : "fixed"} ${row.slug}: ${before} → ${after} blocks`);
}

console.log(`${dryRun ? "Would update" : "Updated"} ${fixed} project(s).`);
db.close();
