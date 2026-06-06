/**
 * Deep-merge locale translation packs into messages/pages/{locale}/*.json
 * Run: node scripts/apply-locale-page-packs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { localePagePacks } from "./locale-page-packs.mjs";

const root = join(import.meta.dirname, "..");

function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof target[k] === "object" &&
      target[k] !== null &&
      !Array.isArray(target[k])
    ) {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

const pages = [
  { slug: "helyx", pageKey: "HelyxPage" },
  { slug: "glyde-x", pageKey: "GlydeXPage" },
  { slug: "cleaning-service", pageKey: "CleaningServicePage" },
  { slug: "nectyr", pageKey: "NectyrPage" },
];

for (const loc of ["hi", "ar", "ja", "bn"]) {
  const pack = localePagePacks[loc];
  if (!pack) continue;

  for (const { slug, pageKey } of pages) {
    const locPath = join(root, "messages/pages", loc, `${slug}.json`);
    let data;
    try {
      data = JSON.parse(readFileSync(locPath, "utf8"));
    } catch {
      const en = JSON.parse(
        readFileSync(join(root, "messages/pages/en", `${slug}.json`), "utf8"),
      );
      data = JSON.parse(JSON.stringify(en));
    }

    const pagePack = pack[slug];
    if (pagePack) {
      deepMerge(data[pageKey], pagePack);
    }

    if (pack.common) {
      data.Common = { ...data.Common, ...pack.common };
    }

    mkdirSync(join(root, "messages/pages", loc), { recursive: true });
    writeFileSync(locPath, JSON.stringify(data, null, 2));
    console.log("packed", loc, slug);
  }
}

console.log("locale page packs applied");
