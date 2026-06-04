/**
 * Restore known project hero images after a bad import/deploy clobbered paths.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import {
  PROJECT_HERO_FALLBACK,
  PROJECT_HERO_IMAGE_BY_SLUG,
} from "./lib/project-hero-image-map.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

const PUBLISHED_EXTRA = ["kmf-karnataka-75-mw", "bachau-dvc-gujrat-300-mw"];

const db = new Database(dbPath);
const now = new Date().toISOString();
const update = db.prepare(
  `UPDATE projects SET image = @image, updated_at = @now WHERE slug = @slug AND locale = 'en'`
);

let n = 0;
for (const [slug, image] of Object.entries(PROJECT_HERO_IMAGE_BY_SLUG)) {
  const r = update.run({ slug, image, now });
  if (r.changes) {
    n += 1;
    console.log(`  ${slug} → ${image}`);
  }
}

for (const slug of PUBLISHED_EXTRA) {
  const r = update.run({ slug, image: PROJECT_HERO_FALLBACK, now });
  if (r.changes) {
    n += 1;
    console.log(`  ${slug} → ${PROJECT_HERO_FALLBACK}`);
  }
}

console.log(`Restored hero images for ${n} project(s).`);
db.close();
