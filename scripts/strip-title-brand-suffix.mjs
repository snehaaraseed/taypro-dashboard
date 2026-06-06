#!/usr/bin/env node
/**
 * Strip trailing "| Taypro" from page meta.title values so layout template adds it once.
 * Usage: node scripts/strip-title-brand-suffix.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const SUFFIX_RE = /\s*\|\s*Taypro\s*$/;
const KEYS = new Set([
  "title",
  "metaTitle",
  "notFoundTitle",
  "metaTitleSuffix",
  "default",
]);

function stripBrand(value) {
  if (typeof value !== "string") return value;
  if (!SUFFIX_RE.test(value)) return value;
  return value.replace(SUFFIX_RE, "").trimEnd();
}

function walk(obj, pathKeys = []) {
  if (Array.isArray(obj)) {
    return obj.map((item, i) => walk(item, [...pathKeys, String(i)]));
  }
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [key, val] of Object.entries(obj)) {
      if (KEYS.has(key) && typeof val === "string") {
        out[key] = stripBrand(val);
      } else {
        out[key] = walk(val, [...pathKeys, key]);
      }
    }
    return out;
  }
  return obj;
}

const pagesDir = path.join(root, "messages/pages");
let changed = 0;

for (const locale of fs.readdirSync(pagesDir)) {
  const localeDir = path.join(pagesDir, locale);
  if (!fs.statSync(localeDir).isDirectory()) continue;
  for (const file of fs.readdirSync(localeDir)) {
    if (!file.endsWith(".json")) continue;
    const filePath = path.join(localeDir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    const next = walk(data);
    const nextRaw = JSON.stringify(next, null, 2) + "\n";
    if (nextRaw !== raw) {
      changed++;
      console.log(`${dryRun ? "[dry-run] " : ""}updated ${filePath}`);
      if (!dryRun) fs.writeFileSync(filePath, nextRaw);
    }
  }
}

console.log(`Done. ${changed} file(s) ${dryRun ? "would change" : "changed"}.`);
