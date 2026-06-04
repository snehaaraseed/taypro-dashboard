/**
 * Production import: workbook → CMS + handwritten HTML, all projects stay draft.
 *
 *   PROJECTS_XLSX=/var/www/taypro-dashboard/data/imports/Projects_Case_Studies_filled.xlsx \
 *   CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite \
 *   npm run cms:import-production-draft
 *
 *   npm run cms:import-production-draft -- --dry-run
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const skipImport = process.argv.includes("--skip-import");
const env = {
  ...process.env,
  CMS_SQLITE: process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite"),
};

function run(label, cmd) {
  console.log(`\n>>> ${label}`);
  if (dryRun) {
    console.log(`  [dry-run] ${cmd}`);
    return;
  }
  execSync(cmd, { cwd: root, stdio: "inherit", env });
}

console.log("=== Production draft import (no publish) ===\n");

if (!skipImport) {
  run(
    "A. Import workbook rows (new inserts + updates → draft)",
    "npm run cms:import-projects-xlsx"
  );
}

run(
  "B. Handwritten + metadata + authors + slugs (all draft via --skip-publish)",
  "node scripts/prepare-projects-for-deploy.mjs --skip-publish"
);

console.log("\n=== Done — review in /admin/projects, then publish when ready ===");
console.log("  npm run cms:publish-projects   # or cms:prepare-deploy without --skip-publish");
