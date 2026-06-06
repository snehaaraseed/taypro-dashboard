#!/usr/bin/env node
/** Rename i18n keys that still contain Console → Nectyr. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

const KEY_RENAMES = [
  ["p2LinkConsole", "p2LinkNectyr"],
  ["p2BeforeConsole", "p2BeforeNectyr"],
  ["p2AfterConsole", "p2AfterNectyr"],
  ["consoleBand", "nectyrBand"],
  ["linkBetweenOpexConsole", "linkBetweenOpexAndNectyr"],
  ["linkBetweenTConsole", "linkBetweenTAndNectyr"],
  ["bodyBeforeConsole", "bodyBeforeNectyr"],
  ["paragraph2BeforeConsole", "paragraph2BeforeNectyr"],
  ["paragraph2ConsoleLink", "paragraph2NectyrLink"],
  ['"console":', '"nectyr":'],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (name.endsWith(".json")) files.push(path);
  }
  return files;
}

for (const file of walk(join(root, "messages"))) {
  let s = readFileSync(file, "utf8");
  const before = s;
  for (const [from, to] of KEY_RENAMES) {
    s = s.split(from).join(to);
  }
  if (s !== before) {
    writeFileSync(file, s);
    console.log("keys", file.replace(root + "/", ""));
  }
}

const SRC_RENAMES = [
  ["p2LinkConsole", "p2LinkNectyr"],
  ["p2BeforeConsole", "p2BeforeNectyr"],
  ["p2AfterConsole", "p2AfterNectyr"],
  ["consoleBand", "nectyrBand"],
  ["linkBetweenOpexConsole", "linkBetweenOpexAndNectyr"],
  ["linkBetweenTConsole", "linkBetweenTAndNectyr"],
  ["bodyBeforeConsole", "bodyBeforeNectyr"],
  ["paragraph2BeforeConsole", "paragraph2BeforeNectyr"],
  ["paragraph2ConsoleLink", "paragraph2NectyrLink"],
  ['t("hero.console")', 't("hero.nectyr")'],
  ["consoleFaqs", "nectyrFaqs"],
  ['id="console-faq-heading"', 'id="nectyr-faq-heading"'],
];

function walkSrc(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkSrc(path, files);
    else if (/\.tsx?$/.test(name)) files.push(path);
  }
  return files;
}

for (const file of walkSrc(join(root, "src"))) {
  let s = readFileSync(file, "utf8");
  const before = s;
  for (const [from, to] of SRC_RENAMES) {
    s = s.split(from).join(to);
  }
  if (s !== before) {
    writeFileSync(file, s);
    console.log("src", file.replace(root + "/", ""));
  }
}

console.log("rename-console-i18n-keys done");
