/**
 * One-shot local (or server) prep before CMS deploy.
 *
 *   npm run cms:prepare-deploy
 *   npm run cms:prepare-deploy -- --dry-run
 *   npm run cms:prepare-deploy -- --skip-publish   # keep drafts for admin QA
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const skipPublish = process.argv.includes("--skip-publish");
const env = { ...process.env, CMS_SQLITE: process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite") };

function run(label, cmd) {
  console.log(`\n>>> ${label}`);
  if (dryRun) {
    console.log(`  [dry-run] ${cmd}`);
    return;
  }
  execSync(cmd, { cwd: root, stdio: "inherit", env });
}

console.log("=== Taypro CMS pre-deploy prepare ===");
if (dryRun) console.log("(dry-run: commands listed only)\n");

run("1. Seed authors from author-profiles.json", "npm run cms:seed-authors");
run("2. Apply handwritten HTML to all CMS projects", "npm run cms:apply-handwritten-case-studies");
run(
  "3. Legacy four: refresh title/chips from Excel (preserve author)",
  "npm run cms:import-projects-xlsx -- --force-update --preserve-author --slug agar-solar-project && " +
    "npm run cms:import-projects-xlsx -- --force-update --preserve-author --slug banda-solar-project && " +
    "npm run cms:import-projects-xlsx -- --force-update --preserve-author --slug soyegaon-solar-project && " +
    "npm run cms:import-projects-xlsx -- --force-update --preserve-author --slug yadgir-solar-project-50-mw"
);
run("4. Re-apply handwritten body on legacy four", "npm run cms:apply-handwritten-case-studies -- --slug agar-solar-project && npm run cms:apply-handwritten-case-studies -- --slug banda-solar-project && npm run cms:apply-handwritten-case-studies -- --slug soyegaon-solar-project && npm run cms:apply-handwritten-case-studies -- --slug yadgir-solar-project-50-mw");
run("5. Deterministic author assignment (all en projects)", "npm run cms:assign-project-authors");
run("6. Fix slugs: unpublish aliases, rename malformed", "node scripts/fix-project-slugs-for-deploy.mjs");
run("7. Diversify hero images", "node scripts/refresh-project-hero-images.mjs");
run(
  "8. Dedupe duplicate top-up blocks, then re-apply HTML to CMS",
  "npm run cms:dedupe-project-topup && npm run cms:apply-handwritten-case-studies"
);
run("9. Product accuracy pass on handwritten files", "node scripts/fix-handwritten-product-accuracy.mjs");

if (!skipPublish) {
  run("10. Publish indexable projects", "node scripts/publish-projects-for-deploy.mjs");
} else {
  run(
    "10. Keep all projects draft (unpublish every en row)",
    "node scripts/unpublish-projects-for-deploy.mjs"
  );
}

if (!dryRun) {
  run("11. Verify word count", "npm run cms:verify-handwritten-words");
  run("12. Verify no client names", "npm run cms:verify-projects-no-clients");
}

console.log("\n=== Done ===");
console.log("Deploy: backup prod DB → copy data/cms.sqlite + content/handwritten-case-studies → PM2 restart");
console.log("Then: npm run cms:translate:projects (after English is live)");
