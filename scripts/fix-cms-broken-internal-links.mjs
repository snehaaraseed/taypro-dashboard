#!/usr/bin/env node
/**
 * Fix broken internal links stored in cms.sqlite (blogs + projects, all locales).
 *
 *   node scripts/fix-cms-broken-internal-links.mjs
 *   node scripts/fix-cms-broken-internal-links.mjs --dry-run
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { projectPeerHref } from "./lib/handwritten-link-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const dryRun = process.argv.includes("--dry-run");

const TYPO_BLOG_SLUG =
  "what-are-the-best-practices-of-cleaning-solar-panelsls";
const CANONICAL_BLOG_SLUG =
  "what-are-the-best-practices-of-cleaning-solar-panels";

function patchHtml(html) {
  if (!html) return { html, changed: false };
  let next = html;
  let changed = false;

  const perfBefore = next;
  next = next.replaceAll("/performance-methodology", "/performance-and-test-methodology");
  if (next !== perfBefore) changed = true;

  const typoBefore = next;
  next = next.replaceAll(
    `/blog/${TYPO_BLOG_SLUG}`,
    `/blog/${CANONICAL_BLOG_SLUG}`
  );
  if (next !== typoBefore) changed = true;

  const peerBefore = next;
  next = next.replace(/href="\/projects\/([^"#?]+)"/g, (match, slug) => {
    const href = projectPeerHref(slug);
    const replacement = `href="${href}"`;
    return replacement === match ? match : replacement;
  });
  if (next !== peerBefore) changed = true;

  return { html: next, changed };
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(`Missing ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  const stats = {
    blogs: { rows: 0, changed: 0 },
    projects: { rows: 0, changed: 0 },
  };

  const updateBlog = db.prepare(
    `UPDATE blogs SET content = @content, updated_at = @updatedAt
     WHERE id = @id`
  );
  const updateProject = db.prepare(
    `UPDATE projects SET content = @content, updated_at = @updatedAt
     WHERE id = @id`
  );
  const now = new Date().toISOString();

  for (const row of db
    .prepare("SELECT id, slug, locale, content FROM blogs")
    .all()) {
    stats.blogs.rows++;
    const { html, changed } = patchHtml(row.content);
    if (!changed) continue;
    stats.blogs.changed++;
    if (!dryRun) {
      updateBlog.run({ id: row.id, content: html, updatedAt: now });
    }
    console.log(`  blog ${row.locale}/${row.slug}`);
  }

  for (const row of db
    .prepare("SELECT id, slug, locale, content FROM projects")
    .all()) {
    stats.projects.rows++;
    const { html, changed } = patchHtml(row.content);
    if (!changed) continue;
    stats.projects.changed++;
    if (!dryRun) {
      updateProject.run({ id: row.id, content: html, updatedAt: now });
    }
    console.log(`  project ${row.locale}/${row.slug}`);
  }

  db.close();

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}Patched blogs: ${stats.blogs.changed}/${stats.blogs.rows}`
  );
  console.log(
    `${dryRun ? "[dry-run] " : ""}Patched projects: ${stats.projects.changed}/${stats.projects.rows}`
  );

  if (dryRun) {
    console.log("\nRe-run without --dry-run to write cms.sqlite");
  }
}

main();
