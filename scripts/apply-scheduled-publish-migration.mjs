#!/usr/bin/env node
/**
 * Idempotent: add blogs.scheduled_publish_at if missing (deploy safety net).
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
  const cols = db.prepare("PRAGMA table_info(blogs)").all();
  const has = cols.some((c) => c.name === "scheduled_publish_at");
  if (has) {
    console.log("  blogs.scheduled_publish_at: already present");
  } else {
    db.exec("ALTER TABLE blogs ADD COLUMN scheduled_publish_at TEXT;");
    console.log("  blogs.scheduled_publish_at: added");
  }
  db.close();
}

console.log("Scheduled publish column migration:");
for (const rel of ["data/cms.sqlite", ".next/standalone/data/cms.sqlite"]) {
  migrateDb(path.join(root, rel));
}
console.log("\nDone.");
