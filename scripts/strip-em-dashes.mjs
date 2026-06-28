#!/usr/bin/env node
/**
 * Remove em dashes (U+2014) from user-facing content.
 * Replaces with commas for prose, colons for title-like patterns, hyphens for empty table cells.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const EM = "\u2014";

function stripEmDash(text) {
  if (!text.includes(EM)) return text;

  let s = text;
  // Empty table / placeholder cells
  s = s.replace(new RegExp(`<td>${EM}</td>`, "g"), "<td>-</td>");
  s = s.replace(new RegExp(`"${EM}"`, "g"), '"-"');
  s = s.replace(new RegExp(`'${EM}'`, "g"), "'-'");
  // Standalone JSX text node
  s = s.replace(new RegExp(`\\n\\s*${EM}\\s*\\n`, "g"), "\n        -\n");

  // Title-like: "Word — Word" at start of JSON string values or after product names
  s = s.replace(new RegExp(`([A-Z0-9][A-Za-z0-9®™/-]*) ${EM} `, "g"), "$1: ");

  // Spaced em dash in flowing text
  s = s.replace(new RegExp(` ${EM} `, "g"), ", ");

  // Glued em dash (no spaces)
  s = s.replace(
    new RegExp(`${EM}(not|and|or|between|roughly|validated|weather|often|skipping|Triplet|Integrate|Block|Owners|Weekly|Compare|Ahmadnagar|Karhe|pairs|Seasonal|Mar|Jan|Monsoon|Post|Scheduled|sign|off|peak|dust|constraints|commonly|define|belongs|demonstrates|concentrate|execute|deferred|skipped|Neneva|Bachau|Millimetre|Water|Daily|Once|Commissioning|Fault|At the|Battery|Each|GLYDE|NYUMA|NECTYR|Dual|Single|Zero|Frame|Modular|Rated|Edge|Autonomous|Patented|Waterless|Fleet|Schedule|Compare|Share|When|Should|How|Deep|Structured|Operational|Why|Module|Dust|Robot|CAPEX|Single-Axis|Waterless|Taypro|Mint|Live|Post|Product|Industry|Taypro Private)`, "g"),
    ", $1"
  );

  // Any remaining em dashes
  s = s.replace(new RegExp(EM, "g"), ", ");

  // Clean up double commas and comma before period
  s = s.replace(/, ,/g, ",");
  s = s.replace(/,\s*,/g, ",");
  s = s.replace(/,\s*\./g, ".");

  return s;
}

function walk(dir, exts, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (
      name === "node_modules" ||
      name === ".git" ||
      name === ".next" ||
      name === "seo-audit-inputs"
    )
      continue;
    const st = statSync(path);
    if (st.isDirectory()) walk(path, exts, files);
    else if (exts.has(extname(name))) files.push(path);
  }
  return files;
}

const roots = [
  "messages",
  "content/handwritten-case-studies",
  "content",
  "data",
  "deploy/maintenance",
  "src",
];

const exts = new Set([".json", ".html", ".tsx", ".ts", ".css"]);
const files = new Set();

for (const root of roots) {
  try {
    const st = statSync(root);
    if (st.isDirectory()) walk(root, exts).forEach((f) => files.add(f));
    else files.add(root);
  } catch {
    /* skip missing */
  }
}

let changed = 0;
let total = 0;

for (const file of [...files].sort()) {
  const raw = readFileSync(file, "utf8");
  if (!raw.includes(EM)) continue;
  total += (raw.match(new RegExp(EM, "g")) || []).length;
  const next = stripEmDash(raw);
  if (next !== raw) {
    writeFileSync(file, next);
    changed++;
    console.log(`updated: ${file}`);
  }
}

console.log(`\nDone. ${changed} files updated, ~${total} em dashes processed.`);
