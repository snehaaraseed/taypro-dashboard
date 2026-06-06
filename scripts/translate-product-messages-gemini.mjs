#!/usr/bin/env node
/**
 * OPTIONAL fallback: Translate product pages via Gemini API (requires quota).
 * Prefer: node scripts/apply-locale-page-packs.mjs &&
 *         node scripts/apply-full-product-translations.mjs &&
 *         node scripts/copy-shared-section-translations.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const root = join(import.meta.dirname, "..");

const PRODUCTS = [
  { file: "glyde.json", roots: ["GlydePage", "Common"] },
  { file: "helyx.json", roots: ["HelyxPage", "Common"] },
  { file: "glyde-x.json", roots: ["GlydeXPage", "Common"] },
  { file: "nyuma.json", roots: ["NyumaPage", "Common"] },
  { file: "nyuma-x.json", roots: ["NyumaXPage", "Common"] },
];

const LOCALES = [
  { code: "hi", language: "Hindi (हिन्दी)" },
  { code: "ar", language: "Arabic (العربية)" },
  { code: "ja", language: "Japanese (日本語)" },
  { code: "bn", language: "Bengali (বাংলা)" },
];

const BRAND_GLOSSARY = `
Preserve exactly (do not translate): GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, NECTYR, Taypro, Taypro OPEX, TÜV NORD, NEXTracker, Gamechanger, MINY, CRADYL, LTE, Wi-Fi, LoRa, LoRaWAN, RF mesh, IP65, IP55, CAPEX, OPEX, AMC, ROI, AI, ML, PBT, HTML, JSON.
Keep numerals and units as in source (MW, kWh, km, kg, °, %, 3,600, 99%+).
Do not translate URL paths or file paths.
`;

function loadGeminiKey() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^GEMINI_API_KEY=(.+)$/);
      if (m) return m[1].trim();
    }
  } catch {
    /* ignore */
  }
  return process.env.GEMINI_API_KEY?.trim() || "";
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { locales: LOCALES.map((l) => l.code), files: PRODUCTS.map((p) => p.file) };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--locale" && args[i + 1]) {
      out.locales = [args[++i]];
    } else if (args[i] === "--file" && args[i + 1]) {
      out.files = [args[++i]];
    }
  }
  return out;
}

function parseJsonResponse(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in Gemini response");
    return JSON.parse(match[0]);
  }
}

async function translatePayload(payload, language, localeCode, model) {
  const prompt = `You are a professional B2B translator for Taypro (solar panel cleaning robots for utility-scale plants in India).

Translate every string value in the following JSON from English to ${language} (locale: ${localeCode}).
${BRAND_GLOSSARY}

RULES:
1. Return ONLY valid JSON with the exact same keys and nesting as the input.
2. Translate string values only; never translate JSON keys.
3. For "keywords" arrays, translate each phrase for local SEO (natural ${language} search phrasing).
4. Meta descriptions: aim for ~150–160 characters where the source is a meta description.
5. Professional tone for plant owners, O&M teams, and developers.

Input JSON:
${JSON.stringify(payload)}`;

  const result = await model.generateContent(prompt);
  return parseJsonResponse(result.response.text());
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const apiKey = loadGeminiKey();
  if (!apiKey) {
    console.error("GEMINI_API_KEY missing in .env.local");
    process.exit(1);
  }

  const { locales: localeCodes, files: fileNames } = parseArgs();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model:
      process.env.GEMINI_TRANSLATION_MODEL?.trim() ||
      "gemini-3.1-flash-lite",
  });

  const localeDefs = LOCALES.filter((l) => localeCodes.includes(l.code));
  const productDefs = PRODUCTS.filter((p) => fileNames.includes(p.file));

  for (const { code, language } of localeDefs) {
    for (const { file, roots } of productDefs) {
      const enPath = join(root, "messages/pages/en", file);
      const locDir = join(root, "messages/pages", code);
      const locPath = join(locDir, file);

      const en = JSON.parse(readFileSync(enPath, "utf8"));
      const payload = {};
      for (const key of roots) {
        if (en[key]) payload[key] = en[key];
      }

      console.log(`Translating ${file} → ${code} (${language})…`);
      const translated = await translatePayload(payload, language, code, model);

      const out = {};
      for (const key of roots) {
        out[key] = translated[key] ?? payload[key];
      }
      // Preserve any extra top-level keys from EN (unlikely)
      for (const key of Object.keys(en)) {
        if (!out[key] && !roots.includes(key)) out[key] = en[key];
      }

      mkdirSync(locDir, { recursive: true });
      writeFileSync(locPath, `${JSON.stringify(out, null, 2)}\n`);
      console.log(`  wrote ${locPath}`);
      await sleep(2500);
    }
  }

  console.log("translate-product-messages-gemini complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
