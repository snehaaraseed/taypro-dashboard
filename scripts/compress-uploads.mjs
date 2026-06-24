#!/usr/bin/env node
/**
 * Compress existing images IN PLACE — same path, same extension, same public URL.
 * Safe for CMS/blog/project links: nothing is renamed or deleted.
 *
 * Usage:
 *   node scripts/compress-uploads.mjs              # dry-run
 *   node scripts/compress-uploads.mjs --apply      # overwrite only when smaller
 *   node scripts/compress-uploads.mjs --apply --dir public/tayprorobots
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const APPLY = process.argv.includes("--apply");
const dirArgIdx = process.argv.indexOf("--dir");
const TARGET_DIRS =
  dirArgIdx !== -1 && process.argv[dirArgIdx + 1]
    ? [path.resolve(ROOT, process.argv[dirArgIdx + 1])]
    : [path.join(ROOT, "public", "uploads")];

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SKIP_IF_WEBP_UNDER_KB = 180;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function inferContext(filePath) {
  const base = path.basename(filePath).toLowerCase();
  if (base.startsWith("author-avatar")) return { maxWidth: 512, quality: 82 };
  if (base.startsWith("blog-inline") || base.includes("inline"))
    return { maxWidth: 1400, quality: 78 };
  if (base.startsWith("project-inline")) return { maxWidth: 1400, quality: 78 };
  if (base.startsWith("blog-") || base.startsWith("project-hero"))
    return { maxWidth: 1920, quality: 80 };
  return { maxWidth: 1920, quality: 80 };
}

/** Encode in the same format as the source file — never change extension or URL. */
async function encodeInPlace(buffer, ext, maxWidth, quality) {
  const pipeline = sharp(buffer).rotate().resize({
    width: maxWidth,
    withoutEnlargement: true,
  });

  switch (ext) {
    case ".webp":
      return pipeline.webp({ quality, effort: 4 }).toBuffer();
    case ".jpg":
    case ".jpeg":
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case ".png":
      return pipeline.png({ compressionLevel: 9, effort: 7 }).toBuffer();
    default:
      throw new Error(`unsupported extension: ${ext}`);
  }
}

function writeInPlaceAtomic(filePath, data) {
  const tmp = `${filePath}.compress-tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;

  const before = fs.statSync(filePath).size;
  if (ext === ".webp" && before < SKIP_IF_WEBP_UNDER_KB * 1024) {
    return { skipped: true, reason: "already-small-webp", before };
  }

  const { maxWidth, quality } = inferContext(filePath);
  const input = fs.readFileSync(filePath);
  const result = await encodeInPlace(input, ext, maxWidth, quality);

  if (result.length >= before * 0.97) {
    return {
      skipped: true,
      reason: "no-meaningful-gain",
      before,
      after: result.length,
    };
  }

  if (APPLY) {
    writeInPlaceAtomic(filePath, result);
  }

  return {
    skipped: false,
    before,
    after: result.length,
    outPath: path.relative(ROOT, filePath),
  };
}

async function main() {
  const files = TARGET_DIRS.flatMap((d) => walk(d));
  let saved = 0;
  let processed = 0;
  let skipped = 0;

  console.log(
    `${APPLY ? "APPLY" : "DRY-RUN"} — ${files.length} files under ${TARGET_DIRS.map((d) => path.relative(ROOT, d)).join(", ")}`
  );
  console.log(
    "URLs are preserved: each file is overwritten in place (same path and extension).\n"
  );

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    try {
      const result = await compressFile(file);
      if (!result) continue;
      if (result.skipped) {
        skipped += 1;
        continue;
      }
      processed += 1;
      saved += result.before - result.after;
      const pct = Math.round((1 - result.after / result.before) * 100);
      console.log(
        `  ${result.outPath}: ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB (-${pct}%)`
      );
    } catch (err) {
      console.warn(
        `  skip ${path.relative(ROOT, file)}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log(
    `\nDone. ${processed} compressed, ${skipped} skipped, ${(saved / 1024 / 1024).toFixed(2)} MB saved${APPLY ? "" : " (dry-run — pass --apply to write)"}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
