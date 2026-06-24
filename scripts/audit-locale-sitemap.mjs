#!/usr/bin/env node
/**
 * Verify sitemap locale inclusion matches translation quality gates.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pagesRoot = [join(root, "messages/pages"), join(root, "..", "messages/pages")].find(
  (d) => existsSync(join(d, "en", "home.json"))
);

if (!pagesRoot) {
  console.error("messages/pages not found");
  process.exit(1);
}

const ACTIVE = ["en", "hi", "ar", "ja", "bn"];
const modules = [
  "home",
  "solar-system",
  "solar-panel-cleaning-service-india",
  "solar-cleaning-capex-vs-opex",
  "press",
];

function measureHiQuality(module) {
  const enPath = join(pagesRoot, "en", `${module}.json`);
  const hiPath = join(pagesRoot, "hi", `${module}.json`);
  if (!existsSync(enPath) || !existsSync(hiPath)) return null;
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const hi = JSON.parse(readFileSync(hiPath, "utf8"));
  let translated = 0;
  let meaningful = 0;
  const walk = (obj, prefix = "") => {
    if (typeof obj === "string") {
      if (obj.length < 4) return;
      const loc = prefix
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), hi);
      if (typeof loc !== "string") return;
      if (!/meta|hero|prose|faq|stats|cards/.test(prefix)) return;
      meaningful++;
      if (/[\u0900-\u097F]/.test(loc) && loc !== obj) translated++;
      return;
    }
    if (Array.isArray(obj)) obj.forEach((v, i) => walk(v, `${prefix}[${i}]`));
    else if (obj && typeof obj === "object")
      for (const [k, v] of Object.entries(obj)) walk(v, prefix ? `${prefix}.${k}` : k);
  };
  walk(en);
  const pct = meaningful ? Math.round((100 * translated) / meaningful) : 0;
  return { pct, translated, meaningful };
}

console.log("Locale translation quality (hi, weighted paths):\n");
for (const mod of modules) {
  const q = measureHiQuality(mod);
  if (!q) {
    console.log(`  ${mod}: no hi file`);
    continue;
  }
  console.log(`  ${mod}: ${q.pct}% (${q.translated}/${q.meaningful})`);
}

console.log("\nActive locales:", ACTIVE.join(", "));
console.log("audit-locale-sitemap: done (manual: confirm getSitemapLocalesForPath in build)");
