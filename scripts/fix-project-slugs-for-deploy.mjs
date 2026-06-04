/**
 * Rename malformed slugs, unpublish alias/invalid rows, add redirect sources for renames.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PROJECT_SLUG_REDIRECTS,
  SLUG_RENAMES,
  UNPUBLISH_SLUGS,
} from "./lib/project-deploy-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const hwDir = path.join(root, "content", "handwritten-case-studies");

const db = new Database(dbPath);
const now = new Date().toISOString();

function unpublish(slug) {
  const r = db
    .prepare(
      `UPDATE projects SET published = 0, updated_at = @now WHERE slug = @slug`
    )
    .run({ slug, now });
  return r.changes;
}

function renameSlug(from, to) {
  const existsFrom = db
    .prepare(`SELECT 1 FROM projects WHERE slug = ? AND locale = 'en'`)
    .get(from);
  const existsTo = db
    .prepare(`SELECT 1 FROM projects WHERE slug = ? AND locale = 'en'`)
    .get(to);
  if (!existsFrom) {
    console.warn(`  skip rename (missing): ${from}`);
    return;
  }
  if (existsTo) {
    console.warn(`  skip rename (target exists): ${from} → ${to}`);
    unpublish(from);
    return;
  }
  if (!dryRun) {
    db.prepare(
      `UPDATE projects SET slug = @to, updated_at = @now WHERE slug = @from AND locale = 'en'`
    ).run({ from, to, now });
  }
  const oldFile = path.join(hwDir, `${from}.html`);
  const newFile = path.join(hwDir, `${to}.html`);
  if (fs.existsSync(oldFile) && !fs.existsSync(newFile)) {
    if (!dryRun) fs.renameSync(oldFile, newFile);
    console.log(`  renamed file ${from}.html → ${to}.html`);
  }
  console.log(`${dryRun ? "[dry-run] " : ""}slug ${from} → ${to}`);
}

console.log("=== Unpublish alias / invalid slugs ===");
for (const slug of UNPUBLISH_SLUGS) {
  const n = dryRun
    ? db.prepare(`SELECT 1 FROM projects WHERE slug = ?`).get(slug)
      ? 1
      : 0
    : unpublish(slug);
  if (n) console.log(`  unpublished: ${slug}`);
}

console.log("\n=== Rename malformed slugs ===");
for (const { from, to } of SLUG_RENAMES) {
  renameSlug(from, to);
}

console.log("\n=== Alias redirects (canonical stays published) ===");
for (const { from, to } of PROJECT_SLUG_REDIRECTS) {
  console.log(`  /projects/${from} → /projects/${to}`);
}

db.close();
