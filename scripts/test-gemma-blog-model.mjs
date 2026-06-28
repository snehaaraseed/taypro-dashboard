#!/usr/bin/env node
/**
 * Smoke test: Gemma 4 models for blog JSON + translation snippet.
 * Run: node scripts/test-gemma-blog-model.mjs
 * Requires GEMINI_API_KEY in env (loads .env.local if present).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envLocal = path.join(root, ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  console.error("GEMINI_API_KEY not set");
  process.exit(1);
}

const PRIMARY = process.env.GEMINI_BLOG_MODEL?.trim() || "gemma-4-31b-it";
const genAI = new GoogleGenerativeAI(apiKey);

function sanitizeJsonText(raw) {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\u2028|\u2029/g, " ");
}

function parseJsonObject(text) {
  const sources = [];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) sources.push(fenced[1].trim());
  sources.push(text.trim());
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    sources.push(text.slice(start, end + 1));
  }

  let lastError;
  for (const raw of sources) {
    const candidate = sanitizeJsonText(raw);
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch (e) {
      lastError = e;
      try {
        const repaired = candidate
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
        return JSON.parse(repaired);
      } catch (inner) {
        lastError = inner;
      }
    }
  }
  throw lastError ?? new Error("Could not parse JSON");
}

function parseJsonObjectLenient(text) {
  try {
    return parseJsonObject(text);
  } catch {
    const titleMatch = text.match(/"title"\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (titleMatch?.[1]) {
      return { title: titleMatch[1].replace(/\\"/g, '"') };
    }
    throw new Error(`Could not parse JSON from: ${text.slice(0, 120)}`);
  }
}

async function testPlan() {
  const model = genAI.getGenerativeModel({
    model: PRIMARY,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(
    `Return JSON: {"title":"Test Solar O&M","description":"Short meta for utility plants in India.","h2Outline":["Quick answer","How often to clean","ROI"]}`
  );
  const text = result.response.text().trim();
  const parsed = parseJsonObject(text);
  if (!parsed.title || !Array.isArray(parsed.h2Outline)) {
    throw new Error("Plan JSON missing fields");
  }
  console.log("OK plan:", parsed.title);
}

async function testTranslationSnippet() {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_TRANSLATION_MODEL?.trim() || PRIMARY,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent(
    `Translate title to Hindi. Return JSON: {"title":"..."} for: "Solar Panel Cleaning Frequency for 50MW Plants"`
  );
  const text = result.response.text().trim();
  const parsed = parseJsonObjectLenient(text);
  console.log("OK translation snippet:", parsed.title.slice(0, 60));
}

try {
  console.log(`Testing models: ${PRIMARY}`);
  await testPlan();
  await testTranslationSnippet();
  console.log("Gemma smoke test passed.");
} catch (e) {
  console.error("Gemma smoke test failed:", e);
  process.exit(1);
}
