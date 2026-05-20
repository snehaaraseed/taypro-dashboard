/**
 * SQLite cannot DROP a column-level UNIQUE on slug; migration 0003 only added
 * (slug, locale) index. Rebuild blogs/projects so only (slug, locale) is unique.
 *
 * Idempotent — safe on every deploy.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function resolveDbPaths() {
  const paths = [path.join(root, "data", "cms.sqlite")];
  const standalone = path.join(root, ".next", "standalone", "data", "cms.sqlite");
  if (fs.existsSync(standalone)) paths.push(standalone);
  return paths;
}

function needsSlugLocaleFix(db, table) {
  const row = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?"
    )
    .get(table);
  if (!row?.sql) return false;
  return /slug\s+text\s+not\s+null\s+unique/i.test(row.sql);
}

function rebuildBlogs(db) {
  db.exec(`
    CREATE TABLE blogs_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      featured_image TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT 'Taypro Team',
      content TEXT NOT NULL DEFAULT '',
      publish_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      featured_image_alt TEXT NOT NULL DEFAULT '',
      locale TEXT NOT NULL DEFAULT 'en',
      faqs TEXT NOT NULL DEFAULT '[]'
    );
  `);
  db.exec(`
    INSERT INTO blogs_new (
      id, slug, title, description, featured_image, author, content,
      publish_date, created_at, updated_at, published, featured_image_alt, locale, faqs
    )
    SELECT
      id, slug, title, description, featured_image, author, content,
      publish_date, created_at, updated_at, published, featured_image_alt, locale, faqs
    FROM blogs;
  `);
  db.exec("DROP TABLE blogs;");
  db.exec("ALTER TABLE blogs_new RENAME TO blogs;");
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_locale_unique ON blogs (slug, locale);"
  );
}

function rebuildProjects(db) {
  db.exec(`
    CREATE TABLE projects_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '[]',
      content TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      image_alt TEXT NOT NULL DEFAULT '',
      locale TEXT NOT NULL DEFAULT 'en'
    );
  `);
  db.exec(`
    INSERT INTO projects_new (
      id, slug, title, description, image, details, content,
      date, created_at, updated_at, published, image_alt, locale
    )
    SELECT
      id, slug, title, description, image, details, content,
      date, created_at, updated_at, published, image_alt, locale
    FROM projects;
  `);
  db.exec("DROP TABLE projects;");
  db.exec("ALTER TABLE projects_new RENAME TO projects;");
  db.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_locale_unique ON projects (slug, locale);"
  );
}

function fixDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log(`  skip (missing): ${dbPath}`);
    return;
  }

  console.log(`\n${dbPath}`);
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = OFF");

  const fixBlogs = needsSlugLocaleFix(db, "blogs");
  const fixProjects = needsSlugLocaleFix(db, "projects");

  if (!fixBlogs && !fixProjects) {
    console.log("  already OK (slug is not column-unique)");
    db.close();
    return;
  }

  db.transaction(() => {
    if (fixBlogs) {
      console.log("  rebuilding blogs…");
      rebuildBlogs(db);
    }
    if (fixProjects) {
      console.log("  rebuilding projects…");
      rebuildProjects(db);
    }
  })();

  db.pragma("foreign_keys = ON");
  db.close();
  console.log("  done");
}

console.log("CMS slug/locale unique fix:");
for (const dbPath of resolveDbPaths()) {
  fixDatabase(dbPath);
}
