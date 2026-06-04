/**
 * Re-publish projects after a deploy clobbered published flags.
 * Usage: CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite node scripts/restore-published-projects.mjs
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

/** Slugs confirmed in pre-project-import snapshot + typical same-day publishes. */
const PUBLISH_SLUGS = [
  "agar-solar-project",
  "banda-solar-project",
  "soyegaon-solar-project",
  "yadgir-solar-project-50-mw",
  "kmf-karnataka-75-mw",
  "bachau-dvc-gujrat-300-mw",
];

const db = new Database(dbPath);
const now = new Date().toISOString();
const update = db.prepare(
  `UPDATE projects SET published = 1, updated_at = @now WHERE locale = 'en' AND slug = @slug`
);

let restored = 0;
for (const slug of PUBLISH_SLUGS) {
  const r = update.run({ slug, now });
  if (r.changes > 0) restored += 1;
  else console.warn(`  ⚠️  slug not found: ${slug}`);
}

const pub = db
  .prepare(`SELECT COUNT(*) AS n FROM projects WHERE locale = 'en' AND published = 1`)
  .get().n;

console.log(`Restored published=1 for ${restored} project(s). Total published (en): ${pub}`);
db.close();
