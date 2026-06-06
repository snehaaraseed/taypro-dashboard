#!/usr/bin/env node
/**
 * Fails CI when src/ references legacy flat product image filenames or Model-A/B/T 360 paths.
 * Run: node scripts/audit-product-image-paths.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const PUBLIC_360 = path.join(ROOT, "public", "360-degree-images");

const LEGACY_PATTERNS = [
  /taypro-modelA(?:copy)?\.png/i,
  /taypro-modelBcopy\.png/i,
  /taypro-modelT(?:copy|-img)?\.png/i,
  /glyde-tr150-top-view\.png/i,
  /glyde-dual-pass-mechanism\.png/i,
  /glyde-docking-power-unit\.png/i,
];

const LEGACY_360_PATTERNS = [
  /\/360-degree-images\/Model-A\//,
  /\/360-degree-images\/Model-B\//,
  /\/360-degree-images\/Model-T\//,
  /MODEL-A-/,
];

const FLAT_PRODUCT_WARN = /taypro-(?:helyx|glyde-x|nyuma)-/i;

const BRANDED_360_SAMPLES = [
  "glyde/glyde-0100.png",
  "helyx/0001-MB-2000-1224-0100.png",
  "glyde-x/0001-MT-2000-1224-0100.png",
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const failures = [];
const warnings = [];

for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file);
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of LEGACY_PATTERNS) {
    if (pattern.test(text)) {
      failures.push(`${rel}: matches ${pattern}`);
    }
  }
  for (const pattern of LEGACY_360_PATTERNS) {
    if (pattern.test(text)) {
      failures.push(`${rel}: legacy 360 path ${pattern}`);
    }
  }
  if (FLAT_PRODUCT_WARN.test(text) && !rel.includes("catalog.ts")) {
    warnings.push(`${rel}: flat taypro-*-solar-cleaning-robot path (prefer catalog)`);
  }
}

for (const sample of BRANDED_360_SAMPLES) {
  const full = path.join(PUBLIC_360, sample);
  if (!fs.existsSync(full)) {
    failures.push(`missing branded 360 frame: public/360-degree-images/${sample}`);
  }
}

if (warnings.length) {
  console.warn("Warnings:\n" + warnings.map((w) => `  - ${w}`).join("\n"));
}

if (failures.length) {
  console.error(
    "Legacy product image references found:\n" +
      failures.map((f) => `  - ${f}`).join("\n")
  );
  process.exit(1);
}

console.log("audit-product-image-paths: OK");
