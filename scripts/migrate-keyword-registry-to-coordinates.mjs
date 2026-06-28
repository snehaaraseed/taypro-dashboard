#!/usr/bin/env node
/**
 * Backfill semantic-intent-registry from keyword-intent-registry + published_topics.
 * Run: node scripts/migrate-keyword-registry-to-coordinates.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const intentPath = path.join(root, "data", "seo-keyword-intent-registry.json");
const outPath = path.join(root, "data", "semantic-intent-registry.json");

function inferDomain(keyword) {
  const k = keyword.toLowerCase();
  if (/clean|robot|wash|brush/.test(k)) return "cleaning_methods";
  if (/soil|pr |performance ratio|dust/.test(k)) return "soiling_pr";
  if (/price|cost|opex|capex|tco|roi/.test(k)) return "cleaning_economics";
  if (/manufacturer|supplier|module|panel price/.test(k)) return "module_procurement";
  if (/inverter|combiner|bos/.test(k)) return "inverter_bos";
  if (/tracker|tilt|axis/.test(k)) return "tracker_geometry";
  if (/monitor|scada|fleet|data/.test(k)) return "monitoring_data";
  return "plant_operations";
}

function contextHash() {
  return crypto.createHash("sha256").update("pan_india|50_100mw").digest("hex").slice(0, 12);
}

const intent = JSON.parse(fs.readFileSync(intentPath, "utf8"));
const byCoordinateKey = {};

for (const [keyword, records] of Object.entries(intent.byKeyword ?? {})) {
  if (!Array.isArray(records)) continue;
  for (const rec of records) {
    const domainId = inferDomain(keyword);
    const subAngleId = rec.subAngle ?? rec.angleId ?? "default";
    const intentFamily = rec.intentFamily ?? "technical_howto";
    const ctx = contextHash();
    const coordinateKey = `${domainId}::${intentFamily}::${subAngleId}::${ctx}`;
    byCoordinateKey[coordinateKey] = {
      domainId,
      intentFamily,
      subAngleId,
      contextHash: ctx,
      coordinateKey,
      keyword,
      title: rec.title,
      slug: rec.slug,
      writtenAt: rec.writtenAt ?? new Date().toISOString(),
      source: rec.source ?? "backfill",
    };
  }
}

const out = {
  description: "Migrated from seo-keyword-intent-registry.json",
  updatedAt: new Date().toISOString(),
  byCoordinateKey,
};
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Migrated ${Object.keys(byCoordinateKey).length} coordinates`);
