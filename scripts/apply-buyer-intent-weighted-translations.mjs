#!/usr/bin/env node
/**
 * Translate buyer-intent + press/careers/cleaning-machine weighted SEO sections
 * (meta, hero, prose, stats, cards, faq, proseSecondary) for hi/ar/ja/bn.
 *
 * Uses the same Google Translate path as bake-indexed-translations.mjs — NOT Gemini.
 *
 *   node scripts/apply-buyer-intent-weighted-translations.mjs
 *   node scripts/apply-buyer-intent-weighted-translations.mjs --locale hi
 *   node scripts/apply-buyer-intent-weighted-translations.mjs --module solar-cleaning-capex-vs-opex
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["hi", "ar", "ja", "bn"];
const MODULES = [
  "solar-panel-cleaning-service-india",
  "solar-om-services",
  "solar-cleaning-opex-pricing",
  "solar-panel-cleaning-robot-for-rooftop",
  "solar-panel-cleaning-robot-for-trackers",
  "solar-fleet-monitoring-software",
  "large-scale-solar-panel-cleaning",
  "solar-cleaning-capex-vs-opex",
  "solar-panel-soiling-loss-calculator",
  "solar-cleaning-robot-manufacturer-india",
  "solar-plant-data-intelligence",
  "enterprise-solar-cleaning-partnership",
  "press",
  "careers",
  "cleaning-machine",
];

const WEIGHTED_SEGMENT =
  /(?:^|\.)(meta|hero|prose|stats|cards|faq|proseSecondary)(?:\.|\[|$)/;
const SKIP_KEY =
  /(?:Href|href|Url|url|Path|path|Slug|slug|Keywords|keywords|Image|image)$/i;
const PLACEHOLDER_PATTERN = /\{[^}]+\}|\$\{[^}]+\}/g;

const PROTECTED_TERMS = [
  "Taypro",
  "TAYPRO",
  "GLYDE",
  "GLYDE-X",
  "NYUMA",
  "NYUMA-X",
  "HELYX",
  "NECTYR",
  "ORION",
  "MINY",
  "CRADYL",
  "TÜV NORD",
  "Opex",
  "OPEX",
  "SECI",
  "DVC",
  "IPP",
  "CPSU",
  "C&I",
  "O&M",
  "CAPEX",
  "OPEX",
  "AMC",
  "SCADA",
  "PR",
  "MW",
  "GW",
  "kWh",
  "MWh",
  "Wp",
  "RFQ",
  "ESG",
  "SOP",
  "SLA",
  "TCO",
  "ROI",
  "LTE",
  "Wi-Fi",
  "LoRa",
  "LoRaWAN",
  "Mercom India",
  "EPC World",
  "Energetica India",
  "Saur Energy",
  "TimesTech",
  "Live Mint",
  "service@taypro.in",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const localeIdx = args.indexOf("--locale");
  const moduleIdx = args.indexOf("--module");
  return {
    locales:
      localeIdx >= 0 ? [args[localeIdx + 1]].filter(Boolean) : LOCALES,
    modules:
      moduleIdx >= 0 ? [args[moduleIdx + 1]].filter(Boolean) : MODULES,
    force: args.includes("--force"),
  };
}

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function saveJson(rel, data) {
  fs.writeFileSync(
    path.join(ROOT, rel),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

function collectLeaves(node, prefix = "", acc = []) {
  if (typeof node === "string") {
    acc.push({ path: prefix, key: prefix.split(/[.[\]]/).filter(Boolean).pop() ?? "", value: node });
    return acc;
  }
  if (Array.isArray(node)) {
    node.forEach((item, idx) =>
      collectLeaves(item, `${prefix}[${idx}]`, acc)
    );
    return acc;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      const next = prefix ? `${prefix}.${k}` : k;
      collectLeaves(v, next, acc);
    }
  }
  return acc;
}

function getAtPath(obj, dotPath) {
  const parts = dotPath.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

function setAtPath(obj, dotPath, value) {
  const parts = dotPath.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    if (!Object.prototype.hasOwnProperty.call(cur, p) || cur[p] == null) {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function shouldTranslate(dotPath, key, value) {
  if (!WEIGHTED_SEGMENT.test(dotPath)) return false;
  if (SKIP_KEY.test(key)) return false;
  if (typeof value !== "string" || value.length < 2) return false;
  if (value.startsWith("/") || value.startsWith("http")) return false;
  return true;
}

function maskTerms(input) {
  const tokens = [];
  let output = input;

  output = output.replace(PLACEHOLDER_PATTERN, (m) => {
    const t = `__PH_${tokens.length}__`;
    tokens.push([t, m]);
    return t;
  });

  for (const term of PROTECTED_TERMS) {
    if (!output.includes(term)) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "g");
    output = output.replace(regex, (m) => {
      const t = `__TERM_${tokens.length}__`;
      tokens.push([t, m]);
      return t;
    });
  }

  return { masked: output, tokens };
}

function unmaskTerms(input, tokens) {
  let out = input;
  for (const [token, value] of tokens) {
    out = out.replaceAll(token, value);
  }
  return out;
}

const translateCache = new Map();

async function translateOne(text, targetLocale, attempt = 0) {
  const cacheKey = `${targetLocale}::${text}`;
  if (translateCache.has(cacheKey)) return translateCache.get(cacheKey);

  const { masked, tokens } = maskTerms(text);
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: targetLocale,
    dt: "t",
    q: masked,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (attempt < 5) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      return translateOne(text, targetLocale, attempt + 1);
    }
    throw err;
  }

  if (!res.ok) {
    if (attempt < 5 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return translateOne(text, targetLocale, attempt + 1);
    }
    throw new Error(`translate ${targetLocale} failed: ${res.status}`);
  }

  const data = await res.json();
  const translated =
    Array.isArray(data?.[0]) && Array.isArray(data[0][0])
      ? data[0].map((seg) => (Array.isArray(seg) ? seg[0] ?? "" : "")).join("")
      : "";
  const out = unmaskTerms(translated || text, tokens);
  translateCache.set(cacheKey, out);
  await new Promise((r) => setTimeout(r, 80));
  return out;
}

async function main() {
  const { locales, modules, force } = parseArgs();
  let translatedCount = 0;
  let skippedCount = 0;

  for (const locale of locales) {
    for (const module of modules) {
      const enPath = `messages/pages/en/${module}.json`;
      const locPath = `messages/pages/${locale}/${module}.json`;
      if (!fs.existsSync(path.join(ROOT, enPath))) {
        console.warn(`skip missing EN: ${enPath}`);
        continue;
      }

      const enData = loadJson(enPath);
      const locData = fs.existsSync(path.join(ROOT, locPath))
        ? loadJson(locPath)
        : structuredClone(enData);

      const leaves = collectLeaves(enData).filter(({ path: p, key, value }) =>
        shouldTranslate(p, key, value)
      );

      process.stdout.write(`${locale} ${module} (${leaves.length} strings)...`);

      for (const { path: dotPath, value: enVal } of leaves) {
        const current = getAtPath(locData, dotPath);
        if (!force && typeof current === "string" && current !== enVal) {
          skippedCount += 1;
          continue;
        }
        const translated = await translateOne(enVal, locale);
        setAtPath(locData, dotPath, translated);
        translatedCount += 1;
      }

      saveJson(locPath, locData);
      console.log(" done");
    }
  }

  console.log(
    `Weighted translations applied: ${translatedCount} updated, ${skippedCount} kept existing.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
