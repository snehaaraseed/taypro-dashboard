#!/usr/bin/env node
/** Quick diagnostic: test each GEMINI_API_KEY_* for text + grounding. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

function listKeys() {
  const keys = [];
  const seen = new Set();
  const add = (raw) => {
    const k = raw?.trim();
    if (k && !seen.has(k)) {
      seen.add(k);
      keys.push(k);
    }
  };
  add(process.env.GEMINI_API_KEY);
  add(process.env.GEMINI_API_KEY_2);
  add(process.env.GEMINI_API_KEY_3);
  return keys;
}

function isQuota(msg) {
  return /429|quota|resource exhausted/i.test(msg);
}

async function main() {
  loadEnvLocal();
  const keys = listKeys();
  console.log("Configured keys:", keys.length);
  if (keys.length === 0) {
    console.error("No GEMINI_API_KEY in .env.local");
    process.exit(1);
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const label = `Key ${i + 1} (...${key.slice(-4)})`;
    console.log(`\n${label} prefix=${key.slice(0, 4)} len=${key.length}`);

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
      const r = await model.generateContent("Reply with exactly: ok");
      console.log("  gemma-3-27b-it:", (r.response.text() ?? "").trim().slice(0, 40));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log("  gemma-3-27b-it FAIL:", isQuota(msg) ? "QUOTA/429" : msg.slice(0, 140));
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: 'Return only JSON: {"ok":true}',
        config: { tools: [{ googleSearch: {} }], maxOutputTokens: 256 },
      });
      console.log(
        "  gemini-2.5-flash+search:",
        (response.text ?? "").trim().slice(0, 80) || "(empty)"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(
        "  gemini-2.5-flash+search FAIL:",
        isQuota(msg) ? "QUOTA/429" : msg.slice(0, 140)
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
