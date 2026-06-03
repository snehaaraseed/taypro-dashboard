#!/usr/bin/env node
/**
 * Check blog counts when opening cms.sqlite with sibling WAL files.
 * Usage: node scripts/recover-cms-wal-check.mjs <dir-with-cms.sqlite>
 */
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node recover-cms-wal-check.mjs <data-dir>");
  process.exit(1);
}

const main = path.join(dir, "cms.sqlite");
const wal = path.join(dir, "cms.sqlite-wal");
const shm = path.join(dir, "cms.sqlite-shm");

if (!fs.existsSync(main)) {
  console.error("Missing", main);
  process.exit(1);
}

console.log("dir:", dir);
console.log("main:", fs.statSync(main).size);
console.log("wal:", fs.existsSync(wal) ? fs.statSync(wal).size : "none");
console.log("shm:", fs.existsSync(shm) ? fs.statSync(shm).size : "none");

const db = new Database(main);
try {
  const ic = db.prepare("PRAGMA integrity_check").get().integrity_check;
  const n = db.prepare("SELECT COUNT(*) AS n FROM blogs").get().n;
  const loc = db.prepare("SELECT locale, COUNT(*) AS c FROM blogs GROUP BY locale").all();
  console.log("integrity:", ic === "ok" ? "OK" : "FAIL");
  console.log("blogs:", n);
  console.log("by locale:", loc);
} finally {
  db.close();
}
