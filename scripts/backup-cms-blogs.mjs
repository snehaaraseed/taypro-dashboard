#!/usr/bin/env node
/**
 * Full CMS backup: sqlite copy + JSON export of all EN blogs + published_topics.
 * Run on production before bulk blog edits.
 *
 *   node scripts/backup-cms-blogs.mjs
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath =
  process.env.CMS_SQLITE?.trim() ||
  process.env.CMS_DATABASE_PATH?.trim() ||
  path.join(root, "data", "cms.sqlite");

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found: ${dbPath}`);
  process.exit(1);
}

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const backupDir = path.join(root, "data", "backups", `blog-backup-${ts}`);
fs.mkdirSync(backupDir, { recursive: true });

const sqliteBackup = path.join(backupDir, "cms.sqlite");
fs.copyFileSync(dbPath, sqliteBackup);

const db = new Database(dbPath, { readonly: true });
try {
  const blogs = db
    .prepare(
      `SELECT id, slug, locale, title, description, featured_image, featured_image_alt,
              author, content, faqs, seo_keyword, publish_date, scheduled_publish_at,
              created_at, updated_at, published
       FROM blogs WHERE locale = 'en'`
    )
    .all();

  let topics = [];
  try {
    topics = db.prepare("SELECT * FROM published_topics").all();
  } catch {
    // optional table
  }

  fs.writeFileSync(
    path.join(backupDir, "blogs-en.json"),
    JSON.stringify(blogs, null, 2)
  );
  fs.writeFileSync(
    path.join(backupDir, "published-topics.json"),
    JSON.stringify(topics, null, 2)
  );

  const manifest = {
    createdAt: new Date().toISOString(),
    dbPath,
    sqliteBackup,
    blogCount: blogs.length,
    publishedBlogCount: blogs.filter((b) => b.published).length,
    topicCount: topics.length,
  };
  fs.writeFileSync(
    path.join(backupDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`Backup written to ${backupDir}`);
  console.log(
    `  sqlite: ${sqliteBackup} (${(fs.statSync(sqliteBackup).size / 1024 / 1024).toFixed(2)} MB)`
  );
  console.log(
    `  EN blogs: ${blogs.length} (${blogs.filter((b) => b.published).length} published)`
  );
  console.log(`  published_topics: ${topics.length}`);
} finally {
  db.close();
}
