#!/usr/bin/env node
/**
 * Retranslate messages/pages strings still identical (or mostly English) vs English source.
 *
 *   node scripts/retranslate-identical-locale-keys.mjs --file careers.json
 *   node scripts/retranslate-identical-locale-keys.mjs --file careers.json --locale hi
 *   node scripts/retranslate-identical-locale-keys.mjs --files careers.json,solar-cleaning-capex-vs-opex.json
 *   node scripts/retranslate-identical-locale-keys.mjs --priority   # careers + SEO landing cluster
 *   node scripts/retranslate-identical-locale-keys.mjs --dry-run
 */
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import {
  TARGET_LOCALES,
  flattenKeys,
  getAtPath,
  setAtPath,
  shouldBackfillString,
  translateOne,
} from "./lib/locale-translate.mjs";

const root = join(process.cwd(), "messages/pages");

const PRIORITY_FILES = [
  "careers.json",
  "solar-cleaning-capex-vs-opex.json",
  "solar-cleaning-opex-pricing.json",
  "solar-panel-cleaning-service-india.json",
  "solar-om-services.json",
  "enterprise-solar-cleaning-partnership.json",
  "solar-fleet-monitoring-software.json",
  "solar-cleaning-robot-manufacturer-india.json",
  "large-scale-solar-panel-cleaning.json",
  "solar-panel-soiling-loss-calculator.json",
  "solar-panel-cleaning-robot-for-rooftop.json",
  "solar-panel-cleaning-robot-for-trackers.json",
  "solar-plant-data-intelligence.json",
  "cleaning-machine.json",
  "ai-intelligence.json",
  "press.json",
];

const LOCALE_SCRIPTS = {
  hi: /[\u0900-\u097F]/,
  ar: /[\u0600-\u06FF]/,
  ja: /[\u3040-\u30ff\u4e00-\u9faf]/,
  bn: /[\u0980-\u09FF]/,
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeEnglishLike = args.includes("--include-english-like");
const priority = args.includes("--priority");
const localeArgIdx = args.indexOf("--locale");
const fileArgIdx = args.indexOf("--file");
const filesArgIdx = args.indexOf("--files");

const locales =
  localeArgIdx >= 0
    ? [args[localeArgIdx + 1]].filter(Boolean)
    : TARGET_LOCALES;

function leafKey(dotPath) {
  return dotPath.split(/[.[\]]/).filter(Boolean).pop() ?? "";
}

function isEnglishLike(value, locale) {
  if (typeof value !== "string" || value.length < 8) return false;
  if (LOCALE_SCRIPTS[locale]?.test(value)) return false;
  const latin = (value.match(/[a-zA-Z]/g) || []).length;
  const total = value.replace(/\s/g, "").length;
  return total > 0 && latin / total > 0.55;
}

function resolveFiles() {
  if (priority) return PRIORITY_FILES;
  if (fileArgIdx >= 0) {
    const f = args[fileArgIdx + 1];
    return f ? [f.replace(/^\/*/, "")] : [];
  }
  if (filesArgIdx >= 0) {
    return args[filesArgIdx + 1]
      .split(",")
      .map((f) => f.trim().replace(/^\/*/, ""))
      .filter(Boolean);
  }
  console.error("Specify --file, --files, or --priority");
  process.exit(1);
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function saveJson(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function retranslateFile(file, locale) {
  const enPath = join(root, "en", file);
  const locPath = join(root, locale, file);
  const enData = await loadJson(enPath);
  const locData = await loadJson(locPath);
  const keys = flattenKeys(enData);

  let translated = 0;
  let skipped = 0;

  for (const dotPath of keys) {
    const enVal = getAtPath(enData, dotPath);
    if (typeof enVal !== "string" || enVal.length < 2) continue;

    const locVal = getAtPath(locData, dotPath);
    if (typeof locVal !== "string") continue;

    const key = leafKey(dotPath);
    const identical = locVal === enVal;
    const englishLike = includeEnglishLike && !identical && isEnglishLike(locVal, locale);

    if (!identical && !englishLike) continue;
    if (!shouldBackfillString(dotPath, key, enVal)) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      const next = await translateOne(enVal, locale);
      setAtPath(locData, dotPath, next);
    }
    translated += 1;
  }

  if (!dryRun && translated > 0) {
    await saveJson(locPath, locData);
  }

  return { translated, skipped };
}

async function main() {
  const files = resolveFiles();
  let totalTranslated = 0;

  for (const file of files) {
    for (const locale of locales) {
      process.stdout.write(
        `${locale}/${file}: retranslating${dryRun ? " (dry-run)" : ""}…`,
      );
      const { translated, skipped } = await retranslateFile(file, locale);
      totalTranslated += translated;
      console.log(` ${translated} updated, ${skipped} skipped`);
    }
  }

  console.log(
    `${dryRun ? "Would update" : "Updated"} ${totalTranslated} string(s) across ${files.length} file(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
