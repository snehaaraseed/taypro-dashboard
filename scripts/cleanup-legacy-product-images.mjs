#!/usr/bin/env node
/**
 * Remove legacy product image files that are superseded by branded paths.
 * 301 redirects in next.config.ts must remain for old URLs.
 *
 * Run: node scripts/cleanup-legacy-product-images.mjs
 * Dry run: node scripts/cleanup-legacy-product-images.mjs --dry-run
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");

/** Relative paths under public/ to delete. */
const LEGACY_FILES = [
  "tayprorobots/taypro-glyde-x-tracker-solar-cleaning-robot.png",
  "tayprorobots/taypro-helyx-semi-automatic-solar-cleaning-robot.png",
  "tayprorobots/taypro-nyuma-automatic-solar-cleaning-robot.png",
  "tayprorobots/taypro-nyuma-x-tracker-solar-cleaning-robot.png",
  "tayprorobots/taypro-modelA.png",
  "tayprorobots/taypro-modelAcopy.png",
  "tayprorobots/taypro-modelBcopy.png",
  "tayprorobots/taypro-modelT-img.png",
  "tayprorobots/taypro-modelTcopy.png",
  "tayprorobots/glyde/glyde-tr150-top-view.png",
  "tayprorobots/glyde/glyde-dual-pass-mechanism.png",
  "tayprorobots/glyde/glyde-docking-power-unit.png",
  /** Duplicate of brush-detail; catalog uses brush-detail.webp */
  "tayprorobots/nyuma/hero.png",
  "tayprorobots/nyuma/hero.webp",
];

const LEGACY_DIRS = [
  "360-degree-images/Model-A",
  "360-degree-images/Model-B",
  "360-degree-images/Model-T",
];

function rmFile(rel) {
  const full = path.join(ROOT, "public", rel);
  if (!fs.existsSync(full)) return { rel, status: "missing" };
  if (dryRun) return { rel, status: "would-delete" };
  fs.unlinkSync(full);
  return { rel, status: "deleted" };
}

function rmDir(rel) {
  const full = path.join(ROOT, "public", rel);
  if (!fs.existsSync(full)) return { rel, status: "missing" };
  if (dryRun) {
    const count = fs.readdirSync(full).length;
    return { rel, status: `would-delete (${count} entries)` };
  }
  fs.rmSync(full, { recursive: true, force: true });
  return { rel, status: "deleted" };
}

console.log(dryRun ? "DRY RUN — no files removed\n" : "Removing legacy product images…\n");

let bytes = 0;
for (const rel of LEGACY_FILES) {
  const full = path.join(ROOT, "public", rel);
  if (fs.existsSync(full)) bytes += fs.statSync(full).size;
  const { status } = rmFile(rel);
  console.log(`  [file] ${rel} — ${status}`);
}

for (const rel of LEGACY_DIRS) {
  const full = path.join(ROOT, "public", rel);
  if (fs.existsSync(full)) {
    for (const f of fs.readdirSync(full)) {
      const fp = path.join(full, f);
      if (fs.statSync(fp).isFile()) bytes += fs.statSync(fp).size;
    }
  }
  const { status } = rmDir(rel);
  console.log(`  [dir]  ${rel} — ${status}`);
}

const mb = (bytes / (1024 * 1024)).toFixed(1);
console.log(`\ncleanup-legacy-product-images: ${dryRun ? "dry run" : "done"} (~${mb} MB${dryRun ? " would be" : ""} freed)`);
