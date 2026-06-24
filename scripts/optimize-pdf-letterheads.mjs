#!/usr/bin/env node
/**
 * Regenerate lightweight JPEG letterheads for ROI PDFs (from full-resolution PNG masters).
 * Run after updating public/tayproasset/pdf-letterhead/*.png artwork.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public/tayproasset/pdf-letterhead"
);

const jobs = [
  {
    src: "letterhead_universal.png",
    tmp: "letterhead_universal-resized.png",
    out: "letterhead_universal-pdf.jpg",
    maxPx: 1240,
    quality: 80,
  },
  {
    src: "LetterHead.png",
    tmp: "LetterHead-resized.png",
    out: "LetterHead-pdf.jpg",
    maxPx: 800,
    quality: 80,
  },
];

for (const { src, tmp, out, maxPx, quality } of jobs) {
  const srcPath = path.join(dir, src);
  const tmpPath = path.join(dir, tmp);
  const outPath = path.join(dir, out);
  if (!fs.existsSync(srcPath)) {
    console.error(`Missing source: ${srcPath}`);
    process.exit(1);
  }
  execSync(`sips -Z ${maxPx} "${srcPath}" --out "${tmpPath}"`, { stdio: "inherit" });
  execSync(
    `sips -s format jpeg -s formatOptions ${quality} "${tmpPath}" --out "${outPath}"`,
    { stdio: "inherit" }
  );
  fs.unlinkSync(tmpPath);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`Wrote ${out} (${kb} KB)`);
}
