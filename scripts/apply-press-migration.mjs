#!/usr/bin/env node
/**
 * Idempotent: create press_releases + press_submissions tables if missing.
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

  const releaseTables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='press_releases'"
    )
    .all();
  if (releaseTables.length === 0) {
    db.exec(`
      CREATE TABLE press_releases (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug TEXT NOT NULL,
        locale TEXT DEFAULT 'en' NOT NULL,
        title TEXT NOT NULL,
        subhead TEXT DEFAULT '' NOT NULL,
        dateline TEXT DEFAULT '' NOT NULL,
        content TEXT DEFAULT '' NOT NULL,
        boilerplate TEXT DEFAULT '' NOT NULL,
        contact_json TEXT DEFAULT '{}' NOT NULL,
        quotes_json TEXT DEFAULT '[]' NOT NULL,
        featured_image TEXT DEFAULT '' NOT NULL,
        status TEXT DEFAULT 'draft' NOT NULL,
        source TEXT DEFAULT 'queue' NOT NULL,
        queue_key TEXT,
        publish_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        published INTEGER DEFAULT 0 NOT NULL
      );
      CREATE UNIQUE INDEX press_releases_slug_locale_unique ON press_releases (slug, locale);
    `);
    console.log("  press_releases table: created");
  } else {
    console.log("  press_releases table: already present");
  }

  const submissionTables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='press_submissions'"
    )
    .all();
  if (submissionTables.length === 0) {
    db.exec(`
      CREATE TABLE press_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        release_slug TEXT NOT NULL,
        target_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        external_url TEXT,
        backlink_type TEXT DEFAULT 'unknown' NOT NULL,
        submitted_at TEXT,
        notes TEXT DEFAULT '' NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
      CREATE UNIQUE INDEX press_submissions_release_target_unique ON press_submissions (release_slug, target_id);
    `);
    console.log("  press_submissions table: created");
  } else {
    console.log("  press_submissions table: already present");
  }

  db.close();
}

console.log("Press release tables migration:");
for (const rel of ["data/cms.sqlite", ".next/standalone/data/cms.sqlite"]) {
  migrateDb(path.join(root, rel));
}
console.log("\nDone.");
