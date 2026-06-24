#!/usr/bin/env node
/**
 * Replace legacy/truncated blog hrefs inside CMS HTML with canonical slugs.
 *
 *   node scripts/fix-broken-blog-internal-links.mjs
 *   node scripts/fix-broken-blog-internal-links.mjs --apply
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() || path.join(root, "data", "cms.sqlite");
const apply = process.argv.includes("--apply");

/** Longest paths first so partial replacements do not run twice. */
const HREF_REPLACEMENTS = [
  [
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
  ],
  [
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india",
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
  ],
  [
    "/blog/the-importance-of-regular-solar-panel-cleaning-for-efficiency",
    "/blog/the-crucial-role-of-regular-solar-panel-cleaning-for-efficiency-keeping-performance-high-in-a-dusty-world",
  ],
  [
    "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-drops",
    "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-starts-dropping",
  ],
  [
    "/blog/what-are-the-different-types-of-solar-panels-2",
    "/blog/what-are-the-different-types-of-solar-panels",
  ],
  [
    "/blog/what-are-the-best-practices-of-cleaning-solar-pane",
    "/blog/what-are-the-best-practices-of-cleaning-solar-panels",
  ],
  [
    "/blog/how-does-a-solar-panel-cleaning-robot-work-/",
    "/blog/how-does-a-solar-panel-cleaning-robot-work",
  ],
  [
    "/blog/how-does-a-solar-panel-cleaning-robot-work-",
    "/blog/how-does-a-solar-panel-cleaning-robot-work",
  ],
  [
    "/blog/what-is-solar-panel-cleaning",
    "/blog/what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels",
  ],
  [
    "/renewable-energy/how-to-make-solar-panels-more-efficient",
    "/blog/how-to-make-solar-panels-more-efficient",
  ],
  [
    "/renewable-energy/how-to-make-solar-panels-more-efficient/",
    "/blog/how-to-make-solar-panels-more-efficient",
  ],
].sort((a, b) => b[0].length - a[0].length);

function fixContent(html) {
  let out = html;
  let changes = 0;
  for (const [from, to] of HREF_REPLACEMENTS) {
    if (from === to) continue;
    if (!out.includes(from)) continue;
    const parts = out.split(from);
    changes += parts.length - 1;
    out = parts.join(to);
  }
  return { out, changes };
}

const db = new Database(dbPath);
const rows = db
  .prepare(`SELECT id, slug, locale, content FROM blogs`)
  .all();
const update = db.prepare(
  `UPDATE blogs SET content = ?, updated_at = datetime('now') WHERE id = ?`
);

let touched = 0;
let totalReplacements = 0;

console.log(
  apply
    ? "fix-broken-blog-internal-links (APPLY):"
    : "fix-broken-blog-internal-links (dry run):"
);

for (const row of rows) {
  const { out, changes } = fixContent(row.content || "");
  if (changes === 0) continue;
  touched += 1;
  totalReplacements += changes;
  console.log(`  ${row.slug} [${row.locale}] ${changes} replacement(s)`);
  if (apply) update.run(out, row.id);
}

db.close();
console.log(
  `  ${touched} row(s), ${totalReplacements} href replacement(s)${apply ? "" : " (dry run)"}`
);
if (!apply) console.log("  Re-run with --apply to write.");
