/**
 * One-time generator: bakes real hi/ar/ja/bn translations into
 * scripts/product-page-indexed-translations.mjs (static export, no runtime fetch).
 *
 *   node scripts/bake-indexed-translations.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const TARGET_LOCALES = ["hi", "ar", "ja", "bn"];
const OUT_PATH = join(import.meta.dirname, "product-page-indexed-translations.mjs");

const PROTECTED_TERMS = [
  "Taypro",
  "Model-A",
  "Model-B",
  "Model-T",
  "TÜV NORD",
  "NEXTracker",
  "Gamechanger",
  "Taypro Console",
  "TAYPRO Private Limited",
  "ARC",
  "IP55",
  "IP65",
  "AMC",
  "OPEX",
  "PR",
  "MW",
  "km",
  "m/min",
  "PBT",
  "LTE",
  "Wi-Fi",
  "LoRa",
  "LoRaWAN",
  "INR",
  "C3",
  "UVPBT",
  "service@taypro.in",
];

const PLACEHOLDER_PATTERN = /\{[^}]+\}|\$\{[^}]+\}/g;

function loadEnPage(slug) {
  return JSON.parse(readFileSync(join(root, "messages/pages/en", `${slug}.json`), "utf8"));
}

function pickIndexedObject(sourceObj, start, end) {
  const out = {};
  for (let i = start; i <= end; i += 1) {
    const key = String(i);
    if (Object.prototype.hasOwnProperty.call(sourceObj, key)) out[key] = sourceObj[key];
  }
  return out;
}

function pickFaqQKeys(faqObj) {
  const out = {};
  for (let i = 0; i <= 7; i += 1) {
    const q = `q${i}`;
    const a = `a${i}`;
    if (Object.prototype.hasOwnProperty.call(faqObj, q)) out[q] = faqObj[q];
    if (Object.prototype.hasOwnProperty.call(faqObj, a)) out[a] = faqObj[a];
  }
  return out;
}

function buildIndexedEnglishSource() {
  const modelB = loadEnPage("model-b").ModelBPage;
  const modelT = loadEnPage("model-t").ModelTPage;
  const cleaning = loadEnPage("cleaning-service").CleaningServicePage;
  const consolePage = loadEnPage("taypro-console").TayproConsolePage;

  return {
    "model-b": {
      ModelBPage: {
        schema: modelB.schema,
        usps: pickIndexedObject(modelB.usps, 0, 7),
        features: pickIndexedObject(modelB.features, 0, 7),
        specs: pickIndexedObject(modelB.specs, 0, 17),
        steps: pickIndexedObject(modelB.steps, 0, 5),
        faqs: pickIndexedObject(modelB.faqs, 0, 9),
      },
    },
    "model-t": {
      ModelTPage: {
        schema: modelT.schema,
        usps: pickIndexedObject(modelT.usps, 0, 7),
        features: pickIndexedObject(modelT.features, 0, 8),
        specs: pickIndexedObject(modelT.specs, 0, 19),
        steps: pickIndexedObject(modelT.steps, 0, 5),
        faqs: pickIndexedObject(modelT.faqs, 0, 9),
        compare: modelT.compare,
      },
    },
    "cleaning-service": {
      CleaningServicePage: {
        faqs: pickIndexedObject(cleaning.faqs, 0, 6),
        howToSteps: pickIndexedObject(cleaning.howToSteps, 0, 4),
        plantStudy: pickIndexedObject(cleaning.plantStudy, 0, 4),
      },
    },
    "taypro-console": {
      TayproConsolePage: {
        intro: consolePage.intro,
        capabilities: consolePage.capabilities,
        capabilitiesCards: pickIndexedObject(consolePage.capabilitiesCards, 0, 9),
        security: consolePage.security,
        workflow: consolePage.workflow,
        scheduling: consolePage.scheduling,
        visual: consolePage.visual,
        cta: consolePage.cta,
        faq: pickFaqQKeys(consolePage.faq),
      },
    },
  };
}

function collectLeafStrings(node, path = [], acc = []) {
  if (typeof node === "string") {
    acc.push([path, node]);
    return acc;
  }
  if (Array.isArray(node)) {
    node.forEach((item, idx) => collectLeafStrings(item, [...path, String(idx)], acc));
    return acc;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      collectLeafStrings(v, [...path, k], acc);
    }
  }
  return acc;
}

function setByPath(obj, path, value) {
  let curr = obj;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (!Object.prototype.hasOwnProperty.call(curr, key) || curr[key] == null) {
      curr[key] = {};
    }
    curr = curr[key];
  }
  curr[path[path.length - 1]] = value;
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

async function translateOne(text, targetLocale) {
  const { masked, tokens } = maskTerms(text);
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: targetLocale,
    dt: "t",
    q: masked,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate ${targetLocale} failed: ${res.status}`);
  const data = await res.json();
  const translated =
    Array.isArray(data?.[0]) && Array.isArray(data[0][0])
      ? data[0].map((seg) => (Array.isArray(seg) ? seg[0] ?? "" : "")).join("")
      : "";
  return unmaskTerms(translated || text, tokens);
}

async function translateTree(enTree, targetLocale, onProgress) {
  const leaves = collectLeafStrings(enTree);
  const translatedTree = {};
  let done = 0;

  for (const [path, text] of leaves) {
    const value = await translateOne(text, targetLocale);
    setByPath(translatedTree, path, value);
    done += 1;
    if (done % 20 === 0) onProgress?.(done, leaves.length);
    await new Promise((r) => setTimeout(r, 80));
  }

  return translatedTree;
}

async function buildLocaleIndexed(locale, source) {
  const out = {};
  for (const slug of Object.keys(source)) {
    process.stdout.write(`  ${locale} ${slug}...`);
    out[slug] = await translateTree(source[slug], locale, (d, t) => {
      process.stdout.write(`\r  ${locale} ${slug} ${d}/${t}`);
    });
    console.log(` done`);
  }
  return out;
}

const source = buildIndexedEnglishSource();
const indexedTranslations = {};

for (const locale of TARGET_LOCALES) {
  console.log(`Translating ${locale}...`);
  indexedTranslations[locale] = await buildLocaleIndexed(locale, source);
}

const fileBody = `// AUTO-GENERATED by scripts/bake-indexed-translations.mjs, do not edit by hand.
// Re-run: node scripts/bake-indexed-translations.mjs

export const indexedTranslations = ${JSON.stringify(indexedTranslations, null, 2)};
`;

writeFileSync(OUT_PATH, fileBody, "utf8");
console.log(`Wrote ${OUT_PATH}`);
