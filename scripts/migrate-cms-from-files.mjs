/**
 * One-time import of file-based blogs, projects, and authors into SQLite.
 * Run from repo root: node scripts/migrate-cms-from-files.mjs
 *
 * Safe to re-run: skips slugs that already exist in the database.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");
const blogDir = path.join(root, "src", "app", "blog");
const projectDir = path.join(root, "src", "app", "projects");
const authorsFile = path.join(root, "src", "app", "data", "blogAuthors.store.json");
const defaultAuthorsFile = path.join(root, "src", "app", "data", "blogAuthors.ts");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  linkedin_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  featured_image TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Taypro Team',
  content TEXT NOT NULL DEFAULT '',
  publish_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '[]',
  content TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  published INTEGER NOT NULL DEFAULT 1
);
`);

const RESERVED_BLOG = new Set([
  "components",
  "api",
  "[slug]",
  "add",
  "db",
  "author",
]);
const RESERVED_PROJECT = new Set(["layout"]);

function readContentHtml(dir) {
  const htmlPath = path.join(dir, "content.html");
  if (fs.existsSync(htmlPath)) {
    return fs.readFileSync(htmlPath, "utf8");
  }
  return "";
}

function importAuthors() {
  let authors = [];
  if (fs.existsSync(authorsFile)) {
    authors = JSON.parse(fs.readFileSync(authorsFile, "utf8"));
  } else {
    const raw = fs.readFileSync(defaultAuthorsFile, "utf8");
    const match = raw.match(/export const BLOG_AUTHORS[^=]*=\s*(\[[\s\S]*?\]);/);
    if (match) authors = eval(match[1]);
  }
  const insert = db.prepare(`
    INSERT OR IGNORE INTO authors (slug, name, role, bio, avatar_url, linkedin_url, created_at, updated_at)
    VALUES (@slug, @name, @role, @bio, @avatarUrl, @linkedInUrl, @createdAt, @updatedAt)
  `);
  const now = new Date().toISOString();
  let count = 0;
  for (const a of authors) {
    const r = insert.run({
      slug: a.slug,
      name: a.name,
      role: a.role,
      bio: a.bio,
      avatarUrl: a.avatarUrl ?? null,
      linkedInUrl: a.linkedInUrl ?? null,
      createdAt: now,
      updatedAt: now,
    });
    if (r.changes) count++;
  }
  console.log(`Authors: imported ${count}`);
}

function importBlogs() {
  if (!fs.existsSync(blogDir)) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO blogs (
      slug, title, description, featured_image, author, content,
      publish_date, created_at, updated_at, published
    ) VALUES (
      @slug, @title, @description, @featuredImage, @author, @content,
      @publishDate, @createdAt, @updatedAt, @published
    )
  `);
  let count = 0;
  for (const name of fs.readdirSync(blogDir)) {
    if (RESERVED_BLOG.has(name)) continue;
    const dir = path.join(blogDir, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const metaPath = path.join(dir, "metadata.json");
    if (!fs.existsSync(metaPath)) continue;
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const content = readContentHtml(dir);
    const now = new Date().toISOString();
    const r = insert.run({
      slug: meta.slug || name,
      title: meta.title,
      description: meta.description,
      featuredImage: meta.featuredImage || "",
      author: meta.author || "Taypro Team",
      content,
      publishDate: meta.publishDate || meta.createdAt || now,
      createdAt: meta.createdAt || now,
      updatedAt: meta.updatedAt || meta.createdAt || now,
      published: meta.published === false ? 0 : 1,
    });
    if (r.changes) count++;
  }
  console.log(`Blogs: imported ${count}`);
}

function importProjects() {
  if (!fs.existsSync(projectDir)) return;
  const insert = db.prepare(`
    INSERT OR IGNORE INTO projects (
      slug, title, description, image, details, content,
      date, created_at, updated_at, published
    ) VALUES (
      @slug, @title, @description, @image, @details, @content,
      @date, @createdAt, @updatedAt, @published
    )
  `);
  let count = 0;
  for (const name of fs.readdirSync(projectDir)) {
    if (RESERVED_PROJECT.has(name)) continue;
    const dir = path.join(projectDir, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const metaPath = path.join(dir, "metadata.json");
    if (!fs.existsSync(metaPath)) continue;
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const now = new Date().toISOString();
    const r = insert.run({
      slug: meta.slug || name,
      title: meta.title,
      description: meta.description,
      image: meta.image,
      details: JSON.stringify(meta.details || []),
      content: "",
      date: meta.date || now.split("T")[0],
      createdAt: meta.createdAt || now,
      updatedAt: meta.updatedAt || meta.createdAt || now,
      published: meta.published === false ? 0 : 1,
    });
    if (r.changes) count++;
  }
  console.log(`Projects: imported ${count}`);
}

importAuthors();
importBlogs();
importProjects();
console.log(`Database written to ${dbPath}`);
db.close();
