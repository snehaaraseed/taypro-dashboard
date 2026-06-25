/**
 * Audit CMS blog/project images: empty paths, missing files, missing in standalone.
 *
 * Usage:
 *   node scripts/audit-cms-images.mjs
 *   CMS_SQLITE=/path/to/cms.sqlite node scripts/audit-cms-images.mjs --json
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const jsonOut = process.argv.includes("--json");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const publicRoot = process.env.PUBLIC_ROOT || path.join(root, "public");
const standalonePublic =
  process.env.STANDALONE_PUBLIC || path.join(root, ".next/standalone/public");

function fileExists(base, url) {
  if (!url?.startsWith("/")) return null;
  return fs.existsSync(path.join(base, url.replace(/^\//, "")));
}

function extractImgSrcs(html) {
  const srcs = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html || ""))) srcs.push(m[1]);
  return srcs;
}

const db = new Database(dbPath, { readonly: true });
const blogs = db
  .prepare(
    `SELECT id, slug, locale, title, featured_image, content, published
     FROM blogs ORDER BY slug, locale`
  )
  .all();
const projects = db
  .prepare(
    `SELECT id, slug, locale, title, image, content, published
     FROM projects ORDER BY slug, locale`
  )
  .all();

const issues = [];
const pathUsage = new Map();

function recordIssue(issue) {
  issues.push(issue);
  if (issue.path?.startsWith("/")) {
    pathUsage.set(issue.path, (pathUsage.get(issue.path) || 0) + 1);
  }
}

for (const b of blogs) {
  const fi = (b.featured_image || "").trim();
  if (!fi) {
    recordIssue({
      type: "blog",
      field: "featured_image",
      slug: b.slug,
      locale: b.locale,
      published: b.published,
      reason: "empty",
      path: "",
    });
  } else if (fi.startsWith("/")) {
    const disk = fileExists(publicRoot, fi);
    const standalone = fileExists(standalonePublic, fi);
    if (!disk) {
      recordIssue({
        type: "blog",
        field: "featured_image",
        slug: b.slug,
        locale: b.locale,
        published: b.published,
        reason: "missing_disk",
        path: fi,
      });
    } else if (standalone === false) {
      recordIssue({
        type: "blog",
        field: "featured_image",
        slug: b.slug,
        locale: b.locale,
        published: b.published,
        reason: "missing_standalone",
        path: fi,
      });
    }
  }
  for (const src of extractImgSrcs(b.content)) {
    if (!src.startsWith("/")) continue;
    const disk = fileExists(publicRoot, src);
    if (!disk) {
      recordIssue({
        type: "blog",
        field: "content",
        slug: b.slug,
        locale: b.locale,
        published: b.published,
        reason: "missing_disk",
        path: src,
      });
    }
  }
}

for (const p of projects) {
  const img = (p.image || "").trim();
  if (!img) {
    recordIssue({
      type: "project",
      field: "image",
      slug: p.slug,
      locale: p.locale,
      published: p.published,
      reason: "empty",
      path: "",
    });
  } else if (img.startsWith("/")) {
    const disk = fileExists(publicRoot, img);
    const standalone = fileExists(standalonePublic, img);
    if (!disk) {
      recordIssue({
        type: "project",
        field: "image",
        slug: p.slug,
        locale: p.locale,
        published: p.published,
        reason: "missing_disk",
        path: img,
      });
    } else if (standalone === false) {
      recordIssue({
        type: "project",
        field: "image",
        slug: p.slug,
        locale: p.locale,
        published: p.published,
        reason: "missing_standalone",
        path: img,
      });
    }
  }
  for (const src of extractImgSrcs(p.content)) {
    if (!src.startsWith("/")) continue;
    const disk = fileExists(publicRoot, src);
    if (!disk) {
      recordIssue({
        type: "project",
        field: "content",
        slug: p.slug,
        locale: p.locale,
        published: p.published,
        reason: "missing_disk",
        path: src,
      });
    }
  }
}

const publishedIssues = issues.filter((i) => i.published);
const byReason = {};
for (const i of issues) {
  byReason[i.reason] = (byReason[i.reason] || 0) + 1;
}

const topPaths = [...pathUsage.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .map(([path, count]) => ({ path, count }));

const summary = {
  blogs: blogs.length,
  projects: projects.length,
  totalIssues: issues.length,
  publishedIssues: publishedIssues.length,
  byReason,
  topMissingPaths: topPaths,
};

if (process.argv.includes("--standalone")) {
  const standaloneIssues = issues.filter((i) => i.reason === "missing_standalone");
  const publishedStandalone = standaloneIssues.filter((i) => i.published);
  summary.standaloneIssues = standaloneIssues.length;
  summary.publishedStandaloneIssues = publishedStandalone.length;
  const standalonePaths = [...new Map(standaloneIssues.map((i) => [i.path, i])).values()];
  console.log("Standalone missing paths:", standalonePaths.length);
  for (const i of standalonePaths.slice(0, 40)) {
    console.log(`  ${i.path} (${pathUsage.get(i.path)} refs)`);
  }
}

if (jsonOut) {
  console.log(JSON.stringify({ summary, issues }, null, 2));
} else {
  console.log("CMS image audit:", dbPath);
  console.log(JSON.stringify(summary, null, 2));
  if (publishedIssues.length) {
    console.log("\nPublished issues (first 25):");
    for (const i of publishedIssues.slice(0, 25)) {
      console.log(
        `  [${i.type}/${i.field}] ${i.slug} (${i.locale}) ${i.reason} ${i.path}`
      );
    }
  }
}

db.close();
process.exit(publishedIssues.length > 0 ? 1 : 0);
