/**
 * Apply hand-written case study HTML from content/handwritten-case-studies/
 *
 *   npm run cms:apply-handwritten-case-studies
 *   npm run cms:apply-handwritten-case-studies -- --slug agar-solar-project
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import {
  buildClientBlocklist,
  scanForBlockedTokens,
  sanitizeText,
} from "./lib/sanitize-client-names.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "content", "handwritten-case-studies");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const xlsxPath =
  process.env.PROJECTS_XLSX ||
  path.join(process.env.HOME || "", "Downloads", "Projects_Case_Studies_filled.xlsx");

const args = process.argv.slice(2);
const slugFilterIdx = args.indexOf("--slug");
const slugFilter = slugFilterIdx >= 0 ? args[slugFilterIdx + 1] : undefined;

function loadClientBlocklist() {
  if (!fs.existsSync(xlsxPath)) return buildClientBlocklist([]);
  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets["Deployed Projects"] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const names = rows.map((r) => String(r["Client Name"] || "").trim()).filter(Boolean);
  return buildClientBlocklist(names);
}

function main() {
  if (!fs.existsSync(contentDir)) {
    console.error(`Missing ${contentDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(dbPath)) {
    console.error(`Missing ${dbPath}`);
    process.exit(1);
  }

  const blocklist = loadClientBlocklist();
  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => ({ slug: f.replace(/\.html$/, ""), path: path.join(contentDir, f) }));

  const targets = slugFilter ? files.filter((f) => f.slug === slugFilter) : files;
  if (!targets.length) {
    console.error(slugFilter ? `No file for slug: ${slugFilter}` : "No .html files found");
    process.exit(1);
  }

  const db = new Database(dbPath);
  const update = db.prepare(
    `UPDATE projects SET content = @content, updated_at = @updatedAt
     WHERE slug = @slug AND locale = 'en'`
  );
  const exists = db.prepare(
    `SELECT slug FROM projects WHERE slug = @slug AND locale = 'en'`
  );

  let applied = 0;
  let skipped = 0;
  const errors = [];

  for (const { slug, path: filePath } of targets) {
    try {
      if (!exists.get({ slug })) {
        skipped++;
        console.warn(`  skip (no CMS row): ${slug}`);
        continue;
      }
      let html = fs.readFileSync(filePath, "utf8").trim();
      html = sanitizeText(html, blocklist);
      const scan = scanForBlockedTokens(html, blocklist);
      if (!scan.ok) {
        throw new Error(`client token: ${scan.matches.join(", ")}`);
      }
      update.run({
        slug,
        content: html,
        updatedAt: new Date().toISOString(),
      });
      applied++;
      console.log(`  applied: ${slug}`);
    } catch (err) {
      errors.push({ slug, message: err.message });
    }
  }

  db.close();
  console.log(`\nApplied: ${applied}, skipped: ${skipped}, errors: ${errors.length}`);
  if (errors.length) {
    for (const e of errors) console.error(`  ${e.slug}: ${e.message}`);
    process.exit(1);
  }
}

main();
