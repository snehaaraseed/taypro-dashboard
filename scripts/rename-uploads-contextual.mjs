#!/usr/bin/env node
/**
 * Rename poorly named uploads (WhatsApp, IMG_, generic image-*, etc.) to
 * contextual names — and update every CMS reference so public URLs keep working.
 *
 * Safe workflow:
 *   node scripts/rename-uploads-contextual.mjs              # dry-run manifest
 *   node scripts/rename-uploads-contextual.mjs --apply        # rename + DB update
 *   node scripts/rename-uploads-contextual.mjs --apply --pattern whatsapp --only-referenced
 *
 * Env: CMS_SQLITE (default data/cms.sqlite)
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DB_PATH = process.env.CMS_SQLITE || path.join(ROOT, "data", "cms.sqlite");
const UPLOADS_ROOT = path.join(ROOT, "public", "uploads");

const APPLY = process.argv.includes("--apply");
const ONLY_REFERENCED = process.argv.includes("--only-referenced");
const patternIdx = process.argv.indexOf("--pattern");
const PATTERN_FILTER =
  patternIdx !== -1 && process.argv[patternIdx + 1]
    ? new RegExp(process.argv[patternIdx + 1], "i")
    : null;

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

const PREFIX_BY_ROLE = {
  "blog-featured": "blog-featured",
  "project-hero": "project-hero",
  "author-avatar": "author-avatar",
  "blog-inline": "blog-inline",
  "project-inline": "project-inline",
  general: "upload",
};

/** Filenames that should be renamed for SEO/clarity. */
function needsContextualRename(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  if (PATTERN_FILTER && !PATTERN_FILTER.test(base)) return false;
  // Skip WordPress auto-generated thumbnails (not used in CMS).
  if (/-\d+x\d+(-scaled)?$/i.test(base)) return false;
  if (/^(blog|project|author)-/i.test(base)) return false;
  return (
    /whatsapp/i.test(base) ||
    /^IMG[-_\d]/i.test(base) ||
    /^DSC[-_]/i.test(base) ||
    /^Screenshot/i.test(base) ||
    /^photo[-_]?\d/i.test(base) ||
    /^image[-_]?\d/i.test(base) ||
    /^[\d]{10,}(-scaled)?$/i.test(base) ||
    /^[A-F0-9]{8}-[A-F0-9]{4}/i.test(base) ||
    (PATTERN_FILTER ? PATTERN_FILTER.test(base) : false)
  );
}

function sanitizeLabel(label) {
  return (
    String(label)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  );
}

function extractTimestamp(baseName) {
  const m = baseName.match(/-(\d{10,13})$/);
  return m ? m[1] : String(Date.now());
}

function walkUploads(dir, rel = "/uploads", out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkUploads(full, `${rel}/${name}`, out);
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    out.push({
      url: `${rel}/${name}`.replace(/\/+/g, "/"),
      fileName: name,
      filePath: full,
      baseName: path.basename(name, ext),
      ext,
    });
  }
  return out;
}

function findUsages(db, url) {
  const usages = [];

  for (const row of db
    .prepare(
      `SELECT slug, locale, title, featured_image AS ref FROM blogs WHERE featured_image = ?`
    )
    .all(url)) {
    usages.push({
      role: "blog-featured",
      slug: row.slug,
      locale: row.locale,
      title: row.title,
      priority: 1,
    });
  }

  for (const row of db
    .prepare(`SELECT slug, locale, title, image AS ref FROM projects WHERE image = ?`)
    .all(url)) {
    usages.push({
      role: "project-hero",
      slug: row.slug,
      locale: row.locale,
      title: row.title,
      priority: 2,
    });
  }

  for (const row of db
    .prepare(`SELECT slug, name AS title, avatar_url AS ref FROM authors WHERE avatar_url = ?`)
    .all(url)) {
    usages.push({
      role: "author-avatar",
      slug: row.slug,
      locale: "en",
      title: row.title,
      priority: 3,
    });
  }

  const like = `%${url}%`;

  for (const row of db
    .prepare(
      `SELECT slug, locale, title FROM blogs WHERE content LIKE ? AND featured_image != ?`
    )
    .all(like, url)) {
    usages.push({
      role: "blog-inline",
      slug: row.slug,
      locale: row.locale,
      title: row.title,
      priority: 4,
    });
  }

  for (const row of db
    .prepare(
      `SELECT slug, locale, title FROM projects WHERE content LIKE ? AND image != ?`
    )
    .all(like, url)) {
    usages.push({
      role: "project-inline",
      slug: row.slug,
      locale: row.locale,
      title: row.title,
      priority: 5,
    });
  }

  usages.sort((a, b) => a.priority - b.priority || a.slug.localeCompare(b.slug));
  return usages;
}

function isUsedOnSite(db, url) {
  const like = `%${url}%`;
  if (db.prepare(`SELECT 1 FROM blogs WHERE featured_image = ? OR content LIKE ? LIMIT 1`).get(url, like))
    return true;
  if (db.prepare(`SELECT 1 FROM projects WHERE image = ? OR content LIKE ? LIMIT 1`).get(url, like))
    return true;
  if (db.prepare(`SELECT 1 FROM authors WHERE avatar_url = ? LIMIT 1`).get(url)) return true;
  return false;
}

function pickPrimaryUsage(usages) {
  if (usages.length === 0) return { role: "general", slug: "misc", title: "" };
  const primary = usages[0];
  return { role: primary.role, slug: primary.slug, title: primary.title };
}

function buildNewFileName(file, usage) {
  const prefix = PREFIX_BY_ROLE[usage.role] || PREFIX_BY_ROLE.general;
  const label = sanitizeLabel(usage.slug || usage.title || "misc");
  const ts = extractTimestamp(file.baseName);
  return `${prefix}-${label}-${ts}${file.ext}`;
}

function collectRenamePlan(db, files) {
  const plan = [];
  const reservedNames = new Set(files.map((f) => f.fileName.toLowerCase()));

  for (const file of files) {
    if (!needsContextualRename(file.fileName)) continue;

    const usages = findUsages(db, file.url);
    const onSite = isUsedOnSite(db, file.url);
    if (ONLY_REFERENCED && !onSite) continue;

    const usage = pickPrimaryUsage(usages);
    let newFileName = buildNewFileName(file, usage);
    let n = 2;
    while (reservedNames.has(newFileName.toLowerCase())) {
      const ext = file.ext;
      const base = newFileName.slice(0, -ext.length);
      newFileName = `${base}-dup${n}${ext}`;
      n += 1;
    }
    reservedNames.add(newFileName.toLowerCase());

    const dirUrl = path.posix.dirname(file.url);
    const newUrl = `${dirUrl}/${newFileName}`;

    if (newUrl === file.url) continue;

    plan.push({
      oldUrl: file.url,
      newUrl,
      oldPath: file.filePath,
      newPath: path.join(path.dirname(file.filePath), newFileName),
      oldFileName: file.fileName,
      newFileName,
      usage,
      usageCount: usages.length,
      onSite,
      inUploadsIndex: Boolean(
        db.prepare(`SELECT 1 FROM uploads WHERE url = ?`).get(file.url)
      ),
    });
  }

  return plan;
}

function applyPlan(db, plan) {
  const replaceUrl = db.transaction((entry) => {
    if (!fs.existsSync(entry.oldPath)) {
      throw new Error(`Missing file: ${entry.oldPath}`);
    }
    if (fs.existsSync(entry.newPath)) {
      throw new Error(`Target already exists: ${entry.newPath}`);
    }

    fs.renameSync(entry.oldPath, entry.newPath);

    const { oldUrl, newUrl, newFileName, newPath } = entry;

    db.prepare(`UPDATE uploads SET url = ?, file_name = ?, file_path = ? WHERE url = ?`).run(
      newUrl,
      newFileName,
      newPath,
      oldUrl
    );

    db.prepare(`UPDATE blogs SET featured_image = ? WHERE featured_image = ?`).run(
      newUrl,
      oldUrl
    );
    db.prepare(
      `UPDATE blogs SET content = replace(content, ?, ?) WHERE content LIKE ?`
    ).run(oldUrl, newUrl, `%${oldUrl}%`);

    db.prepare(`UPDATE projects SET image = ? WHERE image = ?`).run(newUrl, oldUrl);
    db.prepare(
      `UPDATE projects SET content = replace(content, ?, ?) WHERE content LIKE ?`
    ).run(oldUrl, newUrl, `%${oldUrl}%`);

    db.prepare(`UPDATE authors SET avatar_url = ? WHERE avatar_url = ?`).run(
      newUrl,
      oldUrl
    );
  });

  let applied = 0;
  for (const entry of plan) {
    replaceUrl(entry);
    applied += 1;
  }
  return applied;
}

function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`CMS database not found: ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  const files = walkUploads(UPLOADS_ROOT);
  const plan = collectRenamePlan(db, files);

  const onSite = plan.filter((p) => p.onSite);
  const galleryOnly = plan.filter((p) => !p.onSite);

  console.log(
    `${APPLY ? "APPLY" : "DRY-RUN"} — ${plan.length} rename(s) planned (${onSite.length} used on live site, ${galleryOnly.length} gallery-only)\n`
  );

  if (plan.length === 0) {
    console.log("No files matched rename rules.");
    db.close();
    return;
  }

  for (const entry of plan.slice(0, 40)) {
    console.log(`  ${entry.oldUrl}`);
    console.log(`    → ${entry.newUrl}`);
    console.log(
      `    context: ${entry.usage.role} / ${entry.usage.slug}${entry.usageCount > 1 ? ` (+${entry.usageCount - 1} more refs)` : ""}${!entry.onSite ? " [admin gallery only]" : ""}`
    );
  }
  if (plan.length > 40) {
    console.log(`  … and ${plan.length - 40} more`);
  }

  const manifestPath = path.join(ROOT, "tmp", "upload-rename-manifest.json");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      plan.map((p) => ({
        oldUrl: p.oldUrl,
        newUrl: p.newUrl,
        role: p.usage.role,
        slug: p.usage.slug,
      })),
      null,
      2
    )
  );
  console.log(`\nManifest: ${manifestPath}`);

  if (!APPLY) {
    console.log("\nPass --apply to rename files and update CMS references.");
    db.close();
    return;
  }

  const applied = applyPlan(db, plan);
  console.log(`\nDone. Renamed ${applied} file(s); all CMS URLs updated.`);
  db.close();
}

main();
