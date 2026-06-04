/**
 * Verify no client / IPP names in English CMS projects.
 * Usage: npm run cms:verify-projects-no-clients
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import {
  buildClientBlocklist,
  scanForBlockedTokens,
} from "./lib/sanitize-client-names.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");
const xlsxPath =
  process.env.PROJECTS_XLSX ||
  path.join(process.env.HOME || "", "Downloads", "Projects_Case_Studies_filled.xlsx");

function loadClientNames() {
  if (!fs.existsSync(xlsxPath)) {
    console.warn(`Workbook missing (${xlsxPath}); using curated tokens only.`);
    return [];
  }
  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets["Deployed Projects"] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows.map((r) => String(r["Client Name"] || "").trim()).filter(Boolean);
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(`Missing ${dbPath}`);
    process.exit(1);
  }
  const blocklist = buildClientBlocklist(loadClientNames());
  const db = new Database(dbPath, { readonly: true });
  const rows = db
    .prepare(
      `SELECT slug, title, description, content, image_alt, details
       FROM projects WHERE locale = 'en'`
    )
    .all();

  const leaks = [];
  for (const row of rows) {
    const blob = [
      row.title,
      row.description,
      row.content,
      row.image_alt,
      row.details,
    ].join(" ");
    const scan = scanForBlockedTokens(blob, blocklist);
    if (!scan.ok) leaks.push({ slug: row.slug, matches: scan.matches });
  }
  db.close();

  if (leaks.length) {
    console.error(`Client name leak(s) in ${leaks.length} project(s):`);
    for (const l of leaks.slice(0, 20)) {
      console.error(`  ${l.slug}: ${l.matches.join(", ")}`);
    }
    process.exit(1);
  }
  console.log(`OK: ${rows.length} English projects — no client names detected.`);
}

main();
