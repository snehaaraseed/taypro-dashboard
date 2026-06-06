/**
 * Merges product-page-sections into en JSON and applies locale translations.
 * Run: node scripts/merge-product-sections.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  modelBSections,
  modelTSections,
  cleaningServiceSections,
} from "./product-page-sections.mjs";
const root = join(import.meta.dirname, "..");

let localeTranslations = {};
try {
  ({ localeTranslations } = await import("./product-page-translations.mjs"));
} catch {
  console.warn("product-page-translations.mjs not ready; EN-only merge");
}

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

const pageConfig = {
  "helyx": {
    pageKey: "HelyxPage",
    sections: modelBSections,
    mergeMisc: true,
  },
  "glyde-x": {
    pageKey: "GlydeXPage",
    sections: modelTSections,
    mergeMisc: true,
  },
  "cleaning-service": {
    pageKey: "CleaningServicePage",
    sections: cleaningServiceSections,
    mergeMisc: false,
  },
};

for (const [slug, cfg] of Object.entries(pageConfig)) {
  const enPath = join(root, "messages/pages/en", `${slug}.json`);
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const page = en[cfg.pageKey];

  deepMerge(page, cfg.sections);

  if (cfg.mergeMisc) {
    page.misc = {
      ...page.misc,
      productCardsTitle: cfg.sections.productCardsTitle,
      callbackLine1: cfg.sections.callbackCard?.line1,
      callbackLine2: cfg.sections.callbackCard?.line2,
      faqTitle: cfg.sections.faqSection?.title,
      faqSubtitle: cfg.sections.faqSection?.subtitle,
      product360Label: cfg.sections.product360?.productLabel,
    };
  } else {
    page.misc = {
      ...page.misc,
      productCardsTitle: cfg.sections.productCardsTitle,
      projectsHeader: cfg.sections.projectsHeader,
      faqTitle: cfg.sections.faqSection?.title,
      faqSubtitle: cfg.sections.faqSection?.subtitle,
    };
    deepMerge(page.hero, cfg.sections.hero || {});
  }

  writeFileSync(enPath, JSON.stringify(en, null, 2));
  console.log("updated en", slug);

  for (const loc of ["hi", "ar", "ja", "bn"]) {
    const locPath = join(root, "messages/pages", loc, `${slug}.json`);
    let locData;
    try {
      locData = JSON.parse(readFileSync(locPath, "utf8"));
    } catch {
      locData = JSON.parse(JSON.stringify(en));
    }

    const locPage = locData[cfg.pageKey];
    const locSections = localeTranslations[loc]?.[slug];
    if (locSections) {
      deepMerge(locPage, locSections);
      if (cfg.mergeMisc && locSections.misc) {
        locPage.misc = { ...locPage.misc, ...locSections.misc };
      }
    } else {
      deepMerge(locPage, cfg.sections);
    }

    // Translate existing page content (meta, usps, etc.) from locale file if present
    const trMap = localeTranslations[loc]?.[`${slug}Full`];
    if (trMap) deepMerge(locPage, trMap);

    locData.Common = {
      ...en.Common,
      breadcrumbHome:
        localeTranslations[loc]?.common?.breadcrumbHome ?? locData.Common?.breadcrumbHome,
      connectivitySummary: en.Common.connectivitySummary,
    };

    mkdirSync(join(root, "messages/pages", loc), { recursive: true });
    writeFileSync(locPath, JSON.stringify(locData, null, 2));
    console.log("updated", loc, slug);
  }
}

console.log("merge complete");

try {
  await import("./apply-locale-page-packs.mjs");
} catch (e) {
  console.warn("apply-locale-page-packs skipped:", e.message);
}
