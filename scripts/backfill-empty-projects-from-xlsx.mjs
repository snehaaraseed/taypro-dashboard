/**
 * Re-hydrate empty / skeleton English projects from Projects_Case_Studies_filled.xlsx.
 * Writes full HTML, facts_json, seo_keyword; clears stale sections_json from failed improves.
 *
 * Usage:
 *   npm run cms:backfill-empty-projects
 *   npm run cms:backfill-empty-projects -- --dry-run
 *   npm run cms:backfill-empty-projects -- --slug seci-1-50-mw
 *   CMS_SQLITE=/path/cms.sqlite npm run cms:backfill-empty-projects
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
import { buildFactsJsonFromXlsxRow } from "./lib/project-facts-from-xlsx.mjs";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugFilterIdx = args.indexOf("--slug");
const slugFilter = slugFilterIdx >= 0 ? args[slugFilterIdx + 1] : undefined;
const wordThresholdIdx = args.indexOf("--max-words");
const maxWords = wordThresholdIdx >= 0 ? Number(args[wordThresholdIdx + 1]) : 100;

const repoXlsx = path.join(root, "data", "Projects_Case_Studies_filled.xlsx");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function countWordsHtml(html) {
  return countWords(html || "");
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

function buildDetails(row, categoryTags) {
  const chips = [
    `${row.capacityMw} MW`,
    row.state || null,
    row.arrayType,
    row.automaticRobots ? `${row.automaticRobots} auto robots` : null,
    row.semiAutomaticRobots
      ? `${row.semiAutomaticRobots} semi-auto robots`
      : null,
    ...categoryTags,
    "Utility-scale",
  ].filter(Boolean);
  return canonicalizeCategoryDetailTags(chips).slice(0, 10);
}

function buildExcelIndex(rawRows, normalizedAll, blocklist) {
  const index = new Map();
  for (let i = 0; i < rawRows.length; i++) {
    const normalized = normalizedAll[i];
    const title = buildTitle(normalized, blocklist);
    const legacySlug = findLegacySlug(
      normalized.location,
      normalized.capacityMw
    );
    const slug = legacySlug || createSlug(title);
    index.set(slug, { normalized, rowIndex: i });
  }
  return index;
}

function listThinEnglishProjects(db, threshold) {
  return db
    .prepare(
      `SELECT slug, title, content, published, author, image, image_alt, seo_keyword
       FROM projects WHERE locale = 'en'`
    )
    .all()
    .map((row) => ({
      ...row,
      words: countWordsHtml(row.content),
    }))
    .filter((row) => row.words <= threshold)
    .sort((a, b) => a.words - b.words);
}

function deleteStaleLocaleCopies(db, slug, dryRunMode) {
  const locales = db
    .prepare(
      `SELECT locale, content FROM projects WHERE slug = ? AND locale != 'en'`
    )
    .all(slug);
  let deleted = 0;
  for (const row of locales) {
    if (countWordsHtml(row.content) > maxWords) continue;
    if (!dryRunMode) {
      db.prepare(`DELETE FROM projects WHERE slug = ? AND locale = ?`).run(
        slug,
        row.locale
      );
    }
    deleted += 1;
  }
  return deleted;
}

function main() {
  console.log(`Workbook: ${repoXlsx}`);
  console.log(`Database: ${dbPath}`);
  console.log(`Threshold: <= ${maxWords} words (English)`);
  if (dryRun) console.log("Mode: DRY RUN");

  if (!fs.existsSync(dbPath)) {
    console.error(`Missing ${dbPath}`);
    process.exit(1);
  }

  const rawRows = readWorkbook(repoXlsx);
  const normalizedAll = rawRows.map((r) => normalizeXlsxRow(r));
  setWorkbookBoilerplate(buildBoilerplateSetFromRows(normalizedAll));
  const blocklist = buildClientBlocklist(
    rawRows.map((r) => String(r["Client Name"] || "").trim()).filter(Boolean)
  );
  const excelBySlug = buildExcelIndex(rawRows, normalizedAll, blocklist);

  const db = new Database(dbPath);
  const candidates = slugFilter
    ? db
        .prepare(
          `SELECT slug, title, content, published, author, image, image_alt, seo_keyword
           FROM projects WHERE locale = 'en' AND slug = ?`
        )
        .all(slugFilter)
        .map((row) => ({ ...row, words: countWordsHtml(row.content) }))
    : listThinEnglishProjects(db, maxWords);

  const report = {
    dryRun,
    threshold: maxWords,
    candidates: candidates.length,
    updated: [],
    skipped: [],
    localeRowsRemoved: 0,
  };

  const updateStmt = db.prepare(
    `UPDATE projects SET
      title = @title,
      description = @description,
      details = @details,
      content = @content,
      facts_json = @factsJson,
      sections_json = NULL,
      seo_keyword = @seoKeyword,
      editorial_status = 'legacy',
      updated_at = @updatedAt
    WHERE slug = @slug AND locale = 'en'`
  );

  for (const project of candidates) {
    const excel = excelBySlug.get(project.slug);
    if (!excel) {
      report.skipped.push({
        slug: project.slug,
        words: project.words,
        reason: "no_excel_row",
      });
      continue;
    }

    const { normalized } = excel;
    const title = buildTitle(normalized, blocklist);
    const description = buildMetaDescription(normalized, blocklist);
    const content = buildProjectHtml(normalized, blocklist);
    const wordCount = countWordsHtml(content);
    if (wordCount < MIN_WORD_COUNT) {
      report.skipped.push({
        slug: project.slug,
        words: project.words,
        reason: `excel_html_too_short:${wordCount}`,
      });
      continue;
    }

    const categoryTags = parseCategoryTagsFromCell(normalized.categoriesCell);
    const details = buildDetails(normalized, categoryTags);
    const primaryKeyword = sanitizeText(
      normalized.primaryKeyword || "solar panel cleaning robot India",
      blocklist
    );
    const factsJson = JSON.stringify(buildFactsJsonFromXlsxRow(normalized));
    const scan = scanForBlockedTokens(
      [title, description, content, rebuildSecondaryKeywords({
        state: normalized.state,
        capacityMw: normalized.capacityMw,
        primaryKeyword,
      })].join(" "),
      blocklist
    );
    if (!scan.ok) {
      report.skipped.push({
        slug: project.slug,
        words: project.words,
        reason: `blocked_tokens:${scan.matches.join(",")}`,
      });
      continue;
    }

    const record = sanitizeProjectRecord(
      {
        slug: project.slug,
        title,
        description,
        details: JSON.stringify(details),
        content,
        author: project.author,
        image: project.image,
        imageAlt: project.image_alt,
      },
      blocklist
    );

    if (!dryRun) {
      updateStmt.run({
        slug: project.slug,
        title: record.title,
        description: record.description,
        details: record.details,
        content: record.content,
        factsJson,
        seoKeyword: primaryKeyword,
        updatedAt: new Date().toISOString(),
      });
      report.localeRowsRemoved += deleteStaleLocaleCopies(
        db,
        project.slug,
        false
      );
    } else {
      report.localeRowsRemoved += deleteStaleLocaleCopies(
        db,
        project.slug,
        true
      );
    }

    report.updated.push({
      slug: project.slug,
      beforeWords: project.words,
      afterWords: wordCount,
      published: project.published,
      factsKeys: Object.keys(JSON.parse(factsJson)).length,
      seoKeyword: primaryKeyword,
    });
  }

  db.close();

  const reportPath = path.join(root, "data", "backfill-empty-projects-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\nBackfill summary:");
  console.log(`  Candidates: ${report.candidates}`);
  console.log(`  Updated:    ${report.updated.length}`);
  console.log(`  Skipped:    ${report.skipped.length}`);
  console.log(`  Stale locale rows removed: ${report.localeRowsRemoved}`);
  console.log(`  Report:     ${reportPath}`);

  for (const u of report.updated) {
    console.log(
      `  ✓ ${u.slug}: ${u.beforeWords}w → ${u.afterWords}w | facts:${u.factsKeys} | pub:${u.published}`
    );
  }
  for (const s of report.skipped) {
    console.log(`  ✗ ${s.slug} (${s.words}w): ${s.reason}`);
  }

  if (report.skipped.some((s) => s.reason === "no_excel_row")) {
    console.log(
      "\nNote: Projects without an Excel row (e.g. hand-written SEO pages) need manual content or admin improve."
    );
  }
}

main();
