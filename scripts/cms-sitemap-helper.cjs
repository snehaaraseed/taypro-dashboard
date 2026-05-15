/**
 * Sync helpers for next-sitemap (build time).
 */
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "cms.sqlite");

function openDb() {
  if (!fs.existsSync(dbPath)) {
    return null;
  }
  return new Database(dbPath, { readonly: true });
}

function getPublishedBlogSlugs() {
  const db = openDb();
  if (!db) return [];
  try {
    return db
      .prepare("SELECT slug FROM blogs WHERE published = 1")
      .all()
      .map((r) => r.slug);
  } finally {
    db.close();
  }
}

function getPublishedProjectSlugs() {
  const db = openDb();
  if (!db) return [];
  try {
    return db
      .prepare("SELECT slug FROM projects WHERE published = 1")
      .all()
      .map((r) => r.slug);
  } finally {
    db.close();
  }
}

function isDraftBlog(slug) {
  const db = openDb();
  if (!db) return null;
  try {
    const row = db
      .prepare("SELECT published FROM blogs WHERE slug = ?")
      .get(slug);
    if (!row) return null;
    return row.published === 0;
  } finally {
    db.close();
  }
}

function isDraftProject(slug) {
  const db = openDb();
  if (!db) return null;
  try {
    const row = db
      .prepare("SELECT published FROM projects WHERE slug = ?")
      .get(slug);
    if (!row) return null;
    return row.published === 0;
  } finally {
    db.close();
  }
}

module.exports = {
  getPublishedBlogSlugs,
  getPublishedProjectSlugs,
  isDraftBlog,
  isDraftProject,
};
