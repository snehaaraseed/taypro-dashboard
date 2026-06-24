#!/usr/bin/env node
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const ROOT = process.cwd();
const dbPath = path.join(ROOT, "data/cms.sqlite");
if (!fs.existsSync(dbPath)) {
  console.log("No data/cms.sqlite — skip CMS slug check");
  process.exit(0);
}

const db = new Database(dbPath, { readonly: true });
const enBlogs = new Set(
  db
    .prepare("SELECT slug FROM blogs WHERE published=1 AND locale='en'")
    .all()
    .map((r) => r.slug)
);
const enProjects = new Set(
  db
    .prepare("SELECT slug FROM projects WHERE published=1 AND locale='en'")
    .all()
    .map((r) => r.slug)
);

const LINK_RE = /["'`](\/blog\/[^"'`?#\s]+|\/projects\/[^"'`?#\s]+)/g;
const SKIP = new Set(["node_modules", ".next", ".git", "admin"]);
const BLOG_PLACEHOLDER_SLUGS = new Set(["slug", "list", "create", "scrape", "page"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const n of fs.readdirSync(dir)) {
    if (SKIP.has(n)) continue;
    const f = path.join(dir, n);
    if (fs.statSync(f).isDirectory()) walk(f, files);
    else if (/\.(tsx?|jsx?|json)$/.test(n) && !f.includes("/admin/"))
      files.push(f);
  }
  return files;
}

const PROJECT_HUB = new Set([
  "/projects",
  "/projects/automatic",
  "/projects/semi-automatic",
  "/projects/capex",
  "/projects/opex",
]);

const urlAliases = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/url-aliases.json"), "utf8")
).aliases;
const REDIRECT_PROJECT_SLUGS = new Set(
  Object.keys(urlAliases)
    .filter((p) => p.startsWith("/projects/"))
    .map((p) => p.slice("/projects/".length))
);
const REDIRECT_BLOG_SLUGS = new Set(
  Object.keys(urlAliases)
    .filter((p) => p.startsWith("/blog/"))
    .map((p) => p.slice("/blog/".length))
);

const SCAN_ROOTS = ["src", "messages"].map((d) => path.join(ROOT, d));

const missing = { blog: new Map(), project: new Map() };
for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    const p = m[1].split("?")[0];
    if (p.includes("${")) continue;
    if (p.startsWith("/blog/author/")) continue;
    if (p === "/blog" || PROJECT_HUB.has(p)) continue;
    if (p.startsWith("/blog/")) {
      const slug = p.slice(6);
      if (BLOG_PLACEHOLDER_SLUGS.has(slug)) continue;
      if (REDIRECT_BLOG_SLUGS.has(slug)) continue;
      if (!enBlogs.has(slug)) {
        if (!missing.blog.has(slug)) missing.blog.set(slug, []);
        if (missing.blog.get(slug).length < 2)
          missing.blog.get(slug).push(path.relative(ROOT, file));
      }
    } else if (p.startsWith("/projects/")) {
      const slug = p.slice(10);
      if (REDIRECT_PROJECT_SLUGS.has(slug)) continue;
      if (!enProjects.has(slug)) {
        if (!missing.project.has(slug)) missing.project.set(slug, []);
        if (missing.project.get(slug).length < 2)
          missing.project.get(slug).push(path.relative(ROOT, file));
      }
    }
  }
  }
}

// data.ts blog cards
const dataTs = path.join(ROOT, "src/app/data.ts");
if (fs.existsSync(dataTs)) {
  const text = fs.readFileSync(dataTs, "utf8");
  for (const m of text.matchAll(/href: "\/blog\/([^"]+)"/g)) {
    const slug = m[1];
    if (!enBlogs.has(slug)) {
      if (!missing.blog.has(slug)) missing.blog.set(slug, []);
      missing.blog.get(slug).push("src/app/data.ts");
    }
  }
}

console.log(`Published EN blogs: ${enBlogs.size}`);
console.log(`Published EN projects: ${enProjects.size}`);
console.log(`Missing hardcoded blog slugs: ${missing.blog.size}`);
for (const [slug, files] of [...missing.blog.entries()].sort()) {
  console.log(`  /blog/${slug}`);
  for (const f of files) console.log(`    ${f}`);
}
console.log(`Missing hardcoded project slugs: ${missing.project.size}`);
for (const [slug, files] of [...missing.project.entries()].sort()) {
  console.log(`  /projects/${slug}`);
  for (const f of files) console.log(`    ${f}`);
}

process.exit(missing.blog.size + missing.project.size > 0 ? 1 : 0);
