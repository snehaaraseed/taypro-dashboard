/**
 * Fail deploy if CMS metrics dropped vs pre-deploy snapshot.
 * Usage: node scripts/deploy-cms-assert-unchanged.mjs <before.json> [after.json]
 */
import fs from "fs";

const beforePath = process.argv[2];
const afterPath = process.argv[3] || process.env.CMS_METRICS_AFTER;

if (!beforePath || !afterPath) {
  console.error(
    "Usage: node scripts/deploy-cms-assert-unchanged.mjs <before.json> <after.json>"
  );
  process.exit(1);
}

const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
const after = JSON.parse(fs.readFileSync(afterPath, "utf8"));

const keys = [
  ["blogsTotal", "Blog rows (all locales)"],
  ["blogsEnPublished", "Published English blogs"],
  ["projectsEn", "English projects"],
  ["projectsEnPublished", "Published English projects"],
  ["authors", "Authors"],
  ["uploadsIndexRows", "Upload gallery index rows"],
  ["uploadGalleryFiles", "Upload gallery files on disk"],
];

const failures = [];
for (const [key, label] of keys) {
  const b = before[key];
  const a = after[key];
  if (typeof b !== "number" || typeof a !== "number") continue;
  if (a < b) {
    failures.push(`${label}: ${b} → ${a} (lost ${b - a})`);
  }
}

if (failures.length) {
  console.error("❌ CMS content check failed — counts decreased:");
  for (const f of failures) console.error(`   ${f}`);
  console.error(
    "\nDeploy aborted to protect production CMS. Restore from .deploy-snapshots/ if needed."
  );
  process.exit(1);
}

console.log("✅ CMS content intact (all counts ≥ pre-deploy snapshot):");
for (const [key, label] of keys) {
  if (typeof before[key] === "number") {
    console.log(`   ${label}: ${before[key]} → ${after[key]}`);
  }
}
