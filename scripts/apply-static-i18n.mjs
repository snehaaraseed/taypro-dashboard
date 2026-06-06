#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function deepMerge(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function writeJson(relPath, data) {
  const full = path.join(ROOT, relPath);
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function applyPatch(relPath, patch) {
  const full = path.join(ROOT, relPath);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  deepMerge(data, patch);
  writeJson(relPath, data);
}

function leafPaths(obj, prefix = "") {
  const paths = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      paths.push(...leafPaths(v, p));
    } else {
      paths.push({ path: p, value: String(v) });
    }
  }
  return paths;
}

function get(obj, p) {
  return p.split(".").reduce((o, k) => o?.[k], obj);
}

function report(enPath, locPath) {
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, enPath), "utf8"));
  const loc = JSON.parse(fs.readFileSync(path.join(ROOT, locPath), "utf8"));
  const leaves = leafPaths(en);
  const missing = leaves.filter(({ path: p }) => get(loc, p) === undefined);
  const identical = leaves.filter(({ path: p, value }) => get(loc, p) === value);
  const metaOk = new Set([
    "openGraphSiteName",
    "openGraphLocale",
    "openGraphType",
    "twitterCard",
  ]);
  const brandOk = (p, v) =>
    /\.(glyde|glydeX|nyuma|nyumaX|helyx|nectyr|miny|cradyl|orion|breadcrumb)$/.test(p) ||
    p.includes("p2LinkNyuma") ||
    p.includes("p2LinkModelB") ||
    p.includes("p2LinkModelT") ||
    p.includes("p2LinkConsole") ||
    p.includes("bold3") ||
    p.includes("bold4") ||
    p.includes("tableHeaders.") ||
    (p.includes("row4.") && v.includes("CAPEX")) ||
    (p.includes("row5.criterion") && v === "NECTYR") ||
    (p.includes("row5.") && v.includes("LTE")) ||
    (p.includes("commercialModel.line3.title") && v === "Taypro Opex") ||
    (p.includes("capex.breadcrumb") && v === "CAPEX") ||
    v === "Taypro" ||
    v === "TÜV NORD" ||
    v === "50 MW+" ||
    v === "." ||
    v === "en_IN" ||
    v === "website" ||
    v === "summary_large_image" ||
    v === "HELYX" ||
    v === "GLYDE-X" ||
    v === "NYUMA" ||
    v === "NYUMA-X" ||
    v === "GLYDE";

  const untranslated = identical.filter(
    ({ path: p, value: v }) =>
      !metaOk.has(p.split(".").pop()) && !brandOk(p, v)
  );
  const pct = (((leaves.length - untranslated.length - missing.length) / leaves.length) * 100).toFixed(1);
  console.log(`${locPath}: ${pct}% translated (${untranslated.length} untranslated, ${missing.length} missing / ${leaves.length} keys)`);
}

const patches = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "static-i18n-patches.json"), "utf8")
);

for (const [relPath, patchByLocale] of Object.entries(patches.files)) {
  for (const [locale, patch] of Object.entries(patchByLocale)) {
    applyPatch(`messages/pages/${locale}/${relPath}`, patch);
  }
}

console.log("\nValidation:");
for (const locale of ["hi", "ar", "ja", "bn"]) {
  report("messages/pages/en/solar-system.json", `messages/pages/${locale}/solar-system.json`);
}
for (const locale of ["hi", "ar", "ja", "bn"]) {
  report("messages/pages/en/projects-filter.json", `messages/pages/${locale}/projects-filter.json`);
}
