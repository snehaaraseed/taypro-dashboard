#!/usr/bin/env node
/**
 * Idempotent: add blogs.seo_keyword if missing (deploy safety net).
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
  const has = cols.some((c) => c.name === "seo_keyword");
  if (has) {
    console.log("  blogs.seo_keyword: already present");
  } else {
    db.exec("ALTER TABLE blogs ADD COLUMN seo_keyword TEXT;");
    console.log("  blogs.seo_keyword: added");
  }
  db.close();
}

console.log("SEO keyword column migration:");
for (const rel of ["data/cms.sqlite", ".next/standalone/data/cms.sqlite"]) {
  migrateDb(path.join(root, rel));
}
console.log("\nDone.");
