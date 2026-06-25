/**
 * Batch improve legacy project content via admin API (preserves published + images).
 *
 *   npm run cms:improve-projects -- --dry-run --limit 3
 *   CMS_IMPROVE_BASE_URL=http://localhost:3000 CMS_IMPROVE_SESSION="admin-auth=..." \
 *     npm run cms:improve-projects -- --status legacy --retranslate-published-only
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.includes("--limit")
  ? Number(process.argv[process.argv.indexOf("--limit") + 1])
  : 0;
const statusFilter = process.argv.includes("--status")
  ? process.argv[process.argv.indexOf("--status") + 1]
  : "legacy";
const retranslatePublished = process.argv.includes(
  "--retranslate-published-only"
);

const base = process.env.CMS_IMPROVE_BASE_URL || "http://localhost:3000";
const cookie = process.env.CMS_IMPROVE_SESSION || "";

const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const db = new Database(dbPath);

const rows = db
  .prepare(
    `SELECT slug, title, length(content) AS content_len, published, editorial_status
     FROM projects WHERE locale = 'en' AND editorial_status = ?
     ORDER BY slug`
  )
  .all(statusFilter);

const slice = limitArg > 0 ? rows.slice(0, limitArg) : rows;
const report = [];

async function improveSlug(slug, published) {
  const res = await fetch(`${base}/api/admin/project/${slug}/improve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({
      retranslate: retranslatePublished && published === 1,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

for (const row of slice) {
  if (dryRun) {
    report.push({
      slug: row.slug,
      action: "would-improve",
      words: row.content_len,
    });
    console.log(`would improve ${row.slug}`);
    continue;
  }

  if (!cookie) {
    console.error(
      "Set CMS_IMPROVE_SESSION admin cookie for live improve (dry-run OK without it)."
    );
    process.exit(1);
  }

  try {
    await improveSlug(row.slug, row.published);
    report.push({ slug: row.slug, action: "improved", published: row.published });
    console.log(`improved ${row.slug}`);
  } catch (e) {
    report.push({
      slug: row.slug,
      action: "error",
      error: e instanceof Error ? e.message : String(e),
    });
    console.error(`failed ${row.slug}:`, e);
  }
}

const outPath = path.join(root, "data", "improve-projects-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`Report: ${outPath} (${report.length} entries)`);
db.close();
