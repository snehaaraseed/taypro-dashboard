#!/usr/bin/env node
/**
 * Translate model-a / nyuma / nyuma-x locales by reusing strings already
 * translated on model-t / model-b (same English → same translation).
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];

function flattenStrings(obj, out = new Map(), path = "") {
  if (typeof obj === "string") {
    const prev = out.get(obj);
    if (!prev) out.set(obj, []);
    out.get(obj).push(path);
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenStrings(v, out, `${path}[${i}]`));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const p = path ? `${path}.${k}` : k;
      flattenStrings(v, out, p);
    }
  }
  return out;
}

function buildTranslationMap(sourcePage) {
  const enMap = flattenStrings(sourcePage);
  const translationMap = new Map();
  for (const [english, paths] of enMap) {
    if (english.trim().length < 2) continue;
    if (!translationMap.has(english)) translationMap.set(english, english);
  }
  return translationMap;
}

function applyMapToPage(page, translationMap) {
  return JSON.parse(
    JSON.stringify(page, (_, v) => {
      if (typeof v === "string" && translationMap.has(v)) {
        return translationMap.get(v);
      }
      return v;
    })
  );
}

function mergeTranslationMaps(...maps) {
  const merged = new Map();
  for (const m of maps) {
    for (const [en, tr] of m) {
      if (tr !== en) merged.set(en, tr);
    }
  }
  return merged;
}

function loadPage(loc, file, pageKey) {
  return JSON.parse(readFileSync(join(root, `messages/pages/${loc}/${file}`), "utf8"))[
    pageKey
  ];
}

function rebrand(text) {
  return text
    .replace(/Taypro Model-A/g, "Taypro GLYDE")
    .replace(/Taypro Model-B/g, "Taypro HELYX")
    .replace(/Taypro Model-T/g, "Taypro GLYDE-X")
    .replace(/Model-A\b/g, "GLYDE")
    .replace(/Model-B\b/g, "HELYX")
    .replace(/Model-T\b/g, "GLYDE-X")
    .replace(/Taypro Console/g, "NECTYR");
}

function glydeFix(text) {
  return rebrand(text)
    .replace(/GLYDE-X/g, "GLYDE")
    .replace(/NYUMA-X/g, "NYUMA")
    .replace(/सिंगल-एक्सिस ट्रैकर्स/g, "फिक्स्ड और सीज़नल-टिल्ट")
    .replace(/single-axis tracker/gi, "fixed and seasonal-tilt")
    .replace(/Single-Axis Tracker/gi, "Fixed-Tilt")
    .replace(/tracker plant/gi, "fixed-tilt plant")
    .replace(/ट्रैकर/g, "फिक्स्ड-टिल्ट")
    .replace(/NEXTracker और Gamechanger संगत/g, "यूटिलिटी-स्केल फिक्स्ड-टिल्ट प्लांट")
    .replace(/±15° flex between tables/gi, "continuous row coverage")
    .replace(/टेबलों के बीच ±15° फ्लेक्स/g, "निरंतर पंक्ति कवरेज");
}

function nyumaFix(text) {
  return glydeFix(text)
    .replace(/\bGLYDE\b/g, "NYUMA")
    .replace(/डुअल-पास/g, "सिंगल-पास PBT")
    .replace(/dual-pass/gi, "single-pass PBT")
    .replace(/Dual-Pass/gi, "PBT")
    .replace(/microfiber/gi, "PBT brush")
    .replace(/माइक्रोफाइबर/g, "PBT ब्रश");
}

function walkPage(page, fixFn) {
  const walk = (o) => {
    if (typeof o === "string") return fixFn(o);
    if (Array.isArray(o)) return o.map(walk);
    if (o && typeof o === "object") {
      const n = {};
      for (const [k, v] of Object.entries(o)) n[k] = walk(v);
      return n;
    }
    return o;
  };
  return walk(page);
}

for (const loc of locales) {
  const enT = loadPage("en", "model-t.json", "ModelTPage");
  const enB = loadPage("en", "model-b.json", "ModelBPage");
  const enConsole = loadPage("en", "taypro-console.json", "TayproConsolePage");
  const hiT = loadPage(loc, "model-t.json", "ModelTPage");
  const hiB = loadPage(loc, "model-b.json", "ModelBPage");
  const hiConsole = loadPage(loc, "taypro-console.json", "TayproConsolePage");

  const enToHi = new Map();
  function addPairs(enPage, trPage) {
    const enFlat = flattenStrings(enPage);
    const trFlat = flattenStrings(trPage);
    for (const [en, paths] of enFlat) {
      const trPath = paths[0];
      const trVal = trPath
        ? trPath.split(".").reduce((o, key) => {
            if (key.includes("[")) {
              const [k, idx] = key.split("[");
              return o[k][parseInt(idx, 10)];
            }
            return o[key];
          }, trPage)
        : en;
      if (typeof trVal === "string" && trVal !== en) enToHi.set(en, trVal);
    }
  }

  // Simpler: walk both trees in parallel
  function pairWalk(enNode, trNode, map) {
    if (typeof enNode === "string" && typeof trNode === "string") {
      if (enNode !== trNode) map.set(enNode, trNode);
      return;
    }
    if (Array.isArray(enNode) && Array.isArray(trNode)) {
      enNode.forEach((v, i) => pairWalk(v, trNode[i], map));
      return;
    }
    if (
      enNode &&
      trNode &&
      typeof enNode === "object" &&
      typeof trNode === "object"
    ) {
      for (const k of Object.keys(enNode)) {
        if (k in trNode) pairWalk(enNode[k], trNode[k], map);
      }
    }
  }

  const map = new Map();
  pairWalk(enT, hiT, map);
  pairWalk(enB, hiB, map);
  pairWalk(enConsole, hiConsole, map);

  const enA = JSON.parse(readFileSync(join(root, "messages/pages/en/model-a.json"), "utf8"));
  const enNyuma = JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma.json"), "utf8"));
  const enNyumaX = JSON.parse(readFileSync(join(root, "messages/pages/en/nyuma-x.json"), "utf8"));

  let glydePage = applyMapToPage(enA.ModelAPage, map);
  glydePage = walkPage(glydePage, glydeFix);

  let nyumaPage = applyMapToPage(enNyuma.NyumaPage, map);
  nyumaPage = walkPage(nyumaPage, nyumaFix);

  let nyumaXPage = applyMapToPage(enNyumaX.NyumaXPage, map);
  nyumaXPage = walkPage(nyumaXPage, (t) => nyumaFix(t).replace(/\bNYUMA\b(?!-X)/g, "NYUMA-X").replace(/NYUMA-X-X/g, "NYUMA-X"));

  const common = enA.Common
    ? applyMapToPage(enA.Common, map)
    : { breadcrumbHome: map.get("Home") || "Home" };

  writeFileSync(
    join(root, `messages/pages/${loc}/model-a.json`),
    JSON.stringify({ ModelAPage: glydePage, Common: common }, null, 2) + "\n"
  );
  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma.json`),
    JSON.stringify({ NyumaPage: nyumaPage, Common: common }, null, 2) + "\n"
  );
  writeFileSync(
    join(root, `messages/pages/${loc}/nyuma-x.json`),
    JSON.stringify(
      { NyumaXPage: nyumaXPage, Common: common },
      null,
      2
    ) + "\n"
  );

  // Rebrand model-b/t/console from packs
  for (const file of ["model-b.json", "model-t.json", "taypro-console.json"]) {
    const data = JSON.parse(readFileSync(join(root, `messages/pages/${loc}/${file}`), "utf8"));
    const key = Object.keys(data).find((k) => k.endsWith("Page"));
    if (key) data[key] = walkPage(data[key], rebrand);
    writeFileSync(join(root, `messages/pages/${loc}/${file}`), JSON.stringify(data, null, 2) + "\n");
  }

  console.log(loc, "model-a/nyuma/nyuma-x translated via string match");
}

console.log("translate-product-pages-by-match done");
