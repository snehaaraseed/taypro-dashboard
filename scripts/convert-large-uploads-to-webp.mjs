#!/usr/bin/env node
/**
 * Convert large legacy JPG/PNG uploads to WebP and rewrite CMS URLs.
 *
 *   node scripts/convert-large-uploads-to-webp.mjs
 *   node scripts/convert-large-uploads-to-webp.mjs --apply
 *   node scripts/convert-large-uploads-to-webp.mjs --apply --min-kb 500
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const minKbIdx = process.argv.indexOf("--min-kb");
const MIN_BYTES =
  minKbIdx !== -1 && process.argv[minKbIdx + 1]
    ? Number(process.argv[minKbIdx + 1]) * 1024
    : 500 * 1024;

const UPLOADS_ROOT = path.join(ROOT, "public", "uploads");
const DB_PATH = process.env.CMS_SQLITE || path.join(ROOT, "data", "cms.sqlite");
const RASTER_EXT = new Set([".jpg", ".jpeg", ".png"]);

function inferProfile(filePath) {
  const base = path.basename(filePath).toLowerCase();
  if (base.startsWith("author-avatar")) return { maxWidth: 512, quality: 82 };
  if (base.startsWith("blog-inline") || base.includes("inline"))
    return { maxWidth: 1400, quality: 78 };
  if (base.startsWith("project-inline")) return { maxWidth: 1400, quality: 78 };
  if (base.startsWith("blog-") || base.startsWith("project-hero"))
    return { maxWidth: 1920, quality: 80 };
  if (base.includes("screenshot") || base.includes("chatgpt"))
    return { maxWidth: 1400, quality: 78 };
  return { maxWidth: 1400, quality: 78 };
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function publicUrl(absPath) {
  const rel = path.relative(path.join(ROOT, "public"), absPath).split(path.sep).join("/");
  return `/${rel}`;
}

function replaceUrlInText(text, from, to) {
  if (!text || !text.includes(from)) return { text, count: 0 };
  const parts = text.split(from);
  return { text: parts.join(to), count: parts.length - 1 };
}

function rewriteCmsUrls(db, fromUrl, toUrl) {
  let total = 0;
  const tables = [
    { name: "blogs", cols: ["content", "featured_image"] },
    { name: "projects", cols: ["content", "image"] },
  ];

  for (const { name, cols } of tables) {
    const rows = db.prepare(`SELECT id, ${cols.join(", ")} FROM ${name}`).all();
    for (const row of rows) {
      let changed = false;
      const updates = {};
      for (const col of cols) {
        const value = row[col];
        if (typeof value !== "string") continue;
        const { text, count } = replaceUrlInText(value, fromUrl, toUrl);
        if (count > 0) {
          updates[col] = text;
          total += count;
          changed = true;
        }
      }
      if (changed && APPLY) {
        const setClause = Object.keys(updates)
          .map((c) => `${c} = @${c}`)
          .join(", ");
        db.prepare(`UPDATE ${name} SET ${setClause} WHERE id = @id`).run({
          id: row.id,
          ...updates,
        });
      }
    }
  }

  if (APPLY) {
    db.prepare(`UPDATE uploads SET url = ?, file_name = ?, mime_type = 'image/webp' WHERE url = ?`).run(
      toUrl,
      path.basename(toUrl),
      fromUrl
    );
  }

  return total;
}

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!RASTER_EXT.has(ext)) return null;

  const before = fs.statSync(filePath).size;
  if (before < MIN_BYTES) return { skipped: true, reason: "under-min-size", before };

  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, ".webp");
  if (fs.existsSync(webpPath) && fs.statSync(webpPath).size < before * 0.5) {
    return {
      skipped: true,
      reason: "webp-exists",
      before,
      fromUrl: publicUrl(filePath),
      toUrl: publicUrl(webpPath),
    };
  }

  const { maxWidth, quality } = inferProfile(filePath);
  const input = fs.readFileSync(filePath);
  const result = await sharp(input)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  if (result.data.length >= before * 0.85) {
    return {
      skipped: true,
      reason: "no-meaningful-gain",
      before,
      after: result.data.length,
    };
  }

  if (APPLY) {
    fs.writeFileSync(webpPath, result.data);
    fs.unlinkSync(filePath);
  }

  return {
    skipped: false,
    before,
    after: result.data.length,
    fromUrl: publicUrl(filePath),
    toUrl: publicUrl(webpPath),
    outPath: path.relative(ROOT, webpPath),
  };
}

async function main() {
  const candidates = walk(UPLOADS_ROOT).filter((f) =>
    RASTER_EXT.has(path.extname(f).toLowerCase())
  );

  console.log(
    `${APPLY ? "APPLY" : "DRY-RUN"} — ${candidates.length} raster files, min ${(MIN_BYTES / 1024).toFixed(0)} KB\n`
  );

  const db = fs.existsSync(DB_PATH) ? new Database(DB_PATH) : null;
  let converted = 0;
  let cmsRefs = 0;
  let saved = 0;

  for (const file of candidates) {
    try {
      const result = await convertFile(file);
      if (!result || result.skipped) continue;

      converted += 1;
      saved += result.before - result.after;
      const pct = Math.round((1 - result.after / result.before) * 100);
      console.log(
        `  ${result.outPath}: ${(result.before / 1024 / 1024).toFixed(2)}MB → ${(result.after / 1024).toFixed(0)}KB (-${pct}%)`
      );

      if (db) {
        const n = rewriteCmsUrls(db, result.fromUrl, result.toUrl);
        if (n > 0) {
          cmsRefs += n;
          console.log(`    CMS: ${n} reference(s) ${result.fromUrl} → ${result.toUrl}`);
        }
      }
    } catch (err) {
      console.warn(`  skip ${path.relative(ROOT, file)}:`, err.message);
    }
  }

  if (db) db.close();

  console.log(
    `\nDone. ${converted} file(s) converted, ${cmsRefs} CMS reference(s) updated, ${(saved / 1024 / 1024).toFixed(1)} MB saved${APPLY ? "" : " (dry-run — pass --apply to write)"}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
