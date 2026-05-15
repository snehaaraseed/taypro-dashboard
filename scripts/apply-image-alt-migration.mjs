/**
 * Idempotent: add featured_image_alt / image_alt columns and backfill empty values.
 * Safe to re-run on every deploy.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");

function hasColumn(db, table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function ensureColumn(db, table, column, sql) {
  if (hasColumn(db, table, column)) {
    console.log(`  ${table}.${column}: already present`);
    return false;
  }
  db.exec(sql);
  console.log(`  ${table}.${column}: added`);
  return true;
}

function defaultBlogAlt(title) {
  return `${title} — solar panel cleaning robot article | Taypro`;
}

function defaultProjectAlt(title, description, detailsJson) {
  let details = [];
  try {
    const parsed = JSON.parse(detailsJson || "[]");
    if (Array.isArray(parsed)) details = parsed;
  } catch {
    /* ignore */
  }
  const overview =
    details.length > 0 ? details.join(" · ") : description || title;
  const snippet =
    overview.length > 50 ? `${overview.substring(0, 50)}...` : overview;
  return `${title} — solar panel cleaning robot project, ${snippet}`;
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.log("Image alt migration: no data/cms.sqlite, skip");
    return;
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  console.log("Image alt migration:");

  ensureColumn(
    db,
    "blogs",
    "featured_image_alt",
    "ALTER TABLE blogs ADD COLUMN featured_image_alt text NOT NULL DEFAULT ''"
  );
  ensureColumn(
    db,
    "projects",
    "image_alt",
    "ALTER TABLE projects ADD COLUMN image_alt text NOT NULL DEFAULT ''"
  );

  const blogs = db
    .prepare(
      `SELECT id, title, featured_image, featured_image_alt AS alt
       FROM blogs
       WHERE TRIM(COALESCE(featured_image_alt, '')) = ''
         AND TRIM(COALESCE(featured_image, '')) != ''`
    )
    .all();

  const updateBlog = db.prepare(
    `UPDATE blogs SET featured_image_alt = ? WHERE id = ?`
  );
  let blogFilled = 0;
  for (const row of blogs) {
    updateBlog.run(defaultBlogAlt(row.title), row.id);
    blogFilled++;
  }

  const projects = db
    .prepare(
      `SELECT id, title, description, details, image, image_alt AS alt
       FROM projects
       WHERE TRIM(COALESCE(image_alt, '')) = ''
         AND TRIM(COALESCE(image, '')) != ''`
    )
    .all();

  const updateProject = db.prepare(
    `UPDATE projects SET image_alt = ? WHERE id = ?`
  );
  let projectFilled = 0;
  for (const row of projects) {
    updateProject.run(
      defaultProjectAlt(row.title, row.description, row.details),
      row.id
    );
    projectFilled++;
  }

  db.close();

  console.log(
    `  Backfilled ${blogFilled} blog featured_image_alt, ${projectFilled} project image_alt`
  );
  console.log("Done.");
}

main();
