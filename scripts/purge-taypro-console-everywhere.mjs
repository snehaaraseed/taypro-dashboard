#!/usr/bin/env node
/** Remove Taypro Console naming — rename files/keys; customer copy → NECTYR. */
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

const KEY_MAP = {
  TayproConsolePage: "NectyrPage",
  tayproConsoleDesc: "nectyrDesc",
  tayproConsoleLabel: "nectyrLabel",
  tayproConsoleTitle: "nectyrTitle",
  tayproConsole: "nectyr",
  linkConsole: "linkNectyr",
  consoleLink: "nectyrLink",
};

function renameKeys(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(renameKeys);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[KEY_MAP[k] ?? k] = renameKeys(v);
  }
  return out;
}

function transformText(s) {
  return s
    .replace(/Taypro Console/g, "NECTYR")
    .replace(/TAYPRO CONSOLE/g, "NECTYR")
    .replace(/TAYPRO console/g, "NECTYR")
    .replace(/Taypro console/g, "NECTYR")
    .replace(/taypro console/g, "NECTYR")
    .replace(/the TAYPRO console/g, "NECTYR")
    .replace(/through the TAYPRO console/g, "through NECTYR")
    .replace(/from the TAYPRO console/g, "from NECTYR");
}

function transformJsonFile(path) {
  let data = JSON.parse(readFileSync(path, "utf8"));
  data = renameKeys(data);
  writeFileSync(path, transformText(JSON.stringify(data, null, 2)) + "\n");
}

// Rename taypro-console.json → nectyr.json
for (const locale of ["en", "hi", "ar", "ja", "bn"]) {
  const dir = join(root, "messages/pages", locale);
  const from = join(dir, "taypro-console.json");
  const to = join(dir, "nectyr.json");
  if (existsSync(from)) {
    if (existsSync(to)) transformJsonFile(from);
    else renameSync(from, to);
    transformJsonFile(to);
    console.log("nectyr", locale);
  } else if (existsSync(to)) {
    transformJsonFile(to);
  }
}

// Root locale nav files
for (const file of ["en.json", "hi.json", "ar.json", "ja.json", "bn.json"]) {
  const path = join(root, "messages", file);
  if (existsSync(path)) transformJsonFile(path);
}

// All page JSON
for (const locale of ["en", "hi", "ar", "ja", "bn"]) {
  const dir = join(root, "messages/pages", locale);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "nectyr.json")) {
    transformJsonFile(join(dir, file));
  }
}

// data.ts FAQ
const dataPath = join(root, "src/app/data.ts");
if (existsSync(dataPath)) {
  writeFileSync(dataPath, transformText(readFileSync(dataPath, "utf8")));
}

console.log("purge-taypro-console-everywhere done");
