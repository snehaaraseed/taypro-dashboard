/**
 * Find CMS image paths that break in next/image (redirect-only or missing files).
 * Also rewrites legacy deleted paths to canonical branded assets.
 *
 * Usage:
 *   node scripts/fix-cms-missing-images.mjs --audit
 *   node scripts/fix-cms-missing-images.mjs --dry-run
 *   node scripts/fix-cms-missing-images.mjs
 *
 * After production DB updates, purge nginx HTML cache:
 *   sudo rm -rf /var/cache/nginx/taypro/*
 */
import Database from "better-sqlite3";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { pickProjectHeroImage } from "./lib/project-image-picker.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const auditOnly = process.argv.includes("--audit");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const publicRoot = process.env.PUBLIC_ROOT || path.join(root, "public");
const standaloneDb = path.join(root, ".next/standalone/data/cms.sqlite");

/** Deleted legacy files → canonical paths (matches next.config.ts redirects). */
export const LEGACY_IMAGE_REWRITES = {
  "/tayprorobots/taypro-glyde-x-tracker-solar-cleaning-robot.png":
    "/tayprorobots/glyde-x/hero.png",
  "/tayprorobots/taypro-helyx-semi-automatic-solar-cleaning-robot.png":
    "/tayprorobots/helyx/hero.png",
  "/tayprorobots/taypro-nyuma-automatic-solar-cleaning-robot.png":
    "/tayprorobots/nyuma/hero-dark.webp",
  "/tayprorobots/taypro-nyuma-x-tracker-solar-cleaning-robot.png":
    "/tayprorobots/nyuma-x/hero.png",
  "/tayprorobots/taypro-modelA.png": "/tayprorobots/glyde/hero.png",
  "/tayprorobots/taypro-modelAcopy.png": "/tayprorobots/glyde/hero.png",
  "/tayprorobots/taypro-modelBcopy.png": "/tayprorobots/helyx/hero.png",
  "/tayprorobots/taypro-modelT-img.png": "/tayprorobots/glyde-x/hero.png",
  "/tayprorobots/taypro-modelTcopy.png": "/tayprorobots/glyde-x/hero.png",
  "/tayprorobots/glyde/glyde-tr150-top-view.png": "/tayprorobots/glyde/hero.png",
  "/tayproasset/taypro-console.png": "/tayproasset/nectyr.webp",
  "/tayprorobots/glyde/glyde-dual-pass-mechanism.png":
    "/tayprorobots/glyde/side-view.png",
  "/tayprorobots/glyde/dual-pass-mechanism.png": "/tayprorobots/glyde/side-view.png",
  "/tayprorobots/glyde/glyde-docking-power-unit.png":
    "/tayprorobots/glyde/docking-power-unit.png",
  "/tayprorobots/taypro-opex.jpg": "/tayprorobots/taypro-opex.webp",
  "/tayprorobots/nyuma/hero.png": "/tayprorobots/nyuma/hero-dark.webp",
  "/tayprorobots/nyuma/hero.webp": "/tayprorobots/nyuma/hero-dark.webp",
};

function fileExists(url) {
  if (!url?.startsWith("/")) return false;
  return fs.existsSync(path.join(publicRoot, url.replace(/^\//, "")));
}

function rewritePath(url) {
  if (!url?.startsWith("/")) return url;
  if (LEGACY_IMAGE_REWRITES[url]) return LEGACY_IMAGE_REWRITES[url];
  return url;
}

function rewriteHtml(html) {
  if (!html) return html;
  let out = html;
  for (const [from, to] of Object.entries(LEGACY_IMAGE_REWRITES)) {
    out = out.split(from).join(to);
  }
  return out;
}

function extractImgPaths(html) {
  const paths = new Set();
  const re = /src=["'](\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html || ""))) {
    if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(m[1])) paths.add(m[1]);
  }
  return paths;
}

function headUrl(urlPath) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "127.0.0.1", port: 3000, path: urlPath, method: "HEAD", timeout: 10000 },
      (res) => resolve(res.statusCode ?? 0)
    );
    req.on("error", () => resolve(0));
    req.on("timeout", () => {
      req.destroy();
      resolve(0);
    });
    req.end();
  });
}

const db = new Database(dbPath);
const now = new Date().toISOString();

const blogs = db
  .prepare(
    `SELECT id, slug, locale, title, featured_image, featured_image_alt, content, published
     FROM blogs`
  )
  .all();
const projects = db
  .prepare(
    `SELECT id, slug, locale, title, description, image, image_alt, content, published
     FROM projects`
  )
  .all();

const pathRefs = new Map();
function track(pathname, ref) {
  if (!pathname?.startsWith("/")) return;
  if (!/\.(jpe?g|png|webp|gif)(\?|$)/i.test(pathname)) return;
  if (!pathRefs.has(pathname)) pathRefs.set(pathname, []);
  pathRefs.get(pathname).push(ref);
}

for (const b of blogs.filter((r) => r.published)) {
  if (b.featured_image?.startsWith("/")) {
    track(b.featured_image, `blog:${b.slug}:${b.locale}:featured`);
  }
  for (const p of extractImgPaths(b.content)) {
    track(p, `blog:${b.slug}:${b.locale}:content`);
  }
}
for (const p of projects.filter((r) => r.published)) {
  if (p.image?.startsWith("/")) {
    track(p.image, `project:${p.slug}:${p.locale}:image`);
  }
  for (const src of extractImgPaths(p.content)) {
    track(src, `project:${p.slug}:${p.locale}:content`);
  }
}

const brokenNext = [];
for (const [pathname, refs] of pathRefs) {
  const direct = await headUrl(pathname);
  const next = await headUrl(
    `/_next/image?url=${encodeURIComponent(pathname)}&w=640&q=75`
  );
  if (next !== 200) {
    brokenNext.push({
      path: pathname,
      direct,
      next,
      refs: refs.length,
      rewrite: LEGACY_IMAGE_REWRITES[pathname] ?? null,
      disk: fileExists(pathname),
    });
  }
}
brokenNext.sort((a, b) => b.refs - a.refs);

console.log("Published content image paths:", pathRefs.size);
console.log("Broken in next/image:", brokenNext.length);
for (const row of brokenNext) {
  console.log(
    `  ${row.refs}x ${row.path} (direct=${row.direct}, next=${row.next}, disk=${row.disk})` +
      (row.rewrite ? ` → ${row.rewrite}` : "")
  );
}

if (auditOnly) {
  db.close();
  process.exit(brokenNext.length > 0 ? 1 : 0);
}

const updateBlog = db.prepare(
  `UPDATE blogs SET featured_image = @featured_image, content = @content,
   featured_image_alt = @featured_image_alt, updated_at = @now WHERE id = @id`
);
const updateProject = db.prepare(
  `UPDATE projects SET image = @image, content = @content,
   image_alt = @image_alt, updated_at = @now WHERE id = @id`
);

const usedProjectUrls = new Set(
  projects
    .map((p) => rewritePath(p.image))
    .filter((u) => u && fileExists(u))
);
let blogUpdates = 0;
let projectUpdates = 0;

for (const b of blogs) {
  let featured = rewritePath(b.featured_image);
  let content = rewriteHtml(b.content);
  let featuredAlt = b.featured_image_alt || "";
  let changed = featured !== b.featured_image || content !== b.content;

  if (b.published && featured?.startsWith("/") && !fileExists(featured)) {
    const picked = pickProjectHeroImage({
      publicRoot,
      title: b.title,
      seoKeyword: "solar panel cleaning robot India",
      usedUrls: usedProjectUrls,
      rowIndex: b.id,
      slug: b.slug,
    });
    featured = picked.url;
    if (!featuredAlt.trim()) featuredAlt = `${b.title} — Taypro solar cleaning insights`;
    changed = true;
  }

  if (changed) {
    blogUpdates++;
    if (!dryRun) {
      updateBlog.run({
        id: b.id,
        featured_image: featured,
        content,
        featured_image_alt: featuredAlt,
        now,
      });
    }
    console.log(
      `${dryRun ? "Would update" : "Updated"} blog ${b.slug} (${b.locale}) → ${featured}`
    );
  }
}

for (const p of projects) {
  let image = rewritePath(p.image);
  let content = rewriteHtml(p.content);
  let imageAlt = p.image_alt || "";
  let changed = image !== p.image || content !== p.content;

  if (p.published && image?.startsWith("/") && !fileExists(image)) {
    const picked = pickProjectHeroImage({
      publicRoot,
      title: p.title,
      seoKeyword: "solar panel cleaning robot India",
      usedUrls: usedProjectUrls,
      rowIndex: p.id,
      slug: p.slug,
    });
    image = picked.url;
    if (!imageAlt.trim()) {
      imageAlt = `${p.title} - Solar Panel Cleaning Robot Installation Project by Taypro`.slice(
        0,
        200
      );
    }
    changed = true;
  }

  if (changed) {
    projectUpdates++;
    if (!dryRun) {
      updateProject.run({
        id: p.id,
        image,
        content,
        image_alt: imageAlt,
        now,
      });
    }
    console.log(
      `${dryRun ? "Would update" : "Updated"} project ${p.slug} (${p.locale}) → ${image}`
    );
  }
}

console.log(
  `\n${dryRun ? "Would update" : "Updated"} ${blogUpdates} blog row(s), ${projectUpdates} project row(s).`
);

if (!dryRun && !auditOnly && fs.existsSync(standaloneDb) && path.resolve(standaloneDb) !== path.resolve(dbPath)) {
  fs.copyFileSync(dbPath, standaloneDb);
  console.log("Synced cms.sqlite → .next/standalone/data/cms.sqlite");
}
db.close();
