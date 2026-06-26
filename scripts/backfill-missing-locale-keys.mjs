#!/usr/bin/env node
/**
 * Backfill missing messages/pages/{hi,ar,ja,bn} keys vs English using Google Translate.
 * Makes `npm run validate:i18n` pass.
 *
 *   node scripts/backfill-missing-locale-keys.mjs
 *   node scripts/backfill-missing-locale-keys.mjs --dry-run
 *   node scripts/backfill-missing-locale-keys.mjs --locale hi --file comparisons.json
 *   node scripts/backfill-missing-locale-keys.mjs --copy-en   # structural only, no translate
 */
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import {
  TARGET_LOCALES,
  flattenKeys,
  getAtPath,
  setAtPath,
  shouldBackfillString,
  translateOne,
  findStructureConflict,
  translateTree,
  countStringLeaves,
} from "./lib/locale-translate.mjs";

const root = join(process.cwd(), "messages/pages");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const copyEn = args.includes("--copy-en");
const localeArgIdx = args.indexOf("--locale");
const fileArgIdx = args.indexOf("--file");
const locales =
  localeArgIdx >= 0
    ? [args[localeArgIdx + 1]].filter(Boolean)
    : TARGET_LOCALES;
const fileFilter =
  fileArgIdx >= 0 ? args[fileArgIdx + 1].replace(/^\/*/, "") : null;

function leafKey(dotPath) {
  return dotPath.split(/[.[\]]/).filter(Boolean).pop() ?? "";
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function saveJson(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const enFiles = (await readdir(join(root, "en")))
    .filter((f) => f.endsWith(".json"))
    .filter((f) => !fileFilter || f === fileFilter)
    .sort();

  let filled = 0;
  let copied = 0;
  let skipped = 0;

  for (const file of enFiles) {
    const enData = await loadJson(join(root, "en", file));
    const enKeySet = new Set(flattenKeys(enData));

    for (const locale of locales) {
      const locPath = join(root, locale, file);
      let locData;
      try {
        locData = await loadJson(locPath);
      } catch (err) {
        if (err?.code === "ENOENT") {
          console.warn(`skip missing file ${locale}/${file} (create from EN manually)`);
          continue;
        }
        throw err;
      }

      const locKeySet = new Set(flattenKeys(locData));
      const missing = [...enKeySet].filter((k) => !locKeySet.has(k));
      if (missing.length === 0) continue;

      process.stdout.write(
        `${locale}/${file}: ${missing.length} missing${dryRun ? " (dry-run)" : ""}...`
      );

      const resolvedPrefixes = new Set();

      for (const dotPath of missing) {
        const conflictPrefix = findStructureConflict(locData, enData, dotPath);
        if (conflictPrefix) {
          if (resolvedPrefixes.has(conflictPrefix)) continue;
          resolvedPrefixes.add(conflictPrefix);
          const enSubtree = getAtPath(enData, conflictPrefix);
          if (enSubtree === undefined) {
            skipped += 1;
            continue;
          }
          if (!dryRun) {
            const translated = await translateTree(
              enSubtree,
              locale,
              conflictPrefix,
              copyEn
            );
            setAtPath(locData, conflictPrefix, translated);
          }
          filled += countStringLeaves(enSubtree);
          continue;
        }

        const enVal = getAtPath(enData, dotPath);
        if (typeof enVal !== "string") {
          skipped += 1;
          continue;
        }

        const key = leafKey(dotPath);
        let locVal = enVal;
        if (shouldBackfillString(dotPath, key, enVal) && !copyEn) {
          locVal = await translateOne(enVal, locale);
          filled += 1;
        } else {
          copied += 1;
        }

        if (!dryRun) {
          setAtPath(locData, dotPath, locVal);
        }
      }

      if (!dryRun) {
        await saveJson(locPath, locData);
      }
      console.log(" done");
    }
  }

  console.log(
    `${dryRun ? "Would fill" : "Filled"} ${filled} translated, ${copied} copied/skipped structural.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
