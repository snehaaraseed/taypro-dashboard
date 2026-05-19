#!/usr/bin/env node
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];
const SKIP = new Set([
  "blog.json",
  "authors.json",
  "projects.json",
  "projects-filter.json",
]);
const scripts = {
  hi: /[\u0900-\u097F]/,
  ar: /[\u0600-\u06FF]/,
  ja: /[\u3040-\u30ff\u4e00-\u9faf]/,
  bn: /[\u0980-\u09FF]/,
};

function leaves(o, p = "") {
  const out = [];
  if (typeof o === "string") out.push([p, o]);
  else if (Array.isArray(o))
    o.forEach((v, i) => out.push(...leaves(v, `${p}[${i}]`)));
  else if (o && typeof o === "object")
    for (const [k, v] of Object.entries(o))
      out.push(...leaves(v, p ? `${p}.${k}` : k));
  return out;
}

function get(o, path) {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((c, p) => c?.[p], o);
}

const enDir = join(root, "messages/pages/en");
const files = readdirSync(enDir).filter(
  (f) => f.endsWith(".json") && !SKIP.has(f),
);

for (const loc of locales) {
  let total = 0,
    ident = 0,
    hasScript = 0,
    missing = 0;
  const worst = [];
  for (const file of files) {
    const en = JSON.parse(readFileSync(join(enDir, file), "utf8"));
    const lo = JSON.parse(
      readFileSync(join(root, "messages/pages", loc, file), "utf8"),
    );
    let fT = 0,
      fI = 0,
      fM = 0;
    for (const [path, v] of leaves(en)) {
      if (typeof v !== "string" || v.length < 4) continue;
      fT++;
      total++;
      const lv = get(lo, path);
      if (lv === undefined) {
        fM++;
        missing++;
        continue;
      }
      if (lv === v) {
        fI++;
        ident++;
      } else if (scripts[loc].test(lv)) hasScript++;
    }
    if (fI > 0)
      worst.push({ file, ident: fI, total: fT, missing: fM, pct: Math.round((100 * (fT - fI)) / fT) });
  }
  worst.sort((a, b) => b.ident - a.ident);
  const notIdentPct = Math.round((100 * (total - ident)) / total);
  const scriptPct = Math.round((100 * hasScript) / total);
  console.log(`\n=== ${loc.toUpperCase()} ===`);
  console.log(
    `In-scope: ${files.length} page files, ${total} strings (len>=4)`,
  );
  console.log(
    `  ${ident} identical to EN (${Math.round((100 * ident) / total)}%)`,
  );
  console.log(
    `  ${hasScript} differ + contain locale script (${scriptPct}%)`,
  );
  console.log(`  ${missing} missing keys vs EN`);
  console.log(`  ${notIdentPct}% strings differ from EN (any change)`);
  console.log(`Top files by untranslated count:`);
  for (const w of worst.slice(0, 8))
    console.log(
      `  ${w.file}: ${w.ident}/${w.total} identical (${100 - w.pct}% localized), ${w.missing} missing`,
    );
}
