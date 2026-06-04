/**
 * Rotate hero images from public assets (does not change author or content).
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pickProjectHeroImage } from "./lib/project-image-picker.mjs";
import { UNPUBLISH_SLUGS } from "./lib/project-deploy-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const publicRoot = path.join(root, "public");

const db = new Database(dbPath);
const rows = db
  .prepare(`SELECT slug, title FROM projects WHERE locale = 'en' ORDER BY slug`)
  .all();
const usedUrls = new Set();
const update = db.prepare(
  `UPDATE projects SET image = @image, image_alt = @imageAlt, updated_at = @now
   WHERE slug = @slug AND locale = 'en'`
);
const now = new Date().toISOString();
let n = 0;

for (let i = 0; i < rows.length; i++) {
  const { slug, title } = rows[i];
  if (UNPUBLISH_SLUGS.has(slug)) continue;
  const picked = pickProjectHeroImage({
    publicRoot,
    title,
    seoKeyword: "solar panel cleaning robot India",
    usedUrls,
    rowIndex: i,
    slug,
  });
  if (!dryRun) {
    update.run({
      slug,
      image: picked.url,
      imageAlt: picked.alt,
      now,
    });
  }
  n++;
}

console.log(`${dryRun ? "Would update" : "Updated"} hero images: ${n}`);
db.close();
