#!/usr/bin/env node
/** Unpublish static playbook — Insights hub is monthly deep research only. */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SLUG = "solar-cleaning-procurement-playbook-2026";

const dbPath = process.env.CMS_DATABASE_PATH?.trim()
  ? path.resolve(process.env.CMS_DATABASE_PATH)
  : path.join(root, "data", "cms.sqlite");

if (!fs.existsSync(dbPath)) {
  console.log("No database — nothing to unpublish.");
  process.exit(0);
}

const db = new Database(dbPath);
const result = db
  .prepare(
    "UPDATE insights SET published = 0, updated_at = ? WHERE slug = ? AND report_type = 'playbook'"
  )
  .run(new Date().toISOString(), SLUG);

db.close();
console.log(`Unpublished playbook (${result.changes} row(s)).`);
