#!/usr/bin/env node
/**
 * Test Google Search grounding for blog fact/stat research.
 *
 * Usage:
 *   node scripts/test-fact-grounding.mjs
 *   node scripts/test-fact-grounding.mjs --keyword "pv panel price" --title "Utility-Scale Solar Panel Pricing in India: TCO Beyond Module Cost"
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { GoogleGenAI } from "@google/genai";

const root = join(import.meta.dirname, "..");

const FACT_MODELS = (
  process.env.GEMINI_SERP_MODEL?.trim() ||
  "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.production");

function listKeys() {
  return [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2]
    .map((k) => k?.trim())
    .filter(Boolean);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let keyword = "solar panel cleaning cost";
  let title =
    "Solar Panel Cleaning Cost on Utility Plants: Manual vs Robot Breakdown";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--keyword" && args[i + 1]) keyword = args[++i];
    if (args[i] === "--title" && args[i + 1]) title = args[++i];
  }
  return { keyword, title };
}

function buildPrompt(keyword, title) {
  return `You are a research analyst for Taypro (utility-scale solar O&M in India).

Use Google Search to find VERIFIABLE industry and government statistics.
Do NOT search for Taypro product specs or invent numbers.

Blog keyword: "${keyword}"
Blog title: "${title}"

Return ONLY valid JSON:
{
  "verifiedStats": [{ "claim": "...", "value": "...", "context": "...", "sourceHint": "..." }],
  "regulatoryNotes": ["..."],
  "marketTrends": ["..."],
  "citationGuardrails": ["..."]
}`;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("No JSON in response");
    return JSON.parse(m[0]);
  }
}

function extractGrounding(response) {
  const candidate = response?.candidates?.[0];
  const meta = candidate?.groundingMetadata ?? {};
  const queries = Array.isArray(meta.webSearchQueries)
    ? meta.webSearchQueries
    : [];
  const sources = [];
  if (Array.isArray(meta.groundingChunks)) {
    for (const chunk of meta.groundingChunks) {
      if (chunk?.web?.uri) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    }
  }
  return { queries, sources };
}

async function main() {
  const keys = listKeys();
  if (keys.length === 0) {
    console.error("Set GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  const { keyword, title } = parseArgs();
  const prompt = buildPrompt(keyword, title);
  console.log(`\n📊 Grounded fact research test`);
  console.log(`   Keyword: ${keyword}`);
  console.log(`   Title:   ${title}`);
  console.log(`   Models:  ${FACT_MODELS.join(" → ")}\n`);

  let lastError;
  for (const apiKey of keys) {
    const ai = new GoogleGenAI({ apiKey });
    for (const model of FACT_MODELS) {
      const started = Date.now();
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            maxOutputTokens: 4096,
          },
        });

        const text = (response.text ?? "").trim();
        const parsed = parseJson(text);
        const grounding = extractGrounding(response);
        const ms = Date.now() - started;

        console.log(`✅ Success in ${(ms / 1000).toFixed(1)}s`);
        console.log(`   Model: ${model} | Key: ...${apiKey.slice(-4)}`);
        if (grounding.queries.length) {
          console.log(`   Search queries: ${grounding.queries.join(" | ")}`);
        }
        if (grounding.sources.length) {
          console.log(`   Sources (${grounding.sources.length}):`);
          for (const s of grounding.sources.slice(0, 5)) {
            console.log(`     - ${s.title ?? "(no title)"} → ${s.uri}`);
          }
        }
        console.log("\n--- Parsed fact brief ---\n");
        console.log(JSON.stringify(parsed, null, 2));
        return;
      } catch (error) {
        lastError = error;
        const msg = error instanceof Error ? error.message : String(error);
        const isQuota = msg.includes("429") || /quota/i.test(msg);
        console.warn(`   ✗ ${model} (...${apiKey.slice(-4)}): ${msg.slice(0, 120)}`);
        if (isQuota) break;
      }
    }
  }

  console.error("\n❌ All keys/models failed:", lastError);
  process.exit(1);
}

main();
