#!/usr/bin/env node
/** Purge Taypro Console identifiers from src/ and scripts/. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

const REPLACEMENTS = [
  ["TayproConsolePage", "NectyrPage"],
  ["TayproConsoleLayout", "NectyrLayout"],
  ["TayproConsolePage", "NectyrPage"],
  ["export default async function TayproConsolePage", "export default async function NectyrPage"],
  ["tayproConsoleDesc", "nectyrDesc"],
  ["tayproConsoleLabel", "nectyrLabel"],
  ["tayproConsoleTitle", "nectyrTitle"],
  ['t("tayproConsole")', 't("nectyr")'],
  ['"tayproConsole"', '"nectyr"'],
  ["| \"tayproConsole\"", "| \"nectyr\""],
  [': "tayproConsole"', ': "nectyr"'],
  ["export const tayproConsole", "export const nectyr"],
  ["tayproConsole.description", "nectyr.description"],
  ["consoleProductPageUrl", "nectyrPageUrl"],
  ["/tayproasset/taypro-console.png", "/tayproasset/nectyr.png"],
  ['linkConsole', 'linkNectyr'],
  ["taypro-console.json", "nectyr.json"],
  ['slug: "taypro-console"', 'slug: "nectyr"'],
  ['"taypro-console"', '"nectyr"'],
  ["taypro-console.mjs", "nectyr.mjs"],
  ["tayproConsolePack", "nectyrPack"],
];

const SKIP = new Set([
  "purge-taypro-console-everywhere.mjs",
  "purge-taypro-console-src.mjs",
  "rebrand-console-to-nectyr.mjs",
  "extracted-taypro-console.json",
  "search-console-client.ts",
  "GOOGLE_SEARCH_CONSOLE_SETUP.md",
]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules" || name === ".next" || name === "gemini") continue;
      walk(path, files);
    } else if (/\.(tsx?|mjs|py)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

for (const dir of [join(root, "src"), join(root, "scripts")]) {
  for (const path of walk(dir)) {
    const base = path.split("/").pop() ?? "";
    if (SKIP.has(base) || base.includes("search-console")) continue;
    let s = readFileSync(path, "utf8");
    const before = s;
    for (const [from, to] of REPLACEMENTS) {
      s = s.split(from).join(to);
    }
    if (s !== before) {
      writeFileSync(path, s);
      console.log("updated", path.replace(root + "/", ""));
    }
  }
}

console.log("purge-taypro-console-src done");
