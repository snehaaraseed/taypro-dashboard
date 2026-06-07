#!/usr/bin/env node
/**
 * Copy newly added EN page keys into hi/ar/bn/ja JSON files (English fallback text).
 * Run after adding keys to messages/pages/en/*.json.
 */
import { readFile, writeFile, readdir } from "fs/promises";
import { join } from "path";

const ROOT = join(process.cwd(), "messages/pages");
const LOCALES = ["hi", "ar", "bn", "ja"];

const NEW_KEY_PATHS = [
  ["SolarSystemPage", "hubLinks"],
  ["SolarSystemPage", "brushComparison", "transcriptToggle"],
  ["SolarSystemPage", "brushComparison", "transcriptP1"],
  ["SolarSystemPage", "brushComparison", "transcriptP2"],
  ["SolarSystemPage", "brushComparison", "transcriptP3"],
  ["SolarSystemPage", "clients"],
  ["CleaningTechnologyPage", "dustSoiling"],
  ["GlydePage", "specifications", "datasheetCta"],
  ["GlydePage", "specifications", "datasheetCtaTopic"],
  ["NyumaPage", "specifications", "datasheetCta"],
  ["NyumaPage", "specifications", "datasheetCtaTopic"],
  ["HelyxPage", "specifications", "datasheetCta"],
  ["HelyxPage", "specifications", "datasheetCtaTopic"],
  ["Home", "discover", "machineLink"],
  ["Home", "discover", "rooftopLink"],
  ["Home", "clients", "trustedBy"],
  ["SiteMapPage", "links", "cleaningMachineLabel"],
  ["SiteMapPage", "links", "cleaningMachineTitle"],
  ["SiteMapPage", "links", "pressLabel"],
  ["SiteMapPage", "links", "pressTitle"],
  ["CompanyPage", "explore", "link5"],
];

function getAt(obj, path) {
  let cur = obj;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[key];
  }
  return cur;
}

function setAt(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
}

const enFiles = (await readdir(join(ROOT, "en"))).filter((f) =>
  f.endsWith(".json")
);

let patched = 0;

for (const file of enFiles) {
  const enRaw = JSON.parse(await readFile(join(ROOT, "en", file), "utf8"));
  const relevant = NEW_KEY_PATHS.filter((p) => getAt(enRaw, p) !== undefined);
  if (relevant.length === 0) continue;

  for (const loc of LOCALES) {
    const locPath = join(ROOT, loc, file);
    let locObj;
    try {
      locObj = JSON.parse(await readFile(locPath, "utf8"));
    } catch {
      continue;
    }
    let changed = false;
    for (const keyPath of relevant) {
      const enVal = getAt(enRaw, keyPath);
      if (getAt(locObj, keyPath) === undefined && enVal !== undefined) {
        setAt(locObj, keyPath, enVal);
        changed = true;
        patched += 1;
      }
    }
    if (changed) {
      await writeFile(locPath, `${JSON.stringify(locObj, null, 2)}\n`);
      console.log(`patched ${loc}/${file}`);
    }
  }
}

console.log(`Done. ${patched} key(s) copied from EN.`);
