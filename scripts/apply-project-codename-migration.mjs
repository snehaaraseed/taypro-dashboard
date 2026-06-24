#!/usr/bin/env node
/**
 * Idempotent: add projects.codename + partial unique index if missing.
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
  const cols = db.prepare("PRAGMA table_info(projects)").all();
  const hasCodename = cols.some((c) => c.name === "codename");
  if (hasCodename) {
    console.log("  projects.codename: already present");
  } else {
    db.exec("ALTER TABLE projects ADD COLUMN codename TEXT;");
    console.log("  projects.codename: added");
  }

  const indexes = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
    .all();
  const hasIndex = indexes.some((i) => i.name === "projects_codename_en_unique");
  if (hasIndex) {
    console.log("  projects_codename_en_unique: already present");
  } else {
    db.exec(
      "CREATE UNIQUE INDEX projects_codename_en_unique ON projects (codename) WHERE locale = 'en' AND codename IS NOT NULL;"
    );
    console.log("  projects_codename_en_unique: created");
  }
  db.close();
}

console.log("Project codename migration:");
for (const rel of ["data/cms.sqlite", ".next/standalone/data/cms.sqlite"]) {
  migrateDb(path.join(root, rel));
}
console.log("\nDone.");
