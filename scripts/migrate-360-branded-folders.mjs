#!/usr/bin/env node
/**
 * Copy 360° frame sequences into branded public folders (Image SEO / Model A/B/T purge).
 * Run: node scripts/migrate-360-branded-folders.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = path.join(ROOT, "public", "360-degree-images");

const MIGRATIONS = [
  {
    from: path.join(BASE, "Model-A"),
    to: path.join(BASE, "glyde"),
    rename: (name) => name.replace(/^MODEL-A-/, "glyde-"),
  },
  {
    from: path.join(BASE, "Model-B"),
    to: path.join(BASE, "helyx"),
    rename: (name) => name,
  },
  {
    from: path.join(BASE, "Model-T"),
    to: path.join(BASE, "glyde-x"),
    rename: (name) => name,
  },
];

function copyFrames({ from, to, rename }) {
  if (!fs.existsSync(from)) {
    console.error(`Missing source directory: ${from}`);
    process.exit(1);
  }
  fs.mkdirSync(to, { recursive: true });
  const files = fs.readdirSync(from).filter((f) => f.endsWith(".png"));
  let copied = 0;
  for (const file of files) {
    const destName = rename(file);
    const dest = path.join(to, destName);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(from, file), dest);
      copied++;
    }
  }
  console.log(`${path.relative(ROOT, to)}: ${copied} new, ${files.length} total frames`);
}

for (const migration of MIGRATIONS) {
  copyFrames(migration);
}

console.log("migrate-360-branded-folders: OK");
