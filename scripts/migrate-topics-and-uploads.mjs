/**
 * One-time: import published-topics.json + index public/uploads into cms.sqlite.
 * Safe to re-run (INSERT OR IGNORE on uploads by url).
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");
const topicsFile = path.join(root, "data", "published-topics.json");
const uploadsDir = path.join(root, "public", "uploads");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function importTopics(db) {
  if (!fs.existsSync(topicsFile)) {
    console.log("Topics: no published-topics.json, skip");
    return;
  }
  const existing = db.prepare("SELECT COUNT(*) AS n FROM published_topics").get().n;
  if (existing > 0) {
    console.log(`Topics: ${existing} already in DB, skip`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(topicsFile, "utf8"));
  const topics = data.topics || [];
  const insert = db.prepare(`
    INSERT INTO published_topics (title, slug, publish_date, category, created_at)
    VALUES (@title, @slug, @publishDate, @category, @createdAt)
  `);
  let n = 0;
  for (const t of topics) {
    insert.run({
      title: t.title,
      slug: t.slug,
      publishDate: t.publishDate || t.createdAt,
      category: t.category ?? null,
      createdAt: t.createdAt || t.publishDate,
    });
    n++;
  }
  console.log(`Topics: imported ${n}`);
}

function walkUploads(dir, baseUrl, files) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walkUploads(full, `${baseUrl}/${name}`, files);
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    if (/-\d+x\d+(-scaled)?\./i.test(name)) continue;
    files.push({
      url: `${baseUrl}/${name}`.replace(/\/+/g, "/"),
      fileName: name,
      filePath: full,
      size: stat.size,
      uploadedAt: stat.mtime.toISOString(),
    });
  }
}

function importUploads(db) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO uploads (url, file_name, file_path, mime_type, size, uploaded_at)
    VALUES (@url, @fileName, @filePath, @mimeType, @size, @uploadedAt)
  `);
  const files = [];
  walkUploads(uploadsDir, "/uploads", files);
  let n = 0;
  for (const f of files) {
    const ext = path.extname(f.fileName).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".gif"
          ? "image/gif"
          : ext === ".webp"
            ? "image/webp"
            : "image/jpeg";
    const r = insert.run({ ...f, mimeType: mime });
    if (r.changes) n++;
  }
  const total = db.prepare("SELECT COUNT(*) AS n FROM uploads").get().n;
  console.log(`Uploads: indexed ${n} new (${total} total in DB)`);
}

if (!fs.existsSync(dbPath)) {
  console.error("Missing data/cms.sqlite");
  process.exit(1);
}

const db = new Database(dbPath);
db.exec(`
CREATE TABLE IF NOT EXISTS published_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL
);
`);

importTopics(db);
importUploads(db);
db.close();
console.log("Done.");
