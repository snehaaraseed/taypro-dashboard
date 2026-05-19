#!/usr/bin/env node
/**
 * Apply marketing + hub locale packs to messages/pages/{hi,ar,ja,bn}/*.json
 * Skips blog, authors, projects (CMS bodies stay English).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { deepMerge, resolvePack } from "./locale-packs/helpers.mjs";
import { pagePacks } from "./locale-packs/pages.mjs";
import {
  productKeywordPacks,
  productSharedPack,
} from "./locale-packs/product-keywords.mjs";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];
const SKIP = new Set(["blog.json", "authors.json", "projects.json"]);

const SHARED_BY_SLUG = {
  "model-a": "ModelAPage",
  "model-b": "ModelBPage",
  "model-t": "ModelTPage",
  nyuma: "NyumaPage",
  "nyuma-x": "NyumaXPage",
  "taypro-console": "TayproConsolePage",
};

function applyPackToFile(loc, slug, pack) {
  const locPath = join(root, "messages/pages", loc, `${slug}.json`);
  let data;
  try {
    data = JSON.parse(readFileSync(locPath, "utf8"));
  } catch {
    data = JSON.parse(
      readFileSync(join(root, "messages/pages/en", `${slug}.json`), "utf8")
    );
  }
  const resolved = resolvePack(pack, loc);
  for (const [key, value] of Object.entries(resolved)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (data[key]) deepMerge(data[key], value);
      else data[key] = value;
    }
  }
  mkdirSync(join(root, "messages/pages", loc), { recursive: true });
  writeFileSync(locPath, JSON.stringify(data, null, 2) + "\n");
}

// Product page packs first; marketing hub packs last so they are not overwritten.
for (const cmd of [
  "node scripts/apply-locale-page-packs.mjs",
  "node scripts/apply-full-product-translations.mjs",
  "node scripts/copy-shared-section-translations.mjs",
]) {
  try {
    execSync(cmd, { cwd: root, stdio: "inherit" });
  } catch (e) {
    console.warn(cmd, "failed", e.message);
  }
}

for (const loc of locales) {
  for (const { slug, pack } of pagePacks) {
    if (SKIP.has(`${slug}.json`)) continue;
    applyPackToFile(loc, slug, pack);
    console.log("packed", loc, slug);
  }

  for (const { slug, pack } of productKeywordPacks) {
    applyPackToFile(loc, slug, pack);
    console.log("keywords", loc, slug);
  }

  for (const [slug, pageKey] of Object.entries(SHARED_BY_SLUG)) {
    const section = productSharedPack[pageKey];
    if (section) applyPackToFile(loc, slug, { [pageKey]: section });
    console.log("shared", loc, slug);
  }
}

try {
  execSync("node scripts/rebrand-legacy-models-locales.mjs", {
    cwd: root,
    stdio: "inherit",
  });
} catch (e) {
  console.warn("rebrand-legacy-models-locales", e.message);
}

try {
  execSync("node scripts/rebrand-console-to-nectyr.mjs", {
    cwd: root,
    stdio: "inherit",
  });
} catch (e) {
  console.warn("rebrand-console-to-nectyr", e.message);
}

try {
  execSync("node scripts/fix-locale-brand-corruption.mjs", {
    cwd: root,
    stdio: "inherit",
  });
} catch (e) {
  console.warn("fix-locale-brand-corruption", e.message);
}

console.log("marketing locale packs done");
