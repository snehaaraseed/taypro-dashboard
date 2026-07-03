#!/usr/bin/env node
/**
 * Live test: plain vs googleSearch grounding across models and API keys.
 * Usage: node scripts/test-grounded-search-live.mjs
 * Reads GEMINI_API_KEY* from .env.production in cwd.
 */
import fs from "fs";

const envPath = process.env.ENV_FILE || ".env.production";
const env = fs.readFileSync(envPath, "utf8");
const keys = [...env.matchAll(/^GEMINI_API_KEY[^=]*=(.+)$/gm)]
  .map((m) => m[1].replace(/^"|"$/g, "").trim())
  .filter(Boolean);

const GROUNDED_PROMPT = `Use Google Search to find what Indian utility-scale solar O&M managers search about "solar panel cleaning frequency".

Return ONLY valid JSON:
{"query":"real search query","candidates":[{"suggestedTitle":"title 45-68 chars","primaryKeyword":"keyword","serpGap":"gap"}]}`;

const models = [
  "gemma-4-31b-it",
  "gemma-4-26b-a4b-it",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
];

async function call(model, key, keyIdx, useGrounding) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{ parts: [{ text: useGrounding ? GROUNDED_PROMPT : "Reply OK" }] }],
    generationConfig: { maxOutputTokens: 1024 },
  };
  if (useGrounding) body.tools = [{ googleSearch: {} }];

  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - t0;
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  const err = parsed?.error;
  const meta = parsed?.candidates?.[0]?.groundingMetadata;
  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    model,
    keyIdx,
    grounding: useGrounding,
    status: res.status,
    ms,
    ok: res.ok,
    queries: meta?.webSearchQueries?.length || 0,
    sources: meta?.groundingChunks?.length || 0,
    hasJson: text.includes('"candidates"') || text.includes("{"),
    err: err ? `${err.code} ${err.message?.slice(0, 100)}` : null,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

console.log(`ENV: ${envPath}`);
console.log(`Keys: ${keys.length}, Models: ${models.join(", ")}\n`);

const summary = {};

for (const model of models) {
  summary[model] = { plainOk: 0, groundOk: 0, ground500: 0, ground429: 0 };
  console.log(`\n======== ${model} ========`);
  for (let ki = 0; ki < keys.length; ki++) {
    const plain = await call(model, keys[ki], ki, false);
    await sleep(600);
    const grounded = await call(model, keys[ki], ki, true);
    if (plain.ok) summary[model].plainOk++;
    if (grounded.ok) summary[model].groundOk++;
    if (grounded.status === 500) summary[model].ground500++;
    if (grounded.status === 429) summary[model].ground429++;

    console.log(`Key ${ki + 1} (...${keys[ki].slice(-4)}):`);
    console.log(
      `  plain:    ${plain.ok ? "OK" : "FAIL"} ${plain.status} ${plain.ms}ms ${plain.err || ""}`
    );
    console.log(
      `  grounded: ${grounded.ok ? "OK" : "FAIL"} ${grounded.status} ${grounded.ms}ms q=${grounded.queries} src=${grounded.sources} json=${grounded.hasJson} ${grounded.err || ""}`
    );
    await sleep(800);
  }
}

console.log("\n======== SUMMARY ========");
for (const model of models) {
  const s = summary[model];
  console.log(
    `${model}: plain ${s.plainOk}/${keys.length}, grounded ${s.groundOk}/${keys.length} (500=${s.ground500}, 429=${s.ground429})`
  );
}
