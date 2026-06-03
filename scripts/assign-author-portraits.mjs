/**
 * Copy author portrait PNGs into public/uploads and set authors.avatar_url.
 *
 * Usage:
 *   AUTHOR_ASSETS_DIR=/path/to/assets node scripts/assign-author-portraits.mjs
 *   node scripts/assign-author-portraits.mjs --dry-run
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "author-avatar-files.json"), "utf8")
);

function resolveAssetsDir() {
  if (process.env.AUTHOR_ASSETS_DIR) {
    return path.resolve(process.env.AUTHOR_ASSETS_DIR);
  }
  const fromConfig = path.resolve(__dirname, config.assetsDir);
  if (fs.existsSync(fromConfig)) return fromConfig;
  return path.resolve(
    process.env.HOME || "",
    ".cursor/projects/Users-yogesh-TayproWebsite-taypro-dashboard/assets"
  );
}

const assetsDir = resolveAssetsDir();
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const uploadRelDir = "2026/06";
const uploadAbsDir = path.join(root, "public", "uploads", uploadRelDir);

if (!fs.existsSync(assetsDir)) {
  console.error("Assets dir not found:", assetsDir);
  process.exit(1);
}
if (!fs.existsSync(dbPath)) {
  console.error("DB not found:", dbPath);
  process.exit(1);
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = dryRun ? null : new Database(dbPath);
const now = new Date().toISOString();
const stamp = Date.now();

const updateAuthor = db?.prepare(`
  UPDATE authors SET avatar_url = @url, updated_at = @updatedAt WHERE slug = @slug
`);
const upsertUpload = db?.prepare(`
  INSERT OR IGNORE INTO uploads (url, file_name, file_path, mime_type, size, uploaded_at)
  VALUES (@url, @fileName, @filePath, @mimeType, @size, @uploadedAt)
`);

let ok = 0;
for (const [slug, filename] of Object.entries(config.authors)) {
  const src = path.join(assetsDir, filename);
  if (!fs.existsSync(src)) {
    console.warn("Missing file:", src);
    continue;
  }

  const destName = `author-${slug}-${stamp}.png`;
  const destAbs = path.join(uploadAbsDir, destName);
  const publicUrl = `/uploads/${uploadRelDir}/${destName}`;

  if (!dryRun) {
    mkdirp(uploadAbsDir);
    fs.copyFileSync(src, destAbs);
    const stat = fs.statSync(destAbs);
    updateAuthor.run({ slug, url: publicUrl, updatedAt: now });
    upsertUpload.run({
      url: publicUrl,
      fileName: destName,
      filePath: destAbs,
      mimeType: "image/png",
      size: stat.size,
      uploadedAt: now,
    });
  }

  console.log(`${dryRun ? "[dry-run] " : ""}${slug} → ${publicUrl}`);
  ok += 1;
}

if (db) db.close();
console.log(`\n${dryRun ? "Would assign" : "Assigned"} ${ok} portrait(s). Assets: ${assetsDir}`);
