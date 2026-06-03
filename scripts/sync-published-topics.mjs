/**
 * Sync English CMS blogs into published_topics and backfill H2/fingerprint metadata.
 * Safe to re-run: one row per slug (dedupes first); upserts by slug.
 */
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "data", "cms.sqlite");

const FINGERPRINT_WORD_LIMIT = 800;

function extractH2Headings(html) {
  const headings = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (text.length > 0) headings.push(text);
  }
  return headings;
}

function stripHtmlToPlainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildContentFingerprint(title, description, content) {
  const h2s = extractH2Headings(content).join(" ");
  const plain = stripHtmlToPlainText(content);
  const words = plain.split(/\s+/).filter(Boolean);
  const excerpt = words.slice(0, FINGERPRINT_WORD_LIMIT).join(" ");
  const payload = [title.trim(), description.trim(), h2s, excerpt]
    .join("\n")
    .toLowerCase();
  return createHash("sha256").update(payload).digest("hex");
}

function tableHasColumn(db, table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function ensureMetadataColumns(db) {
  if (!tableHasColumn(db, "published_topics", "h2_outline")) {
    db.exec("ALTER TABLE published_topics ADD COLUMN h2_outline text");
    console.log("Added column published_topics.h2_outline");
  }
  if (!tableHasColumn(db, "published_topics", "content_fingerprint")) {
    db.exec("ALTER TABLE published_topics ADD COLUMN content_fingerprint text");
    console.log("Added column published_topics.content_fingerprint");
  }
}

/** Keep newest row per slug (published_topics has no UNIQUE on slug). */
function dedupePublishedTopics(db) {
  const before = db.prepare("SELECT COUNT(*) AS n FROM published_topics").get().n;
  db.exec(`
    DELETE FROM published_topics
    WHERE id NOT IN (
      SELECT MAX(id) FROM published_topics GROUP BY slug
    )
  `);
  const after = db.prepare("SELECT COUNT(*) AS n FROM published_topics").get().n;
  const removed = before - after;
  if (removed > 0) {
    console.log(`Deduped published_topics: removed ${removed} duplicate row(s)`);
  }
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  ensureMetadataColumns(db);
  dedupePublishedTopics(db);

  const blogs = db
    .prepare(
      `SELECT slug, title, description, content, publish_date, created_at
       FROM blogs WHERE locale = 'en'`
    )
    .all();

  const findBySlug = db.prepare(
    `SELECT id FROM published_topics WHERE slug = ? ORDER BY id DESC LIMIT 1`
  );

  const insert = db.prepare(`
    INSERT INTO published_topics
      (title, slug, publish_date, category, h2_outline, content_fingerprint, created_at)
    VALUES
      (@title, @slug, @publishDate, NULL, @h2Outline, @fingerprint, @createdAt)
  `);

  const updateRow = db.prepare(`
    UPDATE published_topics
    SET title = @title,
        publish_date = @publishDate,
        h2_outline = @h2Outline,
        content_fingerprint = @fingerprint
    WHERE id = @id
  `);

  let inserted = 0;
  let updated = 0;

  for (const blog of blogs) {
    const h2Outline = JSON.stringify(extractH2Headings(blog.content ?? ""));
    const fingerprint = buildContentFingerprint(
      blog.title,
      blog.description,
      blog.content ?? ""
    );
    const createdAt = blog.created_at || blog.publish_date;
    const publishDate = blog.publish_date || createdAt;

    const existing = findBySlug.get(blog.slug);

    if (existing) {
      const result = updateRow.run({
        id: existing.id,
        title: blog.title,
        publishDate,
        h2Outline,
        fingerprint,
      });
      if (result.changes > 0) updated++;
    } else {
      const result = insert.run({
        title: blog.title,
        slug: blog.slug,
        publishDate,
        h2Outline,
        fingerprint,
        createdAt,
      });
      if (result.changes > 0) inserted++;
    }
  }

  console.log(
    `sync-published-topics: ${blogs.length} English blogs scanned, ${inserted} inserted, ${updated} updated`
  );
  db.close();
}

main();
