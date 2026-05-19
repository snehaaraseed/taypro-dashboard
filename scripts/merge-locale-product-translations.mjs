#!/usr/bin/env node
/**
 * Merge existing locale translations (model-b/t, packs) into model-a / nyuma pages
 * by matching JSON key paths, then rebrand legacy product names.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];

function deepMergeStrings(target, source) {
  if (!source || typeof source !== "object") return target;
  if (!target || typeof target !== "object") return target;
  if (Array.isArray(source)) {
    if (Array.isArray(target) && source.every((x) => typeof x === "string")) {
      return source.map((s, i) =>
        typeof target[i] === "string" ? source[i] : target[i]
      );
    }
    return target;
  }
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object" || Array.isArray(target[k])) {
        target[k] = {};
      }
      deepMergeStrings(target[k], v);
    } else if (typeof v === "string") {
      if (typeof target[k] === "string") target[k] = v;
    }
  }
  return target;
}

function applyRebrand(text) {
  if (typeof text !== "string") return text;
  return (
    text
      .replace(/Taypro Model-A/g, "Taypro GLYDE")
      .replace(/Taypro Model-B/g, "Taypro HELYX")
      .replace(/Taypro Model-T/g, "Taypro GLYDE-X")
      .replace(/Model-A\b/g, "GLYDE")
      .replace(/Model-B\b/g, "HELYX")
      .replace(/Model-T\b/g, "GLYDE-X")
      .replace(/Taypro Console/g, "NECTYR")
      .replace(/workflow on Console/g, "workflow on NECTYR")
      .replace(/via Console/g, "via NECTYR")
      .replace(/in Console/g, "in NECTYR")
      .replace(/Explore Console/g, "Explore NECTYR")
  );
}

function walkRebrand(obj) {
  if (Array.isArray(obj)) {
    return obj.map((x) => (typeof x === "string" ? applyRebrand(x) : walkRebrand(x)));
  }
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === "string") obj[k] = applyRebrand(v);
      else if (v && typeof v === "object") walkRebrand(v);
    }
  }
  return obj;
}

function glydeFromTracker(text) {
  return text
    .replace(/GLYDE-X/g, "GLYDE")
    .replace(/NYUMA-X/g, "NYUMA")
    .replace(/single-axis tracker/gi, "fixed and seasonal-tilt")
    .replace(/single axis tracker/gi, "fixed tilt")
    .replace(/tracker plant/gi, "fixed-tilt plant")
    .replace(/tracker table/gi, "module row")
    .replace(/tracker-ready/gi, "fixed-tilt")
    .replace(/for trackers/gi, "for fixed-tilt arrays")
    .replace(/NEXTracker and Gamechanger compatible/gi, "utility-scale arrays")
    .replace(/±15° flex between tables/gi, "continuous row coverage")
    .replace(/flexes ±15°/gi, "covers each row");
}

function nyumaFromGlyde(text) {
  return text
    .replace(/GLYDE-X/g, "NYUMA")
    .replace(/\bGLYDE\b/g, "NYUMA")
    .replace(/dual-pass/gi, "single-pass")
    .replace(/Dual-Pass/gi, "PBT")
    .replace(/dual pass/gi, "single-pass")
    .replace(/microfiber/gi, "PBT brush")
    .replace(/Microfiber/gi, "PBT")
    .replace(/patented dual-pass/gi, "single-pass PBT")
    .replace(/airflow and microfiber/gi, "PBT brush")
    .replace(/air blast \+ microfiber/gi, "PBT brush");
}

function processLocale(loc) {
  const enA = JSON.parse(
    readFileSync(join(root, `messages/pages/en/model-a.json`), "utf8")
  );
  const enNyuma = JSON.parse(
    readFileSync(join(root, `messages/pages/en/nyuma.json`), "utf8")
  );
  const enNyumaX = JSON.parse(
    readFileSync(join(root, `messages/pages/en/nyuma-x.json`), "utf8")
  );

  const locT = JSON.parse(
    readFileSync(join(root, `messages/pages/${loc}/model-t.json`), "utf8")
  );
  const locA = JSON.parse(
    readFileSync(join(root, `messages/pages/${loc}/model-a.json`), "utf8")
  );

  // GLYDE: merge translated strings from GLYDE-X page where keys align
  const glyde = JSON.parse(JSON.stringify(enA));
  deepMergeStrings(glyde.ModelAPage, locT.ModelTPage);
  if (locT.Common) deepMergeStrings(glyde.Common, locT.Common);
  walkRebrand(glyde);
  walkStrings(glyde, glydeFromTracker);

  writeFileSync(
    join(root, `messages/pages/${loc}/model-a.json`),
    `${JSON.stringify(glyde, null, 2)}\n`
  );
  console.log("merged", loc, "model-a (GLYDE)");

  // NYUMA: merge from GLYDE + PBT terminology
  const nyuma = JSON.parse(JSON.stringify(enNyuma));
  deepMergeStrings(nyuma.NyumaPage, glyde.ModelAPage);
  walkRebrand(nyuma);
  walkStrings(nyuma, (t) => nyumaFromGlyde(glydeFromTracker(t)));

  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma.json`),
    `${JSON.stringify(nyuma, null, 2)}\n`
  );
  console.log("merged", loc, "nyuma");

  // NYUMA-X: merge from GLYDE-X + PBT terminology
  const nyumaX = JSON.parse(JSON.stringify(enNyumaX));
  deepMergeStrings(nyumaX.NyumaXPage, locT.ModelTPage);
  if (locT.Common) deepMergeStrings(nyumaX.Common, locT.Common);
  walkRebrand(nyumaX);
  walkStrings(nyumaX, nyumaFromGlyde);

  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma-x.json`),
    `${JSON.stringify(nyumaX, null, 2)}\n`
  );
  console.log("merged", loc, "nyuma-x");

  // Rebrand existing model-b, model-t, console
  for (const file of ["model-b.json", "model-t.json", "taypro-console.json"]) {
    const p = join(root, `messages/pages/${loc}/${file}`);
    const data = JSON.parse(readFileSync(p, "utf8"));
    walkRebrand(data);
    writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
    console.log("rebranded", loc, file);
  }
}

function walkStrings(obj, fn) {
  if (typeof obj === "string") return fn(obj);
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "string") obj[i] = fn(obj[i]);
      else if (obj[i] && typeof obj[i] === "object") walkStrings(obj[i], fn);
    }
    return;
  }
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      if (typeof obj[k] === "string") obj[k] = fn(obj[k]);
      else if (obj[k] && typeof obj[k] === "object") walkStrings(obj[k], fn);
    }
  }
}

for (const loc of locales) {
  processLocale(loc);
}

console.log("merge-locale-product-translations done");
