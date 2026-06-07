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

function walk(dir, files = []) {
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

const missing = { blog: new Map(), project: new Map() };
for (const file of walk(path.join(ROOT, "src"))) {
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
      if (!enBlogs.has(slug)) {
        if (!missing.blog.has(slug)) missing.blog.set(slug, []);
        if (missing.blog.get(slug).length < 2)
          missing.blog.get(slug).push(path.relative(ROOT, file));
      }
    } else if (p.startsWith("/projects/")) {
      const slug = p.slice(10);
      if (!enProjects.has(slug)) {
        if (!missing.project.has(slug)) missing.project.set(slug, []);
        if (missing.project.get(slug).length < 2)
          missing.project.get(slug).push(path.relative(ROOT, file));
      }
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
