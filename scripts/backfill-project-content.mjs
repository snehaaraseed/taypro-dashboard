/**
 * Copy HTML body from legacy static project pages into cms.sqlite.
 * Run before deleting src/app/projects/<slug>/page.tsx folders.
 *   node scripts/backfill-project-content.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");

const LEGACY_PAGES = [
  "agar-solar-project",
  "banda-solar-project",
  "soyegaon-solar-project",
  "yadgir-solar-project-50-mw",
];

function extractContent(source) {
  const quoted = source.match(/content=\{("(?:\\.|[^"\\])*")\}/);
  if (quoted) {
    return JSON.parse(quoted[1]);
  }
  const backtick = source.match(/content=\{\s*`([\s\S]*?)`\s*\}/);
  if (backtick) {
    return backtick[1]
      .replace(/\\n/g, "\n")
      .replace(/\\`/g, "`")
      .replace(/\\\$/g, "$")
      .replace(/\\\\/g, "\\");
  }
  return null;
}

if (!fs.existsSync(dbPath)) {
  console.error("Missing data/cms.sqlite, run npm run cms:migrate first");
  process.exit(1);
}

const db = new Database(dbPath);
const update = db.prepare(
  `UPDATE projects SET content = @content, updated_at = @updatedAt
   WHERE slug = @slug AND (content IS NULL OR content = '')`
);

const now = new Date().toISOString();
let updated = 0;

for (const slug of LEGACY_PAGES) {
  const pagePath = path.join(root, "src", "app", "projects", slug, "page.tsx");
  if (!fs.existsSync(pagePath)) {
    console.warn(`Skip ${slug}: no page.tsx`);
    continue;
  }
  const source = fs.readFileSync(pagePath, "utf8");
  const content = extractContent(source);
  if (!content?.trim()) {
    console.warn(`Skip ${slug}: could not extract content`);
    continue;
  }
  const result = update.run({ slug, content, updatedAt: now });
  if (result.changes) {
    updated++;
    console.log(`Updated ${slug} (${content.length} chars)`);
  } else {
    const row = db
      .prepare("SELECT length(content) AS len FROM projects WHERE slug = ?")
      .get(slug);
    console.log(`Skipped ${slug} (already has ${row?.len ?? 0} chars)`);
  }
}

db.close();
console.log(`Done. ${updated} project(s) backfilled.`);
