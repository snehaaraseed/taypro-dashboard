#!/usr/bin/env node
/**
 * Remove all Model A/B/T naming — files, namespaces, keys, and copy.
 * Run from repo root: node scripts/purge-model-abc-everywhere.mjs
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

const FILE_RENAMES = [
  ["model-a.json", "glyde.json"],
  ["model-b.json", "helyx.json"],
  ["model-t.json", "glyde-x.json"],
];

const KEY_MAP = {
  ModelAPage: "GlydePage",
  ModelBPage: "HelyxPage",
  ModelTPage: "GlydeXPage",
  modelBvsModelA: "helyxVsGlyde",
  modelTvsModelA: "glydeXVsGlyde",
  modelASpecific: "productSpecific",
  modelAMetric: "glydeMetric",
  modelBMetric: "helyxMetric",
  modelTMetric: "glydeXMetric",
  modelAMethod: "glydeMethod",
  modelBMethod: "helyxMethod",
  modelTMethod: "glydeXMethod",
  modelAPrefix: "nectyrPrefix",
  modelASuffix: "nectyrSuffix",
  modelAHeader: "glydeHeader",
  modelBHeader: "helyxHeader",
  modelTHeader: "glydeXHeader",
  linkModelA: "linkGlyde",
  linkModelB: "linkHelyx",
  linkModelT: "linkGlydeX",
  modelTImageAlt: "glydeXImageAlt",
  modelTImageTitle: "glydeXImageTitle",
  paragraph2BeforeModelA: "paragraph2BeforeGlyde",
  modelALink: "glydeLink",
  modelTLink: "glydeXLink",
  modelCardsTitle: "productCardsTitle",
  modelCards: "productCards",
  showRobotModelCards: "showRobotProductCards",
};

const NYUMA_X_KEY_MAP = {
  ...KEY_MAP,
  modelTvsModelA: "nyumaXVsNyuma",
  modelTHeader: "nyumaXHeader",
  modelAHeader: "nyumaHeader",
  linkModelA: "linkNyuma",
  linkModelT: "linkNyumaX",
  modelTMetric: "nyumaXMetric",
  modelTMethod: "nyumaXMethod",
};

const NYUMA_KEY_MAP = {
  ...KEY_MAP,
  linkModelT: "linkNyumaX",
  modelTHeader: "nyumaXHeader",
};

const ROW_KEY_MAP = {
  modelA: "glyde",
  modelB: "helyx",
  modelT: "glydeX",
};

const NYUMA_X_ROW_KEY_MAP = {
  modelA: "nyuma",
  modelT: "nyumaX",
  modelB: "helyx",
};

const NYUMA_ROW_KEY_MAP = {
  modelA: "robot",
  modelB: "helyx",
  modelT: "nyumaX",
};

const ROBOT_ROW_KEY_MAP = {
  modelA: "robot",
  modelB: "robot",
  modelT: "robot",
};

function renameKeys(obj, keyMap, rowKeyMap) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => renameKeys(v, keyMap, rowKeyMap));

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    let newKey = keyMap[k] ?? k;
    if (rowKeyMap[k]) newKey = rowKeyMap[k];
    out[newKey] = renameKeys(v, keyMap, rowKeyMap);
  }
  return out;
}

function transformJsonFile(path, basename) {
  let data = JSON.parse(readFileSync(path, "utf8"));

  let keyMap = KEY_MAP;
  let rowKeyMap = ROW_KEY_MAP;

  if (basename === "nyuma-x.json") {
    keyMap = NYUMA_X_KEY_MAP;
    rowKeyMap = NYUMA_X_ROW_KEY_MAP;
  } else if (basename === "nyuma.json") {
    keyMap = NYUMA_KEY_MAP;
    rowKeyMap = NYUMA_ROW_KEY_MAP;
  } else if (basename === "glyde.json" || basename === "model-a.json") {
    rowKeyMap = { ...ROW_KEY_MAP, modelA: "robot" };
  } else if (basename === "helyx.json" || basename === "model-b.json") {
    rowKeyMap = { ...ROW_KEY_MAP, modelB: "robot" };
  } else if (basename === "glyde-x.json" || basename === "model-t.json") {
    rowKeyMap = { ...ROW_KEY_MAP, modelT: "robot" };
  }

  data = renameKeys(data, keyMap, rowKeyMap);

  let text = JSON.stringify(data, null, 2);
  text = text
    .replace(/Taypro Model-A/g, "Taypro GLYDE")
    .replace(/Taypro Model-B/g, "Taypro HELYX")
    .replace(/Taypro Model-T/g, "Taypro GLYDE-X")
    .replace(/Model-A/g, "GLYDE")
    .replace(/Model-B/g, "HELYX")
    .replace(/Model-T/g, "GLYDE-X")
    .replace(/MODEL-A/g, "GLYDE")
    .replace(/MODEL-B/g, "HELYX")
    .replace(/MODEL-T/g, "GLYDE-X")
    .replace(/Model A\b/g, "GLYDE")
    .replace(/Model B\b/g, "HELYX")
    .replace(/Model T\b/g, "GLYDE-X");

  writeFileSync(path, text + "\n");
}

// Rename message files
for (const locale of ["en", "hi", "ar", "ja", "bn"]) {
  const dir = join(root, "messages/pages", locale);
  if (!existsSync(dir)) continue;
  for (const [from, to] of FILE_RENAMES) {
    const fromPath = join(dir, from);
    const toPath = join(dir, to);
    if (existsSync(fromPath)) {
      if (existsSync(toPath)) {
        transformJsonFile(fromPath, from);
        transformJsonFile(toPath, to);
      } else {
        renameSync(fromPath, toPath);
        transformJsonFile(toPath, to);
      }
    } else if (existsSync(toPath)) {
      transformJsonFile(toPath, to);
    }
  }
}

// Transform all other locale JSON that may contain legacy keys
function walkJson(dir) {
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);
    if (file.endsWith(".json")) {
      if (!FILE_RENAMES.some(([from]) => from === file)) {
        transformJsonFile(path, file);
      }
    }
  }
}

for (const locale of ["en", "hi", "ar", "ja", "bn"]) {
  const dir = join(root, "messages/pages", locale);
  if (existsSync(dir)) walkJson(dir);
}

// Fix nyuma card label value
for (const locale of ["en", "hi", "ar", "ja", "bn"]) {
  const path = join(root, "messages/pages", locale, "nyuma.json");
  if (!existsSync(path)) continue;
  let s = readFileSync(path, "utf8");
  s = s.replace(/"glydeX": "GLYDE-X"/g, '"nyumaX": "NYUMA-X"');
  writeFileSync(path, s);
}

console.log("purge-model-abc-everywhere: message files done");
