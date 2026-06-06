/**
 * Backfill explicit category + product tags on project details chips.
 *
 * Usage:
 *   node scripts/backfill-project-category-tags.mjs --dry-run --db path/to/cms.sqlite
 *   node scripts/backfill-project-category-tags.mjs --apply --db path/to/cms.sqlite
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { canonicalizeCategoryDetailTags } from "./lib/project-categories.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || !args.includes("--apply");
const dbArgIdx = args.indexOf("--db");
const dbPath =
  dbArgIdx >= 0
    ? path.resolve(args[dbArgIdx + 1])
    : path.join(root, "data", "cms.sqlite");

const CANONICAL_ENGLISH_TAGS = new Set([
  "Automatic",
  "Semi-Automatic",
  "Capex",
  "Opex",
  "GLYDE",
  "GLYDE-X",
  "HELYX",
  "NYUMA",
  "NYUMA-X",
]);

const SEMI_AUTO_ROBOT_TAG =
  /(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/i;
const AUTO_ROBOT_TAG = /(\d+)\s*auto\s*robots?/i;

function parseDetails(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function robotCounts(details) {
  let auto = 0;
  let semi = 0;
  for (const tag of details) {
    const semiMatch = tag.trim().match(SEMI_AUTO_ROBOT_TAG);
    if (semiMatch) semi = Number(semiMatch[1]);
    const autoMatch = tag.trim().match(AUTO_ROBOT_TAG);
    if (autoMatch && !/semi[-\s]?auto/i.test(tag)) auto = Number(autoMatch[1]);
  }
  return { auto, semi };
}

function inferProcurementTags(title, description, content, details) {
  const blob = [title, description, content, ...details]
    .join(" ")
    .toLowerCase();

  const hasOpex =
    /\bopex\b/.test(blob) ||
    /taypro opex/.test(blob) ||
    /pay[- ]per[- ]panel/.test(blob) ||
    /operator[- ]led service/.test(blob) ||
    /cleaning service contract/.test(blob);

  const hasCapex =
    /\bcapex\b/.test(blob) ||
    /capex ownership/.test(blob) ||
    /capex purchase/.test(blob) ||
    /procurement model capex/.test(blob) ||
    /commercial model capex/.test(blob) ||
    /under capex/.test(blob) ||
    /developer[- ]owned/.test(blob) ||
    /owner purchase/.test(blob);

  if (hasOpex && !hasCapex) return ["Opex"];
  if (hasCapex || !hasOpex) return ["Capex"];
  return ["Capex"];
}

function inferDeploymentTags(auto, semi, content) {
  const blob = content.toLowerCase();
  const tags = [];

  if (auto > 0) tags.push("Automatic");
  if (semi > 0) tags.push("Semi-Automatic");

  if (auto === 0 && semi === 0) {
    const mentionsSemi =
      /semi[-\s]?automatic|nyuma semi|helyx|portable cleaning|inspection[- ]led/.test(
        blob
      );
    const mentionsAuto =
      /(?<![\w-])automatic(?![\w-])|glyde|autonomous robot|fully automatic|dual[- ]pass automatic/.test(
        blob
      );
    const mentionsMixed =
      /mixed automatic|automatic and semi|automatic \+ semi|both automatic and semi/.test(
        blob
      );

    if (mentionsMixed || (mentionsAuto && mentionsSemi)) {
      tags.push("Automatic", "Semi-Automatic");
    } else if (mentionsSemi) {
      tags.push("Semi-Automatic");
    } else if (mentionsAuto) {
      tags.push("Automatic");
    }
  }

  return [...new Set(tags)];
}

function inferProductTags(title, description, content, details) {
  const blob = [title, description, content, ...details].join(" ");
  const products = [];

  if (/glyde[-\s]?x|glydex|model[-\s]?t\b/i.test(blob)) {
    products.push("GLYDE-X");
  } else if (/\bglyde\b|model[-\s]?a\b/i.test(blob)) {
    products.push("GLYDE");
  }

  if (/nyuma[-\s]?x|nyumax/i.test(blob)) {
    products.push("NYUMA-X");
  } else if (/\bnyuma\b/i.test(blob)) {
    products.push("NYUMA");
  }

  if (/\bhelyx\b|model[-\s]?b\b/i.test(blob)) {
    products.push("HELYX");
  }

  return products;
}

function hasTag(details, tag) {
  const target = tag.toLowerCase();
  return details.some((d) => d.trim().toLowerCase() === target);
}

function mergeTags(existingDetails, tagsToAdd) {
  const existing = existingDetails.map((d) => d.trim()).filter(Boolean);
  const pending = tagsToAdd.filter((tag) => !hasTag(existing, tag));
  if (pending.length === 0) {
    return canonicalizeCategoryDetailTags(existing);
  }

  const utilIdx = existing.findIndex((d) =>
    /^utility[-\s]?scale$/i.test(d.trim())
  );
  const merged =
    utilIdx >= 0
      ? [
          ...existing.slice(0, utilIdx),
          ...pending,
          ...existing.slice(utilIdx),
        ]
      : [...existing, ...pending];

  return canonicalizeCategoryDetailTags(merged);
}

function extractCanonicalEnglishTags(details) {
  return details.filter((tag) => CANONICAL_ENGLISH_TAGS.has(tag.trim()));
}

function inferTagsForProject(project) {
  const details = parseDetails(project.details);
  const { auto, semi } = robotCounts(details);

  const deployment = inferDeploymentTags(auto, semi, project.content || "");
  const procurement = inferProcurementTags(
    project.title,
    project.description,
    project.content || "",
    details
  );
  const products = inferProductTags(
    project.title,
    project.description,
    project.content || "",
    details
  );

  const tagsToAdd = [...deployment, ...procurement, ...products];
  const nextDetails = mergeTags(details, tagsToAdd);

  return {
    slug: project.slug,
    before: details,
    after: nextDetails,
    added: nextDetails.filter((tag) => !hasTag(details, tag)),
    auto,
    semi,
    deployment,
    procurement,
    products,
  };
}

function main() {
  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  const integrity = db.prepare("PRAGMA integrity_check").get().integrity_check;
  if (integrity !== "ok") {
    console.error("integrity_check failed:", integrity);
    process.exit(1);
  }

  const enProjects = db
    .prepare(
      `SELECT slug, title, description, details, content
       FROM projects WHERE locale = 'en' ORDER BY slug`
    )
    .all();

  const plan = enProjects.map(inferTagsForProject);
  const changed = plan.filter((p) => p.added.length > 0);
  const unchanged = plan.filter((p) => p.added.length === 0);

  const report = {
    mode: dryRun ? "dry-run" : "apply",
    dbPath,
    totalEnProjects: plan.length,
    changed: changed.length,
    unchanged: unchanged.length,
    summary: {
      withAutomatic: plan.filter((p) => p.after.includes("Automatic")).length,
      withSemiAutomatic: plan.filter((p) => p.after.includes("Semi-Automatic"))
        .length,
      withCapex: plan.filter((p) => p.after.includes("Capex")).length,
      withOpex: plan.filter((p) => p.after.includes("Opex")).length,
    },
    changes: changed.map((p) => ({
      slug: p.slug,
      added: p.added,
      before: p.before,
      after: p.after,
      signals: {
        auto: p.auto,
        semi: p.semi,
        deployment: p.deployment,
        procurement: p.procurement,
        products: p.products,
      },
    })),
  };

  const reportPath = path.join(
    root,
    "data",
    `backfill-project-tags-report${dryRun ? "-dry-run" : ""}.json`
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Mode: ${report.mode}`);
  console.log(`Database: ${dbPath}`);
  console.log(`EN projects: ${report.totalEnProjects}`);
  console.log(`Will update: ${report.changed}`);
  console.log(`Unchanged: ${report.unchanged}`);
  console.log("Summary after backfill:", report.summary);
  console.log(`Report: ${reportPath}`);

  if (unchanged.length > 0) {
    console.log("\nUnchanged projects:");
    for (const p of unchanged) {
      console.log(`  - ${p.slug}`);
    }
  }

  if (dryRun) {
    console.log("\nSample changes (first 8):");
    for (const p of changed.slice(0, 8)) {
      console.log(`  ${p.slug}: +${p.added.join(", ")}`);
    }
    db.close();
    return;
  }

  const updateStmt = db.prepare(
    `UPDATE projects
     SET details = @details, updated_at = @updatedAt
     WHERE slug = @slug AND locale = @locale`
  );

  const now = new Date().toISOString();
  const enBySlug = new Map(plan.map((p) => [p.slug, p.after]));

  const apply = db.transaction(() => {
    for (const item of plan) {
      if (item.added.length === 0) continue;
      updateStmt.run({
        slug: item.slug,
        locale: "en",
        details: JSON.stringify(item.after),
        updatedAt: now,
      });
    }

    const localeRows = db
      .prepare(`SELECT slug, locale, details FROM projects WHERE locale != 'en'`)
      .all();

    for (const row of localeRows) {
      const enDetails = enBySlug.get(row.slug);
      if (!enDetails) continue;

      const localeDetails = parseDetails(row.details);
      const canonicalFromEn = extractCanonicalEnglishTags(enDetails);
      const nextLocaleDetails = mergeTags(localeDetails, canonicalFromEn);
      if (JSON.stringify(nextLocaleDetails) === JSON.stringify(localeDetails)) {
        continue;
      }
      updateStmt.run({
        slug: row.slug,
        locale: row.locale,
        details: JSON.stringify(nextLocaleDetails),
        updatedAt: now,
      });
    }
  });

  apply();

  const verify = db
    .prepare(
      `SELECT COUNT(*) AS n FROM projects
       WHERE locale = 'en' AND details NOT LIKE '%Automatic%'
       AND details NOT LIKE '%Semi-Automatic%'
       AND details NOT LIKE '%Capex%'
       AND details NOT LIKE '%Opex%'`
    )
    .get().n;

  console.log(`\nApplied updates. EN rows still missing all category tags: ${verify}`);
  db.close();
}

main();
