#!/usr/bin/env node
/**
 * Backfill data/seo-keyword-intent-registry.json from published_topics (no server-only).
 * Usage: node scripts/backfill-keyword-intent-registry.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

const root = join(import.meta.dirname, "..");
const registryPath = join(root, "data", "seo-keyword-intent-registry.json");

const INTENT_FAMILIES = [
  "technical_howto",
  "financial_roi",
  "risk_compliance",
  "comparison_alternative",
  "troubleshooting_problem",
];

const ANGLE_TO_INTENT = {
  "price-capex-om": "financial_roi",
  "price-per-watt-cleaning": "financial_roi",
  "price-utility-tco": "financial_roi",
  "price-soiling-roi": "financial_roi",
  "mfg-om-bridge": "risk_compliance",
  "mfg-shortlist": "comparison_alternative",
  "mfg-vendor-vs-robot": "comparison_alternative",
  "brush-vs-robot": "comparison_alternative",
  "brush-tracker": "comparison_alternative",
  "brush-water": "comparison_alternative",
  "freq-50mw": "technical_howto",
  "freq-dust-belt": "technical_howto",
  "freq-tracker": "technical_howto",
  "cost-manual-robot": "comparison_alternative",
  "robot-eval": "comparison_alternative",
  "robot-tracker-fit": "technical_howto",
  "default-guide": "technical_howto",
};

function normalizeSubAngle(raw) {
  return String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function inferIntentFromTitle(title) {
  const t = title.toLowerCase();
  if (/\bvs\b|versus|compared|comparison|better than|replace\b/.test(t)) {
    return "comparison_alternative";
  }
  if (/\broi\b|payback|economics|cost per|price per|capex|opex|tco\b|budget/.test(t)) {
    return "financial_roi";
  }
  if (/\bsafe\b|warranty|compliance|certif|micro-?crack|damage|prevent\b/.test(t)) {
    return "risk_compliance";
  }
  if (/\btroubleshoot|fixing|solve|failure|problem|why is my|heavy soiling/.test(t)) {
    return "troubleshooting_problem";
  }
  if (/\bhow to\b|how often|step-by-step|guide\b|integrat|deploy|schedule|frequency/.test(t)) {
    return "technical_howto";
  }
  return null;
}

function inferIntentFamily({ angleId, archetype, title }) {
  if (angleId && ANGLE_TO_INTENT[angleId]) return ANGLE_TO_INTENT[angleId];
  const archMap = {
    frequency_guide: "technical_howto",
    complete_guide: "technical_howto",
    checklist_playbook: "technical_howto",
    general_om: "technical_howto",
    price_capex_bridge: "financial_roi",
    cost_breakdown: "financial_roi",
    vendor_shortlist: "comparison_alternative",
    comparison_matrix: "comparison_alternative",
    manual_vs_robot: "comparison_alternative",
    robot_evaluation: "comparison_alternative",
    mistakes_listicle: "troubleshooting_problem",
    weather_soiling: "troubleshooting_problem",
  };
  if (archetype && archMap[archetype]) return archMap[archetype];
  return inferIntentFromTitle(title) ?? "technical_howto";
}

function inferSubAngle({ title, intentFamily, angleId }) {
  if (angleId?.trim()) return normalizeSubAngle(angleId);
  const t = title.toLowerCase();
  const vs = t.match(/\bvs\.?\s+([a-z0-9\s-]{3,48})/);
  if (vs?.[1]) return normalizeSubAngle(`vs_${vs[1]}`);
  if (intentFamily === "financial_roi" && /payback|roi/.test(t)) return "payback_roi";
  if (intentFamily === "comparison_alternative" && /manual|brush/.test(t)) {
    return "vs_manual_labor";
  }
  return normalizeSubAngle(`${intentFamily}_angle`);
}

function parseCategory(category) {
  const cat = category ?? "";
  const seo = cat.match(/seo:([^|]+)/i)?.[1]?.trim().toLowerCase() ?? null;
  const slot = cat.match(/slot:([^|]+)/i)?.[1]?.trim() ?? null;
  const arch = cat.match(/arch:([^|]+)/i)?.[1]?.trim() ?? null;
  const intent = cat.match(/intent:([^|]+)/i)?.[1]?.trim().toLowerCase() ?? null;
  const subang = cat.match(/subang:([^|]+)/i)?.[1]?.trim() ?? null;
  return { seo, slot, arch, intent, subang };
}

function loadRegistry() {
  if (!existsSync(registryPath)) {
    return {
      description: "Per-keyword search intent coverage for blog clusters.",
      updatedAt: new Date().toISOString(),
      byKeyword: {},
    };
  }
  return JSON.parse(readFileSync(registryPath, "utf8"));
}

function loadTopics() {
  const dbPath = join(root, "data", "cms.sqlite");
  const db = new Database(dbPath, { readonly: true });
  const rows = db
    .prepare(
      `SELECT title, slug, category, publish_date, created_at
       FROM published_topics ORDER BY created_at ASC`
    )
    .all();
  db.close();
  return rows;
}

function main() {
  const registry = loadRegistry();
  const existingSlugs = new Set();
  for (const rows of Object.values(registry.byKeyword ?? {})) {
    for (const r of rows) existingSlugs.add(r.slug);
  }

  let added = 0;
  for (const topic of loadTopics()) {
    if (existingSlugs.has(topic.slug)) continue;
    const parsed = parseCategory(topic.category);
    const keyword = parsed.seo;
    if (!keyword) continue;

    const intentFamily =
      (parsed.intent && INTENT_FAMILIES.includes(parsed.intent)
        ? parsed.intent
        : null) ??
      inferIntentFamily({
        angleId: parsed.slot,
        archetype: parsed.arch,
        title: topic.title,
      });
    const subAngle =
      (parsed.subang ? normalizeSubAngle(parsed.subang) : null) ??
      inferSubAngle({
        title: topic.title,
        intentFamily,
        angleId: parsed.slot,
      });

    const row = {
      intentFamily,
      subAngle,
      angleId: parsed.slot,
      archetype: parsed.arch,
      title: topic.title,
      slug: topic.slug,
      slotKey: parsed.slot ? `${keyword}::${parsed.slot}` : null,
      writtenAt: topic.created_at ?? topic.publish_date,
      source: "backfill",
    };

    if (!registry.byKeyword[keyword]) registry.byKeyword[keyword] = [];
    registry.byKeyword[keyword].push(row);
    existingSlugs.add(topic.slug);
    added++;
    console.log(`+ ${keyword} [${intentFamily}/${subAngle}] ← ${topic.slug}`);
  }

  registry.updatedAt = new Date().toISOString();
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  const kwCount = Object.keys(registry.byKeyword).length;
  const postCount = Object.values(registry.byKeyword).reduce(
    (n, rows) => n + rows.length,
    0
  );
  console.log(`\nWrote registry: +${added} records, ${kwCount} keywords, ${postCount} total`);
}

main();
