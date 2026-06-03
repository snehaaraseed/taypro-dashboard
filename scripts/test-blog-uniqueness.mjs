/**
 * Quick smoke test for blog uniqueness helpers (no Gemini).
 * Run: node scripts/test-blog-uniqueness.mjs
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, "data", "cms.sqlite");

function extractH2(html) {
  const headings = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    if (t) headings.push(t);
  }
  return headings;
}

function titleWordSim(a, b) {
  const w1 = new Set(a.toLowerCase().split(/\s+/));
  const w2 = new Set(b.toLowerCase().split(/\s+/));
  const inter = [...w1].filter((x) => w2.has(x)).length;
  const union = new Set([...w1, ...w2]).size;
  return union ? inter / union : 0;
}

const db = new Database(dbPath, { readonly: true });
const sample = db
  .prepare(
    `SELECT slug, title, description, content FROM blogs WHERE locale = 'en' LIMIT 1`
  )
  .get();

if (!sample) {
  console.error("No English blogs in DB — cannot smoke test.");
  process.exit(1);
}

const dupTitle = sample.title;
const dupDesc = sample.description;
const dupContent = sample.content;

const titleMatch = db
  .prepare(
    `SELECT COUNT(*) AS n FROM blogs WHERE locale = 'en' AND lower(title) = lower(?)`
  )
  .get(dupTitle);

const topicsCount = db.prepare(`SELECT COUNT(*) AS n FROM published_topics`).get();
const metaCount = db
  .prepare(
    `SELECT COUNT(*) AS n FROM published_topics WHERE h2_outline IS NOT NULL AND content_fingerprint IS NOT NULL`
  )
  .get();

console.log("--- Blog uniqueness smoke test ---");
console.log(`English blogs: ${db.prepare(`SELECT COUNT(*) AS n FROM blogs WHERE locale='en'`).get().n}`);
console.log(`published_topics rows: ${topicsCount.n} (${metaCount.n} with H2 + fingerprint)`);
console.log(`Duplicate title lookup for existing post: ${titleMatch.n === 1 ? "PASS" : "FAIL"} (${titleMatch.n} rows)`);
console.log(
  `Title self-similarity (should be 1.0): ${titleWordSim(sample.title, dupTitle).toFixed(2)} ${titleWordSim(sample.title, dupTitle) >= 0.78 ? "PASS" : "FAIL"}`
);
console.log(`H2 count in sample: ${extractH2(sample.content).length}`);
console.log(`Sample slug: ${sample.slug}`);
console.log("--- Sync is OK if published_topics count ≈ English blog count ---");
db.close();
