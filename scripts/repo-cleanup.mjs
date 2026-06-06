#!/usr/bin/env node
/**
 * Remove obsolete scripts, stale root docs, and one-off data artifacts.
 * Keeps: package.json scripts, deploy.sh chain, locale-pack pipeline, CMS/SEO ops.
 *
 * Run: node scripts/repo-cleanup.mjs
 * Dry run: node scripts/repo-cleanup.mjs --dry-run
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");

function rm(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  if (dryRun) return rel;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) fs.rmSync(full, { recursive: true, force: true });
  else fs.unlinkSync(full);
  return rel;
}

/** One-off scripts / artifacts — superseded migrations, extracts, purges. */
const OBSOLETE_SCRIPTS = [
  "scripts/__pycache__",
  "scripts/build_locale_page_packs.py",
  "scripts/locale_pack_cleaning_extra.py",
  "scripts/locale_pack_console_extra.py",
  "scripts/locale_pack_model_b_extra.py",
  "scripts/locale_pack_model_t_extra.py",
  "scripts/extracted-cleaning-service.json",
  "scripts/extracted-model-b.json",
  "scripts/extracted-model-t.json",
  "scripts/extracted-strings.json",
  "scripts/extracted-taypro-console.json",
  "scripts/migrate-db-blogs.mjs",
  "scripts/migrate-projects.mjs",
  "scripts/delete-custom-blog-pages.mjs",
  "scripts/extract-blog-content-to-html.mjs",
  "scripts/fix-blog-seo.js",
  "scripts/convert-client-product-pages.mjs",
  "scripts/export-cms-to-handwritten.mjs",
  "scripts/purge-taypro-console-everywhere.mjs",
  "scripts/purge-taypro-console-src.mjs",
  "scripts/purge-model-abc-everywhere.mjs",
  "scripts/purge-model-abc-src.mjs",
  "scripts/purge-legacy-model-names.mjs",
  "scripts/rebrand-solar-system-hub.mjs",
  "scripts/rebrand-product-messages.mjs",
  "scripts/rename-console-i18n-keys.mjs",
  "scripts/finish-model-orion-nyuma-x-translations.mjs",
  "scripts/extract-jsx-strings.mjs",
  "scripts/extract-product-page-strings.mjs",
  "scripts/apply-static-i18n.mjs",
  "scripts/static-i18n-patches.json",
  "scripts/apply-layout-hreflang.mjs",
  "scripts/patch-product-pages-i18n.mjs",
  "scripts/merge-locale-product-translations.mjs",
  "scripts/translate-product-messages-gemini.mjs",
  "scripts/translate-product-pages-by-match.mjs",
  "scripts/generate-product-page-i18n.mjs",
  "scripts/build-product-page-messages.mjs",
  "scripts/convert-nyuma-messages.mjs",
  "scripts/strip-title-brand-suffix.mjs",
  "scripts/fix-comparison-row-keys.mjs",
  "scripts/pad-handwritten-to-min.mjs",
  "scripts/apply-handwritten-supplements.mjs",
  "scripts/seo-priority-fixes.mjs",
  "scripts/lib/handwritten-tier1-bachau.mjs",
  "scripts/lib/tier1-longform.mjs",
  "scripts/backfill-project-category-tags.mjs",
];

/** Stale incident / status reports at repo root. */
const OBSOLETE_ROOT_DOCS = [
  "AWS_INCIDENT_SUMMARY.md",
  "AWS_RESPONSE_EMAIL.txt",
  "AWS_SECURITY_RESPONSE.md",
  "CACHING_AND_PERFORMANCE.md",
  "DEPLOYMENT_FIX_SUMMARY.md",
  "DNS_AND_ACCESS_STATUS.md",
  "DNS_CACHE_FIX.md",
  "NPM_PHISHING_CAMPAIGN_ASSESSMENT.md",
  "NPM_SECURITY_AUDIT.md",
  "PERFORMANCE_OPTIMIZATIONS.md",
  "PERFORMANCE_OPTIMIZATIONS_IMPLEMENTED.md",
  "PRODUCTION_SETUP_COMPLETE.md",
  "SECURITY_ASSESSMENT.md",
  "SECURITY_BREACH_2_REPORT.md",
  "SECURITY_BREACH_REPORT.md",
  "SECURITY_HARDENING_COMPLETE.md",
  "SECURITY_TOOLS_INSTALLATION.md",
  "SEO_AUDIT_REPORT.md",
  "SPEED_IMPROVEMENTS_ANALYSIS.md",
  "STATIC_FILES_FIX.md",
  "UA_PARSER_JS_RISK_ASSESSMENT.md",
  "WEBSITE_ACCESS_STATUS.md",
  "Favicon__3.png",
  "Keyword Stats 2026-05-18 at 11_43_57.csv",
];

/** Move to docs/ (operational reference). */
const MOVE_TO_DOCS = [
  ["AI_BLOG_AUTOMATION_SETUP.md", "docs/AI_BLOG_AUTOMATION_SETUP.md"],
  ["GOOGLE_SEARCH_CONSOLE_SETUP.md", "docs/GOOGLE_SEARCH_CONSOLE_SETUP.md"],
  ["GDPR_COMPLIANCE.md", "docs/GDPR_COMPLIANCE.md"],
  ["NEW_SERVER_DEPLOYMENT.md", "docs/NEW_SERVER_DEPLOYMENT.md"],
  ["DNS_SETUP_GUIDE.md", "docs/DNS_SETUP_GUIDE.md"],
  ["DEPLOYMENT_CONTENT_PRESERVATION.md", "docs/DEPLOYMENT_CONTENT_PRESERVATION.md"],
  ["SEO_CONTENT_AUDIT_TASKS.md", "docs/SEO_CONTENT_AUDIT_TASKS.md"],
];

/** One-off data artifacts (not runtime SEO/CMS state). */
const OBSOLETE_DATA = [
  "data/backfill-project-tags-report-dry-run.json",
  "data/backfill-project-tags-report-production.json",
  "data/backups/cms.sqlite.before-project-tags-20260606-162304",
  "data/backups/projects-export-en.json",
  "data/import-projects-report.json",
  "data/cms.db",
];

/** Legacy WordPress upload stubs at repo root (not public/uploads). */
const OBSOLETE_UPLOADS = [
  "uploads/smush",
  "uploads/wpforms",
  "uploads/wpseo-redirects",
];

console.log(dryRun ? "DRY RUN\n" : "Cleaning repository…\n");

const removed = [];
for (const rel of [
  ...OBSOLETE_SCRIPTS,
  ...OBSOLETE_ROOT_DOCS,
  ...OBSOLETE_DATA,
  ...OBSOLETE_UPLOADS,
]) {
  const r = rm(rel);
  if (r) removed.push(r);
}

const moved = [];
for (const [from, to] of MOVE_TO_DOCS) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, to);
  if (!fs.existsSync(src)) continue;
  if (dryRun) {
    moved.push(`${from} → ${to}`);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) fs.unlinkSync(dest);
  fs.renameSync(src, dest);
  moved.push(`${from} → ${to}`);
}

console.log(`Removed ${removed.length} paths:`);
for (const r of removed) console.log(`  - ${r}`);
console.log(`\nMoved ${moved.length} docs:`);
for (const m of moved) console.log(`  - ${m}`);
console.log(`\nrepo-cleanup: ${dryRun ? "dry run complete" : "done"}`);
