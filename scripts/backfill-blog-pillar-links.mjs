#!/usr/bin/env node
/**
 * Append contextual pillar internal links to published EN blog posts that lack them.
 *
 *   node scripts/backfill-blog-pillar-links.mjs           # dry run (default)
 *   node scripts/backfill-blog-pillar-links.mjs --apply
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

const apply = process.argv.includes("--apply");
const dryRun = !apply;

/** Keep in sync with src/lib/seo/blog-pillar-links.ts */
const BLOG_PILLAR_LINK_PATHS = [
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-robot-price-calculator",
  "/solar-panel-cleaning-robot-price-india",
  "/cleaning-technology",
  "/compare/taypro-vs-solabot",
  "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
  "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
  "/compare/waterless-vs-water-based-solar-cleaning",
  "/solar-panel-cleaning-robot-rajasthan",
  "/solar-panel-cleaning-robot-gujarat",
  "/solar-panel-cleaning-robot-karnataka",
  "/solar-panel-cleaning-robot-maharashtra",
  "/solar-panel-cleaning-machine",
];

const PILLAR_SET = new Set(BLOG_PILLAR_LINK_PATHS);

const PILLAR_ANCHORS = {
  "/solar-panel-cleaning-system": "solar panel cleaning robots and models",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system":
    "GLYDE automatic solar panel cleaning robot",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service":
    "Taypro robotic solar panel cleaning service",
  "/solar-panel-cleaning-robot-price-calculator":
    "solar panel cleaning robot ROI calculator",
  "/solar-panel-cleaning-robot-price-india":
    "solar panel cleaning robot price guide for India",
  "/cleaning-technology": "Taypro waterless solar panel cleaning technology",
  "/compare/taypro-vs-solabot": "Taypro vs Solabot comparison",
  "/compare/taypro-vs-indian-solar-cleaning-robot-companies":
    "Taypro vs Indian solar cleaning robot companies",
  "/compare/solar-panel-cleaning-robot-vs-manual-cleaning":
    "robotic vs manual solar panel cleaning",
  "/compare/waterless-vs-water-based-solar-cleaning":
    "waterless vs water-based solar cleaning",
  "/solar-panel-cleaning-robot-rajasthan":
    "solar panel cleaning robots in Rajasthan",
  "/solar-panel-cleaning-robot-gujarat":
    "solar panel cleaning robots in Gujarat",
  "/solar-panel-cleaning-robot-karnataka":
    "solar panel cleaning robots in Karnataka",
  "/solar-panel-cleaning-robot-maharashtra":
    "solar panel cleaning robots in Maharashtra",
  "/solar-panel-cleaning-machine": "solar panel cleaning machines in India",
};

const INJECTION_MARKER = "<!-- taypro-pillar-links -->";

const KEYWORD_RULES = [
  { re: /\bsolabot\b/i, path: "/compare/taypro-vs-solabot" },
  {
    re: /\b(manual|wet wash|brush crew|labour)\b/i,
    path: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
  },
  {
    re: /\b(waterless|dry clean|dual-pass)\b/i,
    path: "/compare/waterless-vs-water-based-solar-cleaning",
  },
  {
    re: /\b(cleaning machine|panel cleaning machine)\b/i,
    path: "/solar-panel-cleaning-machine",
  },
  { re: /\b rajasthan\b/i, path: "/solar-panel-cleaning-robot-rajasthan" },
  { re: /\b gujarat\b/i, path: "/solar-panel-cleaning-robot-gujarat" },
  { re: /\b karnataka\b/i, path: "/solar-panel-cleaning-robot-karnataka" },
  { re: /\b maharashtra\b/i, path: "/solar-panel-cleaning-robot-maharashtra" },
  { re: /\b(price|cost|capex|opex|roi)\b/i, path: "/solar-panel-cleaning-robot-price-india" },
  { re: /\b(service|opex|amc)\b/i, path: "/solar-panel-cleaning-system/solar-panel-cleaning-service" },
  { re: /\b(glyde|dual-pass|microfiber)\b/i, path: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system" },
];

const DEFAULT_PATHS = [
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-robot-price-india",
  "/cleaning-technology",
];

function normalizeHref(href) {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return null;
  const withoutFragment = trimmed.split("#")[0] ?? trimmed;
  return withoutFragment.length > 1 && withoutFragment.endsWith("/")
    ? withoutFragment.slice(0, -1)
    : withoutFragment;
}

function extractPillarPaths(html) {
  const seen = new Set();
  const re = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const normalized = normalizeHref(match[1] ?? "");
    if (normalized && PILLAR_SET.has(normalized)) seen.add(normalized);
  }
  return seen;
}

function pickLinksToAdd(content, existing) {
  const toAdd = [];
  const haystack = content.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (toAdd.length >= 3) break;
    if (!rule.re.test(haystack)) continue;
    if (existing.has(rule.path) || toAdd.includes(rule.path)) continue;
    toAdd.push(rule.path);
  }

  for (const path of DEFAULT_PATHS) {
    if (toAdd.length >= 3) break;
    if (existing.has(path) || toAdd.includes(path)) continue;
    toAdd.push(path);
  }

  return toAdd.slice(0, 3);
}

function buildInjectionBlock(paths) {
  const items = paths
    .map(
      (p) =>
        `<li><a href="${p}">${PILLAR_ANCHORS[p] ?? p}</a></li>`
    )
    .join("\n");
  return `${INJECTION_MARKER}
<h2>Related resources</h2>
<p>For procurement and O&amp;M teams evaluating robotic cleaning in India:</p>
<ul>
${items}
</ul>`;
}

const db = new Database(dbPath);
const rows = db
  .prepare(
    `SELECT id, slug, title, content FROM blogs
     WHERE locale = 'en' AND published = 1`
  )
  .all();

const update = db.prepare(
  `UPDATE blogs SET content = ?, updated_at = datetime('now') WHERE id = ?`
);

let wouldUpdate = 0;
let skipped = 0;
let alreadyMarked = 0;

for (const row of rows) {
  const content = row.content ?? "";
  if (content.includes(INJECTION_MARKER)) {
    alreadyMarked += 1;
    continue;
  }

  const existing = extractPillarPaths(content);
  if (existing.size >= 2) {
    skipped += 1;
    continue;
  }

  const paths = pickLinksToAdd(`${row.title}\n${content}`, existing);
  if (paths.length === 0) {
    skipped += 1;
    continue;
  }

  const block = buildInjectionBlock(paths);
  const nextContent = `${content.trim()}\n\n${block}\n`;

  if (dryRun) {
    console.log(`  would update ${row.slug} → ${paths.join(", ")}`);
  } else {
    update.run(nextContent, row.id);
    console.log(`  updated ${row.slug} → ${paths.join(", ")}`);
  }
  wouldUpdate += 1;
}

db.close();

console.log(
  dryRun ? "backfill-blog-pillar-links (dry run):" : "backfill-blog-pillar-links:"
);
console.log(`  EN published posts: ${rows.length}`);
console.log(`  ${dryRun ? "would update" : "updated"}: ${wouldUpdate}`);
console.log(`  skipped (≥2 pillar links): ${skipped}`);
console.log(`  already injected: ${alreadyMarked}`);
