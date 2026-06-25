/**
 * Audit project content quality against tier word-count policy.
 *   node scripts/audit-project-content-quality.mjs
 *   node scripts/audit-project-content-quality.mjs --status legacy
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const statusFilter = process.argv.includes("--status")
  ? process.argv[process.argv.indexOf("--status") + 1]
  : null;

function countWords(html) {
  const plain = html.replace(/<[^>]+>/g, " ");
  return plain.split(/\s+/).filter(Boolean).length;
}

function countH2(html) {
  return (html.match(/<h2\b/gi) || []).length;
}

function parseMw(factsRaw) {
  if (!factsRaw) return 0;
  try {
    const f = JSON.parse(factsRaw);
    const n = Number(f.capacityMw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function tierFor(mw, editorialStatus, slug) {
  if (editorialStatus === "flagship") return "flagship";
  if (mw >= 150) return "flagship";
  if (mw >= 75) return "mega";
  if (mw >= 15) return "mid";
  return "compact";
}

const POLICY = {
  flagship: { min: 1800, max: 3500, h2Min: 7, h2Max: 8 },
  mega: { min: 1200, max: 2500, h2Min: 7, h2Max: 8 },
  mid: { min: 900, max: 1800, h2Min: 6, h2Max: 7 },
  compact: { min: 650, max: 1300, h2Min: 5, h2Max: 6 },
};

const db = new Database(dbPath);
const rows = db
  .prepare(
    `SELECT slug, title, content, editorial_status, facts_json, published
     FROM projects WHERE locale = 'en'`
  )
  .all();

const issues = [];

for (const row of rows) {
  if (statusFilter && row.editorial_status !== statusFilter) continue;
  const mw = parseMw(row.facts_json);
  const tier = tierFor(mw, row.editorial_status, row.slug);
  const p = POLICY[tier];
  const words = countWords(row.content || "");
  const h2 = countH2(row.content || "");
  const rowIssues = [];
  if (words < p.min) rowIssues.push(`short:${words}<${p.min}`);
  if (words > p.max) rowIssues.push(`long:${words}>${p.max}`);
  if (h2 < p.h2Min) rowIssues.push(`h2few:${h2}`);
  if (h2 > p.h2Max) rowIssues.push(`h2many:${h2}`);
  if (!/<table\b/i.test(row.content || "")) rowIssues.push("no-table");
  if (rowIssues.length) {
    issues.push({
      slug: row.slug,
      tier,
      words,
      h2,
      published: row.published,
      issues: rowIssues,
    });
  }
}

console.log(`Audited ${rows.length} English projects; ${issues.length} with issues.`);
for (const i of issues.slice(0, 30)) {
  console.log(`  ${i.slug} [${i.tier}] ${i.words}w ${i.h2}h2 — ${i.issues.join(", ")}`);
}
if (issues.length > 30) console.log(`  ... +${issues.length - 30} more`);

db.close();
