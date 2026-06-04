/**
 * Bulk-import project case studies from Projects_Case_Studies_filled.xlsx
 *
 * All English copy is written locally in scripts/lib/project-html-builder.mjs
 * from spreadsheet fields. No Gemini, no external AI, no API calls for content.
 *
 * Usage:
 *   PROJECTS_XLSX=/path/to/Projects_Case_Studies_filled.xlsx npm run cms:import-projects-xlsx
 *   npm run cms:import-projects-xlsx -- --dry-run --limit 5
 *   npm run cms:import-projects-xlsx -- --force-update
 *   CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite npm run cms:import-projects-xlsx
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import {
  buildClientBlocklist,
  rebuildSecondaryKeywords,
  sanitizeProjectRecord,
  sanitizeText,
  scanForBlockedTokens,
} from "./lib/sanitize-client-names.mjs";
import {
  canonicalizeCategoryDetailTags,
  parseCategoryTagsFromCell,
} from "./lib/project-categories.mjs";
import { pickProjectHeroImage } from "./lib/project-image-picker.mjs";
import {
  buildMetaDescription,
  buildProjectHtml,
  buildTitle,
  countWords,
  MIN_WORD_COUNT,
} from "./lib/project-html-builder.mjs";
import {
  findLegacySlug,
  normalizeXlsxRow,
} from "./lib/project-xlsx-map.mjs";
import {
  buildBoilerplateSetFromRows,
  setWorkbookBoilerplate,
} from "./lib/project-site-profile.mjs";
import {
  loadProjectAuthorPool,
  pickAuthorForSlug,
} from "./lib/project-author-pool.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const strict = args.includes("--strict");
const forceUpdate = args.includes("--force-update");
const preserveAuthor = args.includes("--preserve-author");
const limitIdx = args.indexOf("--limit");
const limit =
  limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : undefined;
const slugFilterIdx = args.indexOf("--slug");
const slugFilter = slugFilterIdx >= 0 ? args[slugFilterIdx + 1] : undefined;

const xlsxPath =
  process.env.PROJECTS_XLSX ||
  path.join(
    process.env.HOME || "",
    "Downloads",
    "Projects_Case_Studies_filled.xlsx"
  );
const dbPath =
  process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const publicRoot = path.join(root, "public");
const reportPath = path.join(root, "data", "import-projects-report.json");

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function allocateSlug(base, used) {
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.add(slug);
  return slug;
}

function hasColumn(db, table, column) {
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((c) => c.name === column);
}

function ensureAuthorColumn(db) {
  if (hasColumn(db, "projects", "author")) return;
  db.exec(
    `ALTER TABLE projects ADD COLUMN author text NOT NULL DEFAULT 'Taypro Team'`
  );
  console.log("  projects.author: column added");
}

function buildDetails(row, categoryTags) {
  const chips = [
    `${row.capacityMw} MW`,
    row.state || null,
    row.arrayType,
    row.automaticRobots ? `${row.automaticRobots} auto robots` : null,
    row.semiAutomaticRobots ? `${row.semiAutomaticRobots} semi-auto robots` : null,
    ...categoryTags,
    "Utility-scale",
  ].filter(Boolean);
  return canonicalizeCategoryDetailTags(chips).slice(0, 10);
}

function readWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Workbook not found: ${filePath}`);
  }
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames.includes("Deployed Projects")
    ? "Deployed Projects"
    : wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
}

function loadExistingSlugs(db) {
  const rows = db
    .prepare("SELECT slug FROM projects WHERE locale = 'en'")
    .all();
  return new Set(rows.map((r) => r.slug));
}

function getProjectRow(db, slug) {
  return db
    .prepare(
      "SELECT id, slug, title, published FROM projects WHERE slug = ? AND locale = 'en'"
    )
    .get(slug);
}

function upsertProject(db, record) {
  const existing = getProjectRow(db, record.slug);
  const now = new Date().toISOString();
  const date = new Date().toISOString().split("T")[0];

  if (existing) {
    db.prepare(
      `UPDATE projects SET
        title = @title,
        description = @description,
        image = @image,
        image_alt = @imageAlt,
        details = @details,
        content = @content,
        author = @author,
        date = @date,
        updated_at = @updatedAt,
        published = @published
      WHERE slug = @slug AND locale = 'en'`
    ).run({
      ...record,
      date,
      updatedAt: now,
      published: 0,
    });
    return "updated";
  }

  db.prepare(
    `INSERT INTO projects (
      slug, locale, title, description, image, image_alt, details, content,
      author, date, created_at, updated_at, published
    ) VALUES (
      @slug, 'en', @title, @description, @image, @imageAlt, @details, @content,
      @author, @date, @createdAt, @updatedAt, 0
    )`
  ).run({
    ...record,
    date,
    createdAt: now,
    updatedAt: now,
  });
  return "inserted";
}

function main() {
  console.log(`Workbook: ${xlsxPath}`);
  console.log(`Database: ${dbPath}`);
  if (dryRun) console.log("Mode: DRY RUN (no DB writes)");

  const rawRows = readWorkbook(xlsxPath);
  const normalizedAll = rawRows.map((r) => normalizeXlsxRow(r));
  setWorkbookBoilerplate(buildBoilerplateSetFromRows(normalizedAll));
  const clientNames = rawRows
    .map((r) => String(r["Client Name"] || "").trim())
    .filter(Boolean);
  const blocklist = buildClientBlocklist(clientNames);

  let db = null;
  let existingSlugs = new Set();
  let authorPool = ["Taypro Team"];
  const usedSlugs = new Set();
  const usedImages = new Set();

  if (!dryRun) {
    if (!fs.existsSync(dbPath)) {
      console.error(`Missing ${dbPath}. Run npm run cms:migrate first.`);
      process.exit(1);
    }
    db = new Database(dbPath);
    ensureAuthorColumn(db);
    existingSlugs = loadExistingSlugs(db);
    authorPool = loadProjectAuthorPool(db);
    for (const s of existingSlugs) usedSlugs.add(s);
  }

  const report = {
    contentSource: "deterministic-script",
    dryRun,
    forceUpdate,
    xlsxPath,
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    samples: [],
  };

  const rows = rawRows.slice(0, Number.isFinite(limit) ? limit : undefined);

  for (let i = 0; i < rows.length; i++) {
    const normalized = normalizedAll[i];
    try {
      const title = buildTitle(normalized, blocklist);
      const description = buildMetaDescription(normalized, blocklist);
      const legacySlug = findLegacySlug(
        normalized.location,
        normalized.capacityMw
      );
      const baseSlug = legacySlug || createSlug(title);
      const handPath = path.join(
        root,
        "content",
        "handwritten-case-studies",
        `${baseSlug}.html`
      );
      const content = fs.existsSync(handPath)
        ? sanitizeText(fs.readFileSync(handPath, "utf8"), blocklist)
        : buildProjectHtml(normalized, blocklist);
      const categoryTags = parseCategoryTagsFromCell(normalized.categoriesCell);
      const details = buildDetails(normalized, categoryTags);
      const primaryKeyword = sanitizeText(
        normalized.primaryKeyword || "solar panel cleaning robot India",
        blocklist
      );
      const secondaryKeywords = rebuildSecondaryKeywords({
        state: normalized.state,
        capacityMw: normalized.capacityMw,
        primaryKeyword,
      });

      let slug = baseSlug;
      const slugInDb = existingSlugs.has(slug);
      if (!legacySlug && !slugInDb && usedSlugs.has(slug)) {
        slug = allocateSlug(slug, usedSlugs);
      }
      usedSlugs.add(slug);

      const existingAuthor = preserveAuthor
        ? db
            .prepare(
              "SELECT author FROM projects WHERE slug = ? AND locale = 'en'"
            )
            .get(slug)?.author
        : null;
      const author =
        preserveAuthor && existingAuthor?.trim()
          ? existingAuthor.trim()
          : pickAuthorForSlug(slug, authorPool);

      if (slugFilter && slug !== slugFilter) continue;

      const strictFields = [title, description, content, secondaryKeywords].join(
        " "
      );
      const scan = scanForBlockedTokens(strictFields, blocklist);
      if (!scan.ok) {
        if (strict) {
          throw new Error(
            `Client token still present after sanitize: ${scan.matches.join(", ")}`
          );
        }
        report.errors.push({
          row: i + 2,
          slug,
          issue: "blocked_tokens",
          matches: scan.matches,
        });
      }

      const image = pickProjectHeroImage({
        publicRoot,
        title,
        seoKeyword: primaryKeyword,
        usedUrls: usedImages,
        rowIndex: i,
        slug,
      });

      let record = sanitizeProjectRecord(
        {
          slug,
          title,
          description,
          image: image.url,
          imageAlt: image.alt,
          details: JSON.stringify(details),
          content,
          author,
        },
        blocklist
      );

      const postSanitizeScan = scanForBlockedTokens(
        [record.title, record.description, record.content, record.imageAlt, record.details].join(
          " "
        ),
        blocklist
      );
      if (!postSanitizeScan.ok) {
        if (strict) {
          throw new Error(
            `Client name still present after sanitize: ${postSanitizeScan.matches.join(", ")}`
          );
        }
        report.errors.push({
          row: i + 2,
          slug,
          issue: "blocked_tokens_after_sanitize",
          matches: postSanitizeScan.matches,
        });
      }

      if (!dryRun) {
        const exists = existingSlugs.has(slug);
        if (exists && !forceUpdate) {
          report.skipped++;
          report.processed++;
          continue;
        }
        const action = upsertProject(db, record);
        if (action === "inserted") report.inserted++;
        else report.updated++;
        existingSlugs.add(slug);
      } else {
        report.inserted++;
      }

      report.processed++;
      const wordCount = countWords(content);
      if (wordCount < MIN_WORD_COUNT) {
        throw new Error(
          `Content below ${MIN_WORD_COUNT} words (${wordCount}); expand HTML builder`
        );
      }

      if (report.samples.length < 3) {
        report.samples.push({
          slug,
          title,
          author,
          details,
          image: image.url,
          contentLength: content.length,
          wordCount,
          strictOk: scan.ok,
        });
      }
    } catch (err) {
      report.errors.push({
        row: i + 2,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (db) db.close();

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\nImport summary:");
  console.log(`  Processed: ${report.processed}`);
  console.log(`  Inserted:  ${report.inserted}`);
  console.log(`  Updated:   ${report.updated}`);
  console.log(`  Skipped:   ${report.skipped} (existing slugs; use --force-update)`);
  console.log(`  Errors:    ${report.errors.length}`);
  console.log(`  Report:    ${reportPath}`);

  if (report.errors.length) {
    process.exit(1);
  }
}

main();
