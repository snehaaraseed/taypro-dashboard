import type Database from "better-sqlite3";

function needsSlugLocaleFix(db: Database.Database, table: string): boolean {
  const row = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table) as { sql?: string } | undefined;
  if (!row?.sql) return false;
  return /slug\s+text\s+not\s+null\s+unique/i.test(row.sql);
}

function rebuildBlogs(db: Database.Database) {
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

function rebuildProjects(db: Database.Database) {
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

/** Rebuild blogs/projects when legacy `slug TEXT UNIQUE` blocks per-locale rows. Idempotent. */
export function ensureSlugLocaleUnique(db: Database.Database): void {
  const fixBlogs = needsSlugLocaleFix(db, "blogs");
  const fixProjects = needsSlugLocaleFix(db, "projects");
  if (!fixBlogs && !fixProjects) return;

  const fkWasOn = db.pragma("foreign_keys", { simple: true }) === 1;
  db.pragma("foreign_keys = OFF");

  const run = db.transaction(() => {
    if (fixBlogs) rebuildBlogs(db);
    if (fixProjects) rebuildProjects(db);
  });
  run();

  db.pragma(`foreign_keys = ${fkWasOn ? "ON" : "OFF"}`);
}
