#!/usr/bin/env node
/**
 * Compare messages/pages/en/*.json keys to hi, ar, ja, bn.
 * Exit 1 if any locale is missing keys present in English.
 */
import { readdir, readFile } from "fs/promises";
import { join } from "path";

function flatten(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    const pathKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flatten(v, pathKey));
    } else {
      keys.push(pathKey);
    }
  }
  return keys;
}

const root = join(process.cwd(), "messages/pages");
const locales = ["hi", "ar", "ja", "bn"];
const enFiles = (await readdir(join(root, "en"))).filter((f) =>
  f.endsWith(".json")
);

let missing = 0;
for (const file of enFiles) {
  const enKeys = new Set(
    flatten(JSON.parse(await readFile(join(root, "en", file), "utf8")))
  );
  for (const loc of locales) {
    const locPath = join(root, loc, file);
    let locRaw;
    try {
      locRaw = await readFile(locPath, "utf8");
    } catch (err) {
      if (err?.code === "ENOENT") {
        continue;
      }
      throw err;
    }
    const locKeys = new Set(flatten(JSON.parse(locRaw)));
    for (const key of enKeys) {
      if (!locKeys.has(key)) {
        console.error(`MISSING ${loc}/${file}: ${key}`);
        missing++;
      }
    }
  }
}

if (missing > 0) {
  console.error(`\n${missing} missing translation key(s).`);
  process.exit(1);
}
console.log(`OK: ${enFiles.length} page files × ${locales.length} locales aligned with en.`);
