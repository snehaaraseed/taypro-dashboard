/**
 * Set expertise_tags on authors where empty (infer from role + bio).
 *
 *   npm run cms:backfill-author-expertise
 *   npm run cms:backfill-author-expertise -- --dry-run
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

const dryRun = process.argv.includes("--dry-run");

const ROLE_BIO_RULES = [
  {
    pattern: /product|growth|strategy|commercial|sales|marketing/i,
    tags: ["roi-cost", "robot-products", "industry-trends"],
  },
  {
    pattern: /engineer|technical|r&d|design|hardware|software/i,
    tags: ["technical", "robot-products", "cleaning-methods"],
  },
  {
    pattern: /o&m|operations|plant|asset|maintenance|scada/i,
    tags: ["om-operations", "field-service"],
  },
  {
    pattern: /service|field|deployment|commission|install/i,
    tags: ["field-service", "installation"],
  },
  {
    pattern: /finance|roi|cost|analyst/i,
    tags: ["roi-cost"],
  },
];

function inferTags(role, bio, name) {
  const text = `${role} ${bio} ${name}`.toLowerCase();
  const found = new Set();
  for (const rule of ROLE_BIO_RULES) {
    if (rule.pattern.test(text)) {
      for (const t of rule.tags) found.add(t);
    }
  }
  if (found.size === 0) {
    return ["om-operations", "cleaning-methods"];
  }
  return [...found];
}

const db = new Database(dbPath);
const hasCol = db
  .prepare(
    "SELECT 1 FROM pragma_table_info('authors') WHERE name = 'expertise_tags'"
  )
  .get();

if (!hasCol) {
  console.error(
    "Column expertise_tags missing. Run the app once to apply drizzle migration 0009."
  );
  process.exit(1);
}

const rows = db
  .prepare("SELECT slug, name, role, bio, expertise_tags FROM authors")
  .all();

let updated = 0;
for (const row of rows) {
  let current = [];
  try {
    current = JSON.parse(row.expertise_tags || "[]");
  } catch {
    current = [];
  }
  if (Array.isArray(current) && current.length > 0) {
    continue;
  }
  const tags = inferTags(row.role, row.bio, row.name);
  const json = JSON.stringify(tags);
  console.log(`${row.slug}: ${json}`);
  if (!dryRun) {
    db.prepare(
      "UPDATE authors SET expertise_tags = ?, updated_at = ? WHERE slug = ?"
    ).run(json, new Date().toISOString(), row.slug);
  }
  updated += 1;
}

console.log(
  dryRun
    ? `DRY RUN — would update ${updated} author(s)`
    : `Updated expertise_tags on ${updated} author(s)`
);
