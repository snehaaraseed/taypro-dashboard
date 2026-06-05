/**
 * CMS content metrics for deploy safety checks.
 * Usage: node scripts/deploy-cms-metrics.mjs [path/to/cms.sqlite]
 * Output: JSON to stdout
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.argv[2] ||
  process.env.CMS_SQLITE ||
  path.join(root, "data", "cms.sqlite");
const uploadsDir =
  process.env.CMS_UPLOADS_DIR || path.join(root, "public", "uploads");

function countUploadFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full);
      else n += 1;
    }
  };
  walk(dir);
  return n;
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(JSON.stringify({ error: `missing ${dbPath}` }));
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });
  const ic = db.prepare("PRAGMA integrity_check").get().integrity_check;
  if (ic !== "ok") {
    console.error(JSON.stringify({ error: `integrity_check: ${ic}` }));
    process.exit(1);
  }

  const blogsTotal = db.prepare("SELECT COUNT(*) AS n FROM blogs").get().n;
  const blogsEnPublished = db
    .prepare(
      "SELECT COUNT(*) AS n FROM blogs WHERE locale = 'en' AND published = 1"
    )
    .get().n;
  const projectsEn = db
    .prepare("SELECT COUNT(*) AS n FROM projects WHERE locale = 'en'")
    .get().n;
  const projectsEnPublished = db
    .prepare(
      "SELECT COUNT(*) AS n FROM projects WHERE locale = 'en' AND published = 1"
    )
    .get().n;
  const authors = db.prepare("SELECT COUNT(*) AS n FROM authors").get().n;
  let uploadsRows = 0;
  try {
    uploadsRows = db.prepare("SELECT COUNT(*) AS n FROM uploads").get().n;
  } catch {
    uploadsRows = 0;
  }

  db.close();

  const metrics = {
    capturedAt: new Date().toISOString(),
    dbPath,
    blogsTotal,
    blogsEnPublished,
    projectsEn,
    projectsEnPublished,
    authors,
    uploadsIndexRows: uploadsRows,
    uploadGalleryFiles: countUploadFiles(uploadsDir),
  };

  console.log(JSON.stringify(metrics));
}

main();
