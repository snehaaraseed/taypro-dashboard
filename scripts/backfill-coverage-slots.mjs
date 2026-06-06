#!/usr/bin/env node
/**
 * Backfill seo-coverage-filled.json from CMS blogs + published_topics.
 * Matches titles to angle seeds from blog-topic-angles patterns.
 *
 * Usage: node scripts/backfill-coverage-slots.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

const root = join(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function titleCaseKeyword(keyword) {
  return keyword.replace(/\b\w/g, (c) => c.toUpperCase());
}

function anglesForKeyword(keyword) {
  const k = keyword.toLowerCase().trim();
  const titled = titleCaseKeyword(keyword);

  if (/panel price|pv panel price|solar panel price/.test(k)) {
    return [
      { id: "price-capex-om", buildTitle: () => "Solar Panel Price in India: Capex Context and O&M After You Buy" },
      { id: "price-per-watt-cleaning", buildTitle: () => "Solar Panel Price per Watt in India: What O&M Teams Budget for Cleaning" },
      { id: "price-utility-tco", buildTitle: () => "Utility-Scale Solar Panel Pricing in India: TCO Beyond Module Cost" },
      { id: "price-soiling-roi", buildTitle: () => "Solar Module Price vs Soiling Loss: When Cleaning ROI Beats Cheaper Panels" },
    ];
  }
  if (/manufacturer|supplier/.test(k)) {
    return [
      { id: "mfg-om-bridge", buildTitle: () => `${titled}: What Plant Owners Should Know Before O&M and Cleaning` },
      { id: "mfg-shortlist", buildTitle: () => `Shortlisting ${titled}: Specs That Matter for Utility Cleaning Robots` },
      { id: "mfg-vendor-vs-robot", buildTitle: () => `${titled} vs Cleaning Robot Partners: What MW Plants Evaluate` },
    ];
  }
  if (/brush/.test(k)) {
    return [
      { id: "brush-vs-robot", buildTitle: () => "Solar Panel Cleaning Brush vs Robot: TCO for Utility Plants in India" },
      { id: "brush-tracker", buildTitle: () => "Manual Brush Cleaning on Tracker Arrays: Limits at 50 MW+ Scale" },
      { id: "brush-water", buildTitle: () => "Brush Crews vs Waterless Robots: Labour and Water on Indian Solar Sites" },
    ];
  }
  if (/frequency|how often/.test(k)) {
    return [
      { id: "freq-50mw", buildTitle: () => "How Often Should You Clean Solar Panels on a 50 MW Plant in India?" },
      { id: "freq-dust-belt", buildTitle: () => "Solar Cleaning Frequency in Dust-Belt States: Seasonal Schedules for O&M" },
      { id: "freq-tracker", buildTitle: () => "Cleaning Intervals on Single-Axis Trackers: When Daily Cycles Beat Fixed Tilt" },
    ];
  }
  if (/cost|price/.test(k)) {
    return [
      { id: "cost-manual-robot", buildTitle: () => "Solar Panel Cleaning Cost on Utility Plants: Manual vs Robot Breakdown" },
      { id: "cost-per-mw", buildTitle: () => `${titled}: Per-MW Budget Lines Indian Asset Owners Use` },
      { id: "cost-water", buildTitle: () => "Water, Labour, and Robot Cleaning Costs on 10–100 MW Sites in India" },
    ];
  }
  if (/waterless/.test(k)) {
    return [
      { id: "waterless-sprinkler", buildTitle: () => "Waterless Solar Panel Cleaning Robots: When They Beat Sprinklers on MW Sites" },
      { id: "waterless-drought", buildTitle: () => "Waterless Panel Cleaning in Water-Stressed States: Utility Plant Playbook" },
    ];
  }
  if (/robot|automatic|machine|system/.test(k)) {
    return [
      { id: "robot-eval", buildTitle: () => `${titled}: What Indian Utility O&M Teams Should Evaluate` },
      { id: "robot-tracker-fit", buildTitle: () => `${titled} on Single-Axis Trackers: Docking, Cycle Time, and Night Windows` },
      { id: "robot-capex-opex", buildTitle: () => `${titled}: Capex vs Opex Models for 25–100 MW Portfolios` },
    ];
  }
  return [
    { id: "default-guide", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Practical Guide for Utility-Scale Solar O&M in India` },
    { id: "default-om", buildTitle: (kw) => `${titleCaseKeyword(kw)}: O&M Decisions for Utility Plants in India` },
    { id: "default-compare", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Methods, Costs, and Robot Options Compared` },
  ];
}

function buildSlotKey(keyword, angleId) {
  return `${keyword.toLowerCase().trim()}::${angleId.trim()}`;
}

function parseSlotFromCategory(category) {
  const cat = category ?? "";
  const seoMatch = cat.match(/seo:([^|]+)/i);
  const slotMatch = cat.match(/slot:([^|]+)/i);
  if (seoMatch?.[1] && slotMatch?.[1]) {
    return buildSlotKey(seoMatch[1], slotMatch[1]);
  }
  return null;
}

function titleWordSimilarity(a, b) {
  const wordsA = new Set(a.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.max(wordsA.size, wordsB.size);
}

function matchTitleToSlot(title, keyword) {
  const angles = anglesForKeyword(keyword);
  const lower = title.toLowerCase().trim();
  for (const angle of angles) {
    const seed = angle.buildTitle(keyword).trim();
    if (seed.toLowerCase() === lower) return angle.id;
    if (titleWordSimilarity(seed, title) > 0.72) return angle.id;
  }
  return angles[0]?.id ?? "default-guide";
}

function loadQueueKeywords() {
  const queuePath = join(root, "data", "seo-blog-queue.json");
  const raw = loadJson(queuePath);
  return Array.isArray(raw?.keywords) ? raw.keywords.map((k) => k.toLowerCase().trim()) : [];
}

function inferKeywordFromTitle(title) {
  const lower = title.toLowerCase();
  const queue = loadQueueKeywords();
  for (const kw of queue) {
    if (lower.includes(kw)) return kw;
  }
  const rows = loadJson(join(root, "data", "seo-keywords.csv"));
  return null;
}

function loadPosts() {
  const posts = [];
  const dbCandidates = [
    join(root, "data", "cms.sqlite"),
    join(root, "data", "cms.db"),
  ];
  const dbPath = dbCandidates.find((p) => existsSync(p));
  if (!dbPath) return posts;

  const db = new Database(dbPath, { readonly: true });
    try {
      try {
        const blogRows = db
          .prepare("SELECT title, slug, category FROM blogs WHERE locale = 'en'")
          .all();
        for (const row of blogRows) posts.push(row);
      } catch {
        // blogs table may not exist in older DB snapshots
      }
      try {
        const topicRows = db
          .prepare("SELECT title, slug, category FROM published_topics")
          .all();
        for (const row of topicRows) posts.push(row);
      } catch {
        // published_topics optional
      }
    } finally {
      db.close();
    }
  return posts;
}

function guessKeyword(title, category) {
  const parsed = parseSlotFromCategory(category);
  if (parsed) return parseSlotKeyKeyword(parsed);
  const catSeo = (category ?? "").match(/seo:([^|]+)/i);
  if (catSeo?.[1]) return catSeo[1].trim().toLowerCase();

  const queue = loadQueueKeywords();
  const lower = title.toLowerCase();
  let best = null;
  let bestLen = 0;
  for (const kw of queue) {
    if (lower.includes(kw) && kw.length > bestLen) {
      best = kw;
      bestLen = kw.length;
    }
  }
  return best ?? "solar panel cleaning";
}

function parseSlotKeyKeyword(slotKey) {
  const idx = slotKey.indexOf("::");
  return idx > 0 ? slotKey.slice(0, idx) : null;
}

function main() {
  const ledgerPath = join(root, "data", "seo-coverage-filled.json");
  const ledger = loadJson(ledgerPath) ?? { filled: [], failed: [] };
  const existing = new Set((ledger.filled ?? []).map((r) => r.slotKey));
  const filled = [...(ledger.filled ?? [])];

  for (const post of loadPosts()) {
    let slotKey = parseSlotFromCategory(post.category);
    if (!slotKey) {
      const keyword = guessKeyword(post.title, post.category);
      const angleId = matchTitleToSlot(post.title, keyword);
      slotKey = buildSlotKey(keyword, angleId);
    }
    if (existing.has(slotKey)) continue;
    existing.add(slotKey);
    filled.push({
      slotKey,
      slug: post.slug,
      filledAt: new Date().toISOString(),
    });
    console.log(`+ ${slotKey} ← "${post.title}" (${post.slug})`);
  }

  const out = {
    description: ledger.description,
    filled,
    failed: ledger.failed ?? [],
  };

  if (dryRun) {
    console.log(`\nDry run: would write ${filled.length} filled slots`);
  } else {
    writeFileSync(ledgerPath, JSON.stringify(out, null, 2));
    console.log(`\nWrote ${filled.length} filled slots to ${ledgerPath}`);
  }
}

main();
