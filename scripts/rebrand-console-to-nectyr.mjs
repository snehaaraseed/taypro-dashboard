#!/usr/bin/env node
/**
 * Customer-facing rebrand: Taypro Console → NECTYR.
 * Does not rename JSON keys, URLs, or i18n namespaces (TayproConsolePage, tayproConsole).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const root = join(import.meta.dirname, "..");

const SKIP_PATH_RE =
  /node_modules|\.next|GOOGLE_SEARCH_CONSOLE|extracted-taypro-console|rebrand-console-to-nectyr/;

const TEXT_EXT = /\.(json|txt|ts|tsx|md)$/;

function applyRules(text) {
  let s = text;
  const rules = [
    [/Taypro Console/g, "NECTYR"],
    [/TAYPRO CONSOLE/g, "NECTYR"],
    [/plus Taypro OPEX and Console\b/g, "plus Taypro OPEX and NECTYR"],
    [/plus OPEX and Console\b/g, "plus OPEX and NECTYR"],
    [/workflow on Console\b/g, "workflow on NECTYR"],
    [/on Console so\b/g, "on NECTYR so"],
    [/on Console without\b/g, "on NECTYR without"],
    [/via Console\b/g, "via NECTYR"],
    [/Console reporting/g, "NECTYR reporting"],
    [/Console remote/g, "NECTYR remote"],
    [/Console ticketing/g, "NECTYR ticketing"],
    [/,\s*Console remote/g, ", NECTYR remote"],
    [/robots and Console\b/g, "robots and NECTYR"],
    [/backed by Console\b/g, "backed by NECTYR"],
    [/through Console\b/g, "through NECTYR"],
    [/from Console\b/g, "from NECTYR"],
    [/Explore Console\b/g, "Explore NECTYR"],
    [/the Console fleet/g, "the NECTYR fleet"],
    [/on Console\./g, "on NECTYR."],
    [/use Console\b/g, "use NECTYR"],
    [/Console is the/g, "NECTYR is the"],
    [/Console exposes/g, "NECTYR exposes"],
    [/Console keeps/g, "NECTYR keeps"],
    [/Console reflects/g, "NECTYR reflects"],
    [/Console access/g, "NECTYR access"],
    [/Request Console/g, "Request NECTYR"],
    [/Console stays/g, "NECTYR stays"],
    [/in Console\b/g, "in NECTYR"],
    [/and Console monitoring/g, "and NECTYR monitoring"],
    [/or Console\b/g, "or NECTYR"],
    [/plus Console monitoring/g, "plus NECTYR monitoring"],
    [/Opex or Console/g, "Opex or NECTYR"],
    [/with Console visibility/g, "with NECTYR visibility"],
    [/Console में/g, "NECTYR में"],
    [/Console मॉनिटरिंग/g, "NECTYR मॉनिटरिंग"],
    [/या Console/g, "या NECTYR"],
    [/Taypro Opex या Console/g, "Taypro Opex या NECTYR"],
    [/Taypro Opex বা Console/g, "Taypro Opex বা NECTYR"],
    [/Taypro Opex أو Console/g, "Taypro Opex أو NECTYR"],
    [/বা Console/g, "বা NECTYR"],
    [/في Console/g, "في NECTYR"],
    [/Console এ/g, "NECTYR এ"],
    [/Console-/g, "NECTYR-"],
    [/Console রিপোর্ট/g, "NECTYR রিপোর্ট"],
    [/Console monitoring/gi, "NECTYR monitoring"],
    [/plus Console monitoring/gi, "plus NECTYR monitoring"],
    [/and Console monitoring/gi, "and NECTYR monitoring"],
    [/surface in Console/gi, "surface in NECTYR"],
    [/in Console before/gi, "in NECTYR before"],
    [/faults surface in Console/gi, "faults surface in NECTYR"],
    [/codes surface in Console/gi, "codes surface in NECTYR"],
    [/Opex or Console/gi, "Opex or NECTYR"],
  ];
  for (const [from, to] of rules) {
    s = s.replace(from, to);
  }
  return s;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(root, full);
    if (SKIP_PATH_RE.test(rel)) continue;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (TEXT_EXT.test(name)) files.push(full);
  }
  return files;
}

const targets = [
  join(root, "messages"),
  join(root, "public/llms.txt"),
  join(root, "src"),
].flatMap((p) => (p.endsWith(".txt") ? [p] : walk(p)));

let updated = 0;
for (const file of targets) {
  const before = readFileSync(file, "utf8");
  const after = applyRules(before);
  if (after !== before) {
    writeFileSync(file, after);
    updated++;
    console.log("updated", relative(root, file));
  }
}

console.log(`rebrand-console-to-nectyr: ${updated} files`);
