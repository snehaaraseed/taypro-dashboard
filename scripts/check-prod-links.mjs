#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const SITE = process.env.SITE_URL || "https://taypro.in";
const SKIP = new Set(["node_modules", ".next", ".git", "admin"]);
const LINK_RE = /["'`](\/blog\/[^"'`?#\s]+|\/projects\/[^"'`?#\s]+)/g;
const PROJECT_HUB = new Set([
  "/projects",
  "/projects/automatic",
  "/projects/semi-automatic",
  "/projects/capex",
  "/projects/opex",
]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(name) && !full.includes("/admin/"))
      files.push(full);
  }
  return files;
}

function httpCode(url) {
  try {
    return execSync(`curl -s -o /dev/null -w "%{http_code}" --max-time 15 "${url}"`, {
      encoding: "utf8",
    }).trim();
  } catch {
    return "timeout";
  }
}

function collectPaths() {
  const paths = new Set();
  for (const file of walk(path.join(ROOT, "src/app"))) {
    const text = fs.readFileSync(file, "utf8");
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(text)) !== null) {
      const p = m[1].split("?")[0];
      if (p.includes("${") || p.includes("`") || p.includes("{")) continue;
      if (p.startsWith("/blog/author/")) continue;
      if (p === "/blog" || PROJECT_HUB.has(p)) continue;
      paths.add(p);
    }
  }
  return [...paths].sort();
}

function collectDataTsBlogSlugs() {
  const text = fs.readFileSync(path.join(ROOT, "src/app/data.ts"), "utf8");
  return [
    ...new Set([...text.matchAll(/href: "\/blog\/([^"]+)"/g)].map((m) => m[1])),
  ].sort();
}

function sampleSitemapUrls(limit = 80) {
  const xml = execSync(`curl -s --max-time 30 "${SITE}/sitemap.xml"`, {
    encoding: "utf8",
  });
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const step = Math.max(1, Math.floor(locs.length / limit));
  const sample = [];
  for (let i = 0; i < locs.length && sample.length < limit; i += step) {
    sample.push(locs[i]);
  }
  return { total: locs.length, sample };
}

const fails = [];
const oks = [];

function check(label, url) {
  const code = httpCode(url);
  const entry = { label, url, code };
  if (code === "200" || code === "307" || code === "308") oks.push(entry);
  else fails.push(entry);
  return code;
}

console.log(`Checking ${SITE}\n`);

const appPaths = collectPaths();
console.log(`Hardcoded src/app CMS paths: ${appPaths.length}`);
for (const p of appPaths) check(p, `${SITE}${p}`);

const dataSlugs = collectDataTsBlogSlugs();
console.log(`data.ts blog slugs: ${dataSlugs.length}`);
for (const slug of dataSlugs) {
  check(`data.ts:${slug}`, `${SITE}/blog/${slug}`);
}

const { total, sample } = sampleSitemapUrls(60);
console.log(`Sitemap URLs: ${total} (sampling ${sample.length})`);
for (const url of sample) check("sitemap", url);

console.log(`\nOK: ${oks.length}`);
console.log(`FAIL: ${fails.length}`);
if (fails.length) {
  for (const f of fails) console.log(`  ${f.code}\t${f.label}\t${f.url}`);
  process.exit(1);
}
