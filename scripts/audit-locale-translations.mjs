#!/usr/bin/env node
/**
 * Thorough locale translation audit vs English.
 * Threshold matches {@link LOCALE_TRANSLATION_STRICT_PCT} in locale-page-quality.ts (weighted hero/prose/meta paths).
 */
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const locales = ["hi", "ar", "ja", "bn"];
const scripts = {
  hi: /[\u0900-\u097F]/,
  ar: /[\u0600-\u06FF]/,
  ja: /[\u3040-\u30ff\u4e00-\u9faf]/,
  bn: /[\u0980-\u09FF]/,
};

const SKIP_PAGES = new Set([]);

const INTENTIONAL_EN = [
  /^https?:\/\//i,
  /^[+\d\s.,₹$€£%°–, \-:(){}[\]/\\]+$/,
  /^(Taypro|GLYDE|HELYX|NYUMA|NECTYR|MINY|CRADYL|TÜV NORD|Opex|OPEX)$/i,
  /^LTE|Wi-Fi|LoRa|LoRaWAN|RF mesh|CAPEX|Opex$/i,
  /^MW$|^kW$|^kWh$|^Wp$|^IP\d+$/i,
  /^PT\d+H$/,
  /^kg CO/i,
  /^Model-A$|^Model-B$|^Model-T$/i,
  /^GLYDE-X$|^NYUMA-X$/,
];

function leaves(obj, prefix = "") {
  const out = [];
  if (typeof obj === "string") out.push({ path: prefix, value: obj });
  else if (Array.isArray(obj))
    obj.forEach((v, i) => out.push(...leaves(v, `${prefix}[${i}]`)));
  else if (obj && typeof obj === "object")
    for (const [k, v] of Object.entries(obj))
      out.push(...leaves(v, prefix ? `${prefix}.${k}` : k));
  return out;
}

function isIntentionalEnglish(s) {
  if (!s || s.length < 2) return true;
  return INTENTIONAL_EN.some((re) => re.test(s.trim()));
}

function hasLocaleScript(s, loc) {
  return scripts[loc].test(s);
}

function isMostlyLatin(s) {
  const latin = (s.match(/[a-zA-Z]/g) || []).length;
  const total = s.replace(/\s/g, "").length;
  return total > 0 && latin / total > 0.55;
}

function classifyString(enVal, locVal, loc) {
  if (typeof enVal !== "string" || enVal.length < 2) return "skip";
  if (locVal === enVal) return "identical_en";
  if (isIntentionalEnglish(locVal)) return "intentional";
  if (hasLocaleScript(locVal, loc)) return "translated";
  if (isMostlyLatin(locVal)) return "english_like";
  return "other";
}

function auditFile(enPath, locPath, loc) {
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const lo = JSON.parse(readFileSync(locPath, "utf8"));
  const enMap = new Map(leaves(en).map((x) => [x.path, x.value]));
  const counts = {
    skip: 0,
    identical_en: 0,
    intentional: 0,
    translated: 0,
    english_like: 0,
    other: 0,
    missing: 0,
  };
  const samples = { identical_en: [], english_like: [], missing: [] };

  for (const [path, enVal] of enMap) {
    if (typeof enVal !== "string" || enVal.length < 4) {
      counts.skip++;
      continue;
    }
    const locVal = loMapGet(lo, path);
    if (locVal === undefined) {
      counts.missing++;
      if (samples.missing.length < 5) samples.missing.push(path);
      continue;
    }
    const c = classifyString(enVal, locVal, loc);
    counts[c]++;
    if (c === "identical_en" && samples.identical_en.length < 8) {
      samples.identical_en.push({ path, en: enVal.slice(0, 80) });
    }
    if (c === "english_like" && samples.english_like.length < 8) {
      samples.english_like.push({ path, text: locVal.slice(0, 80) });
    }
  }

  const meaningful =
    counts.identical_en +
    counts.intentional +
    counts.translated +
    counts.english_like +
    counts.other;
  const localized = counts.translated + counts.intentional + counts.other;
  const pct =
    meaningful > 0 ? Math.round((100 * localized) / meaningful) : 100;
  const pctStrict =
    meaningful > 0
      ? Math.round((100 * counts.translated) / meaningful)
      : 100;

  return { counts, pct, pctStrict, samples };
}

function loMapGet(obj, dotPath) {
  const parts = dotPath.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function auditPages() {
  const enDir = join(root, "messages/pages/en");
  const files = readdirSync(enDir).filter((f) => f.endsWith(".json")).sort();

  console.log("\n# Page files audit\n");
  console.log(
    "| Locale | File | Translated* | Strict** | Identical EN | English-like | Missing |",
  );
  console.log("|--------|------|-------------|----------|--------------|--------------|---------|");

  const byLocale = {};

  for (const loc of locales) {
    byLocale[loc] = { files: [], totals: { identical: 0, english: 0, translated: 0, meaningful: 0 } };
    for (const file of files) {
      const skipped = SKIP_PAGES.has(file);
      const enPath = join(enDir, file);
      const locPath = join(root, "messages/pages", loc, file);
      if (!existsSync(locPath)) {
        console.log(`| ${loc} | ${file} |, |, |, |, | FILE MISSING |`);
        continue;
      }
      const r = auditFile(enPath, locPath, loc);
      const tag = skipped ? " (skipped)" : "";
      if (!skipped) {
        byLocale[loc].totals.identical += r.counts.identical_en;
        byLocale[loc].totals.english += r.counts.english_like;
        byLocale[loc].totals.translated += r.counts.translated;
        byLocale[loc].totals.meaningful +=
          r.counts.identical_en +
          r.counts.translated +
          r.counts.english_like +
          r.counts.intentional +
          r.counts.other;
        if (r.pctStrict < 90 || r.counts.identical_en > 15) {
          byLocale[loc].files.push({ file, ...r });
        }
      }
      console.log(
        `| ${loc} | ${file}${tag} | ${r.pct}% | ${r.pctStrict}% | ${r.counts.identical_en} | ${r.counts.english_like} | ${r.counts.missing} |`,
      );
    }
  }
  return byLocale;
}

function auditRootMessages() {
  console.log("\n# Root messages/{locale}.json\n");
  for (const loc of locales) {
    const r = auditFile(
      join(root, "messages/en.json"),
      join(root, `messages/${loc}.json`),
      loc,
    );
    console.log(
      `${loc}: ${r.pctStrict}% strict translated, ${r.counts.identical_en} identical, ${r.counts.english_like} english-like`,
    );
  }
}

function grepLegacy() {
  console.log("\n# Legacy name grep (Model-A/B/T, NECTYR)\n");
  const patterns = [
    { name: "Model-A", re: /\bModel-A\b/g },
    { name: "Model-B", re: /\bModel-B\b/g },
    { name: "Model-T", re: /\bModel-T\b/g },
    { name: "NECTYR", re: /NECTYR/gi },
    { name: "MODEL A", re: /\bMODEL A\b/g },
  ];
  for (const loc of locales) {
    const dir = join(root, "messages/pages", loc);
    for (const p of patterns) {
      let n = 0;
      for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
        const s = readFileSync(join(dir, f), "utf8");
        n += (s.match(p.re) || []).length;
      }
      if (n > 0) console.log(`  ${loc} ${p.name}: ${n} occurrences in page JSON`);
    }
  }
}

function skippedPagesDetail() {
  console.log("\n# Excluded pages (blog/projects)\n");
  for (const file of SKIP_PAGES) {
    for (const loc of locales) {
      const en = readFileSync(join(root, "messages/pages/en", file), "utf8");
      const lo = readFileSync(join(root, "messages/pages", loc, file), "utf8");
      const pct = en === lo ? 100 : Math.round(100 * (1 - levenshteinRatio(en, lo)));
      console.log(`  ${file} ${loc}: ${en === lo ? "100% identical to EN" : "~" + (100 - pct) + "% different from EN"}`);
    }
  }
}

function levenshteinRatio(a, b) {
  if (a === b) return 0;
  return 1 - Math.min(a.length, b.length) / Math.max(a.length, b.length);
}

function printWorstSamples(byLocale) {
  console.log("\n# Worst offenders, sample untranslated strings (hi)\n");
  const hi = byLocale.hi;
  for (const { file, samples, counts } of hi.files.slice(0, 6)) {
    console.log(`\n### ${file} (${counts.identical_en} identical, ${counts.english_like} english-like)`);
    for (const s of samples.identical_en.slice(0, 4)) {
      console.log(`  [identical] ${s.path}: "${s.en}"`);
    }
    for (const s of samples.english_like.slice(0, 4)) {
      console.log(`  [english] ${s.path}: "${s.text}"`);
    }
  }
}

const byLocale = auditPages();
auditRootMessages();
grepLegacy();
skippedPagesDetail();
printWorstSamples(byLocale);

console.log("\n# Summary\n");
for (const loc of locales) {
  const t = byLocale[loc].totals;
  const pct =
    t.meaningful > 0
      ? Math.round((100 * (t.translated + t.meaningful - t.identical - t.english)) / t.meaningful)
      : 0;
  console.log(
    `${loc.toUpperCase()} (in-scope pages): ~${pct}% non-English UI copy; ${t.identical} strings still word-for-word English; ${t.english} still mostly Latin/English`,
  );
}
