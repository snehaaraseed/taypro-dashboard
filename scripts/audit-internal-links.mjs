#!/usr/bin/env node
/**
 * Audits hardcoded internal links in src/ + messages/ against App Router pages,
 * compare config, and next.config redirects.
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APP_LOCALE = path.join(ROOT, "src/app/[locale]");
const SKIP = new Set(["node_modules", ".next", ".git"]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|json|md|mjs)$/.test(name)) files.push(full);
  }
  return files;
}

function collectStaticRoutes(dir, prefix = "") {
  const routes = new Set();
  if (!fs.existsSync(dir)) return routes;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!fs.statSync(full).isDirectory()) continue;
    if (name === "api") continue;
    const isDynamic = name.startsWith("[") && name.endsWith("]");
    const segment = isDynamic ? null : name;
    const nextPrefix = segment ? `${prefix}/${segment}` : prefix;
    const hasPage =
      fs.existsSync(path.join(full, "page.tsx")) ||
      fs.existsSync(path.join(full, "page.ts"));
    if (hasPage && !isDynamic) routes.add(nextPrefix || "/");
    for (const sub of collectStaticRoutes(full, nextPrefix)) routes.add(sub);
  }
  return routes;
}

const staticRoutes = collectStaticRoutes(APP_LOCALE);
staticRoutes.add("/");

const nc = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
const redirectDests = new Set();
for (const m of nc.matchAll(/destination:\s*"(\/[^"#]+)"/g)) {
  const d = m[1];
  if (!d.includes(":")) redirectDests.add(d.replace(/\/$/, "") || "/");
}

const compareCfg = fs.readFileSync(
  path.join(ROOT, "src/lib/seo/comparison-pages-config.ts"),
  "utf8"
);
const comparePaths = new Set(
  [...compareCfg.matchAll(/path:\s*"(\/compare\/[^"]+)"/g)].map((m) => m[1])
);

const PROJECT_STATIC = new Set([
  "/projects",
  "/projects/capex",
  "/projects/opex",
  "/projects/automatic",
  "/projects/semi-automatic",
]);

function normalize(p) {
  let n = p.split("?")[0].split("#")[0];
  if (n.length > 1 && n.endsWith("/")) n = n.slice(0, -1);
  return n;
}

function matchesRoute(p) {
  if (redirectDests.has(p)) return "redirect";
  if (staticRoutes.has(p)) return "static";
  if (comparePaths.has(p)) return "compare";

  if (/^\/blog\/author\/[^/]+$/.test(p)) return "dynamic:blog-author";
  if (/^\/blog\/[^/]+$/.test(p)) return "dynamic:blog";
  if (/^\/projects\/[^/]+$/.test(p) && !PROJECT_STATIC.has(p))
    return "dynamic:project";
  if (/^\/compare\/[^/]+$/.test(p)) return "broken-compare";

  return false;
}

const LINK_RES = [
  /href=\{?"(\/[^"'#?\s{}]+)/g,
  /href:\s*"(\/[^"#?\s{}]+)/g,
  /href=\s*"(\/[^"#?\s{}]+)/g,
  /Link\s+[^>]*href=\{?"(\/[^"'#?\s{}]+)/g,
];

const refs = new Map();
for (const dir of ["src", "messages"]) {
  const base = path.join(ROOT, dir);
  if (!fs.existsSync(base)) continue;
  for (const file of walk(base)) {
    if (file.includes("/admin/")) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const re of LINK_RES) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        const raw = m[1];
        if (raw.includes("${") || raw.includes("{") || raw.includes("`")) continue;
        if (
          raw.startsWith("/uploads") ||
          raw.startsWith("/taypro") ||
          raw.startsWith("/360-degree") ||
          raw.startsWith("/api")
        )
          continue;
        const p = normalize(raw);
        if (!refs.has(p)) refs.set(p, []);
        const rel = path.relative(ROOT, file);
        if (!refs.get(p).includes(rel) && refs.get(p).length < 3)
          refs.get(p).push(rel);
      }
    }
  }
}

const broken = [];
const dynamic = [];
for (const [p, sources] of [...refs.entries()].sort()) {
  const match = matchesRoute(p);
  if (match === false || match === "broken-compare") {
    broken.push({ p, sources, reason: match === "broken-compare" ? "unknown compare slug" : "no route" });
  } else if (String(match).startsWith("dynamic:")) {
    dynamic.push({ p, sources, type: match });
  }
}

console.log(`Static app routes: ${staticRoutes.size}`);
console.log(`Internal link targets scanned: ${refs.size}`);
console.log(`Dynamic (CMS/runtime): ${dynamic.length}`);
console.log(`BROKEN: ${broken.length}\n`);

if (broken.length) {
  for (const { p, sources, reason } of broken) {
    console.log(`${p} (${reason})`);
    for (const s of sources) console.log(`  ${s}`);
    console.log();
  }
} else {
  console.log("No broken hardcoded internal links found.");
}

// Blog slugs in data.ts — check content/cms if files exist
const data = fs.readFileSync(path.join(ROOT, "src/app/data.ts"), "utf8");
const blogSlugs = [
  ...new Set(
    [...data.matchAll(/href:\s*"\/blog\/([^"]+)"/g)].map((m) => m[1])
  ),
];
const cmsBlogDir = path.join(ROOT, "content/blogs");
const fileBlogs = fs.existsSync(cmsBlogDir)
  ? new Set(fs.readdirSync(cmsBlogDir).map((f) => f.replace(/\.mdx?$/, "")))
  : new Set();
const missingBlogs = blogSlugs.filter((s) => !fileBlogs.has(s));
console.log(`\nBlog links in data.ts: ${blogSlugs.length}`);
console.log(`  On disk under content/blogs: ${fileBlogs.size} files`);
console.log(`  Not in content/blogs (likely CMS-only): ${missingBlogs.length}`);

export { broken, dynamic };
