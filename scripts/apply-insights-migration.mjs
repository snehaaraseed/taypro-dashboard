#!/usr/bin/env node
/**
 * Idempotent: create insights table if missing (deploy safety net).
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function migrateDb(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log(`  skip (missing): ${dbPath}`);
    return;
  }
  console.log(`\n${dbPath}`);
  const db = new Database(dbPath);
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insights'")
    .all();
  if (tables.length > 0) {
    console.log("  insights table: already present");
    db.close();
    return;
  }

  db.exec(`
    CREATE TABLE insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      slug TEXT NOT NULL,
      locale TEXT DEFAULT 'en' NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT DEFAULT '' NOT NULL,
      report_type TEXT DEFAULT 'category_pulse' NOT NULL,
      period TEXT,
      metrics_json TEXT DEFAULT '{}' NOT NULL,
      publish_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      published INTEGER DEFAULT 1 NOT NULL
    );
    CREATE UNIQUE INDEX insights_slug_locale_unique ON insights (slug, locale);
  `);
  console.log("  insights table: created");
  db.close();
}

console.log("Insights table migration:");
for (const rel of ["data/cms.sqlite", ".next/standalone/data/cms.sqlite"]) {
  migrateDb(path.join(root, rel));
}
console.log("\nDone.");
