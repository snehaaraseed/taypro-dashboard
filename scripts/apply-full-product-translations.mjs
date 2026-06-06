/**
 * Applies full-page translations (meta, usps, faqs, section keys) to hi/ar/ja/bn JSON.
 * Run after merge-product-sections.mjs: node scripts/apply-full-product-translations.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { localeTranslations } from "./product-page-translations.mjs";
import { fullPagePacks } from "./product-page-full-translations.mjs";
import { indexedTranslations } from "./product-page-indexed-translations.mjs";

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
  for (const { slug, pageKey } of pages) {
    const enPath = join(root, "messages/pages/en", `${slug}.json`);
    const locPath = join(root, "messages/pages", loc, `${slug}.json`);
    const en = JSON.parse(readFileSync(enPath, "utf8"));
    let locData;
    try {
      locData = JSON.parse(readFileSync(locPath, "utf8"));
    } catch {
      locData = JSON.parse(JSON.stringify(en));
    }

    const page = locData[pageKey] ?? (locData[pageKey] = {});
    const sections = localeTranslations[loc]?.[slug];
    if (sections) deepMerge(page, sections);
    const fullSlug = localeTranslations[loc]?.[`${slug}Full`];
    if (fullSlug) deepMerge(page, fullSlug);
    const pack = fullPagePacks[loc]?.[pageKey];
    if (pack) deepMerge(page, pack);
    const indexed =
      indexedTranslations[loc]?.[slug]?.[pageKey] ??
      indexedTranslations[loc]?.[slug];
    if (indexed) deepMerge(page, indexed);

    locData.Common = {
      ...en.Common,
      breadcrumbHome:
        localeTranslations[loc]?.common?.breadcrumbHome ??
        fullPagePacks[loc]?.Common?.breadcrumbHome ??
        locData.Common?.breadcrumbHome,
      connectivitySummary: en.Common.connectivitySummary,
    };

    mkdirSync(join(root, "messages/pages", loc), { recursive: true });
    writeFileSync(locPath, JSON.stringify(locData, null, 2));
    console.log("applied full translations", loc, slug);
  }
}

console.log("apply-full-product-translations complete");
