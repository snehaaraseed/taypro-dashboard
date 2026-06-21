#!/usr/bin/env node
/**
 * Sync keyword tracker from all published EN blogs:
 * - blogs.seo_keyword + published_topics.category (seo:, intent:, subang:, slot:)
 * - data/seo-keyword-intent-registry.json
 * - data/seo-coverage-filled.json
 *
 *   node scripts/sync-keyword-tracker-from-blogs.mjs           # dry run
 *   node scripts/sync-keyword-tracker-from-blogs.mjs --apply
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

const root = join(import.meta.dirname, "..");
const apply = process.argv.includes("--apply");
const dbPath = process.env.CMS_SQLITE?.trim() || join(root, "data", "cms.sqlite");
const registryPath = join(root, "data", "seo-keyword-intent-registry.json");
const ledgerPath = join(root, "data", "seo-coverage-filled.json");

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
  "cost-per-mw": "financial_roi",
  "cost-water": "financial_roi",
  "waterless-sprinkler": "comparison_alternative",
  "waterless-drought": "technical_howto",
  "robot-eval": "comparison_alternative",
  "robot-tracker-fit": "technical_howto",
  "robot-capex-opex": "financial_roi",
  "default-guide": "technical_howto",
  "default-om": "technical_howto",
  "default-compare": "comparison_alternative",
};

function normalizeSubAngle(raw) {
  return String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function keywordKey(keyword) {
  return keyword.toLowerCase().trim();
}

function parseCategory(category) {
  const cat = category ?? "";
  return {
    seo: cat.match(/seo:([^|]+)/i)?.[1]?.trim().toLowerCase() ?? null,
    slot: cat.match(/slot:([^|]+)/i)?.[1]?.trim() ?? null,
    arch: cat.match(/arch:([^|]+)/i)?.[1]?.trim() ?? null,
    intent: cat.match(/intent:([^|]+)/i)?.[1]?.trim().toLowerCase() ?? null,
    subang: cat.match(/subang:([^|]+)/i)?.[1]?.trim() ?? null,
    baseName: cat.split("|")[0]?.trim() || "Utility Solar O&M",
  };
}

function buildCategory(baseName, keyword, angleId, intentFamily, subAngle, archetype) {
  const parts = [
    baseName,
    `seo:${keyword}`,
    `slot:${angleId}`,
    `intent:${intentFamily}`,
    `subang:${normalizeSubAngle(subAngle)}`,
  ];
  if (archetype) parts.push(`arch:${archetype}`);
  return parts.join("|");
}

function inferIntentFromTitle(title) {
  const t = title.toLowerCase();
  if (/\bvs\b|versus|compared|comparison|better than|replace\b/.test(t)) {
    return "comparison_alternative";
  }
  if (/\broi\b|payback|economics|cost per|price per|capex|opex|tco\b|budget|carbon/.test(t)) {
    return "financial_roi";
  }
  if (/\bsafe\b|warranty|compliance|certif|micro-?crack|damage|prevent\b|specs/.test(t)) {
    return "risk_compliance";
  }
  if (/\btroubleshoot|fixing|solve|failure|problem|why is my|heavy soiling|mistakes/.test(t)) {
    return "troubleshooting_problem";
  }
  if (/\bhow to\b|how often|step-by-step|guide\b|checklist|integrat|deploy|schedule|frequency|monitor/.test(t)) {
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

function inferSubAngle({ title, intentFamily, angleId, slug }) {
  if (angleId?.trim()) return normalizeSubAngle(angleId);
  const t = title.toLowerCase();
  const vs = t.match(/\bvs\.?\s+([a-z0-9\s-]{3,48})/);
  if (vs?.[1]) return normalizeSubAngle(`vs_${vs[1]}`);
  if (intentFamily === "financial_roi" && /payback|roi/.test(t)) return "payback_roi";
  if (intentFamily === "comparison_alternative" && /manual|brush/.test(t)) {
    return "vs_manual_labor";
  }
  const fromSlug = normalizeSubAngle(slug.replace(/-/g, "_").slice(0, 48));
  if (fromSlug.length >= 8) return fromSlug;
  return normalizeSubAngle(`${intentFamily}_${slug.slice(0, 24)}`);
}

function titleCaseKeyword(keyword) {
  return keyword.replace(/\b\w/g, (c) => c.toUpperCase());
}

function anglesForKeyword(keyword) {
  const k = keyword.toLowerCase().trim();
  const titled = titleCaseKeyword(keyword);

  if (/panel price|pv panel price|solar panel price|photovoltaic panels price/.test(k)) {
    return [
      { id: "price-capex-om", buildTitle: () => "Solar Panel Price in India: Capex Context and O&M After You Buy" },
      { id: "price-per-watt-cleaning", buildTitle: () => "Solar Panel Price per Watt in India: What O&M Teams Budget for Cleaning" },
      { id: "price-utility-tco", buildTitle: () => "Utility-Scale Solar Panel Pricing in India: TCO Beyond Module Cost" },
      { id: "price-soiling-roi", buildTitle: () => "Solar Module Price vs Soiling Loss: When Cleaning ROI Beats Cheaper Panels" },
      { id: "cost-per-mw", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Per-MW Budget Lines Indian Asset Owners Use` },
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
  if (/frequency|how often|maintenance checklist|seasonal/.test(k)) {
    return [
      { id: "freq-50mw", buildTitle: () => "How Often Should You Clean Solar Panels on a 50 MW Plant in India?" },
      { id: "freq-dust-belt", buildTitle: () => "Solar Cleaning Frequency in Dust-Belt States: Seasonal Schedules for O&M" },
      { id: "freq-tracker", buildTitle: () => "Cleaning Intervals on Single-Axis Trackers: When Daily Cycles Beat Fixed Tilt" },
      { id: "default-guide", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Practical Guide for Utility-Scale Solar O&M in India` },
    ];
  }
  if (/cost|price|saving|waterless/.test(k)) {
    return [
      { id: "cost-manual-robot", buildTitle: () => "Solar Panel Cleaning Cost on Utility Plants: Manual vs Robot Breakdown" },
      { id: "cost-per-mw", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Per-MW Budget Lines Indian Asset Owners Use` },
      { id: "waterless-sprinkler", buildTitle: () => "Waterless Solar Panel Cleaning Robots: When They Beat Sprinklers on MW Sites" },
    ];
  }
  if (/robot|automatic|machine|system|cleaning/.test(k)) {
    return [
      { id: "robot-eval", buildTitle: (kw) => `${titleCaseKeyword(kw)}: What Indian Utility O&M Teams Should Evaluate` },
      { id: "robot-tracker-fit", buildTitle: (kw) => `${titleCaseKeyword(kw)} on Single-Axis Trackers: Docking, Cycle Time, and Night Windows` },
      { id: "robot-capex-opex", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Capex vs Opex Models for 25–100 MW Portfolios` },
      { id: "default-guide", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Practical Guide for Utility-Scale Solar O&M in India` },
    ];
  }
  return [
    { id: "default-guide", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Practical Guide for Utility-Scale Solar O&M in India` },
    { id: "default-om", buildTitle: (kw) => `${titleCaseKeyword(kw)}: O&M Decisions for Utility Plants in India` },
    { id: "default-compare", buildTitle: (kw) => `${titleCaseKeyword(kw)}: Methods, Costs, and Robot Options Compared` },
  ];
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

function buildSlotKey(keyword, angleId) {
  return `${keywordKey(keyword)}::${angleId.trim()}`;
}

function loadKeywordPool() {
  const pool = new Set();

  const queuePath = join(root, "data", "seo-blog-queue.json");
  if (existsSync(queuePath)) {
    const q = JSON.parse(readFileSync(queuePath, "utf8"));
    for (const kw of q.keywords ?? []) pool.add(kw.toLowerCase().trim());
  }

  const csvPath = join(root, "data", "seo-keywords.csv");
  if (existsSync(csvPath)) {
    const lines = readFileSync(csvPath, "utf8").split("\n");
    for (let i = 3; i < lines.length; i++) {
      const kw = lines[i]?.split("\t")[0]?.trim().toLowerCase();
      if (kw && kw.length > 2 && !kw.startsWith('"')) pool.add(kw);
    }
  }

  const expansionPath = join(root, "data", "seo-keywords-expansion.json");
  if (existsSync(expansionPath)) {
    try {
      const exp = JSON.parse(readFileSync(expansionPath, "utf8"));
      for (const row of exp.keywords ?? exp ?? []) {
        const kw = (row.keyword ?? row)?.toString?.().toLowerCase?.().trim();
        if (kw) pool.add(kw);
      }
    } catch {
      // optional
    }
  }

  return [...pool].sort((a, b) => b.length - a.length);
}

function loadManualRewriteKeywords() {
  const map = new Map();
  const dir = join(root, "data", "manual-blog-rewrites");
  if (!existsSync(dir)) return map;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
    if (data.slug && data.seoKeyword) map.set(data.slug, data.seoKeyword.toLowerCase().trim());
  }
  return map;
}

function matchKeywordFromTitle(title, pool) {
  const lower = title.toLowerCase();
  for (const kw of pool) {
    if (lower.includes(kw)) return kw;
  }
  if (/clean|soil|robot|waterless|brush/.test(lower)) return "solar panel cleaning";
  if (/maintenance|checklist|o&m|om\b/.test(lower)) return "solar panel maintenance";
  if (/performance ratio|\bpr\b|efficiency/.test(lower)) return "solar plant performance ratio";
  if (/tracker/.test(lower)) return "solar tracker maintenance";
  if (/inverter/.test(lower)) return "solar inverter efficiency";
  if (/manufacturer|supplier|module/.test(lower)) return "pv panel suppliers";
  return "solar panel cleaning";
}

function ensureUniqueSubAngle(keyword, intentFamily, subAngle, usedKeys) {
  let candidate = normalizeSubAngle(subAngle);
  let n = 1;
  while (usedKeys.has(`${keyword}::${intentFamily}::${candidate}`)) {
    candidate = normalizeSubAngle(`${subAngle}_${n}`);
    n++;
  }
  usedKeys.add(`${keyword}::${intentFamily}::${candidate}`);
  return candidate;
}

function loadPosts(db) {
  const topicMap = new Map();
  for (const row of db.prepare("SELECT slug, category, publish_date, created_at FROM published_topics").all()) {
    topicMap.set(row.slug, row);
  }

  return db
    .prepare(
      `SELECT slug, title, seo_keyword AS seoKeyword, publish_date AS publishDate, created_at AS createdAt
       FROM blogs WHERE locale = 'en' AND published = 1`
    )
    .all()
    .map((blog) => ({
      ...blog,
      topic: topicMap.get(blog.slug) ?? null,
    }));
}

function main() {
  if (!existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }

  const keywordPool = loadKeywordPool();
  const manualKw = loadManualRewriteKeywords();
  const db = new Database(dbPath);
  const posts = loadPosts(db);

  const registry = existsSync(registryPath)
    ? JSON.parse(readFileSync(registryPath, "utf8"))
    : {
        description: "Per-keyword search intent coverage for blog clusters.",
        updatedAt: new Date().toISOString(),
        byKeyword: {},
      };

  const ledger = existsSync(ledgerPath)
    ? JSON.parse(readFileSync(ledgerPath, "utf8"))
    : { description: "Coverage ledger", filled: [], failed: [] };

  const filledBySlot = new Map((ledger.filled ?? []).map((r) => [r.slotKey, r]));

  const usedSubAngleKeys = new Set();
  const newByKeyword = {};
  let dbTopicsUpdated = 0;
  let dbSeoUpdated = 0;
  let registryAdded = 0;
  let ledgerAdded = 0;

  const updateBlogSeo = db.prepare(
    `UPDATE blogs SET seo_keyword = ?, updated_at = datetime('now')
     WHERE slug = ? AND locale = 'en' AND (seo_keyword IS NULL OR trim(seo_keyword) = '')`
  );
  const updateTopic = db.prepare(
    `UPDATE published_topics SET title = ?, category = ? WHERE slug = ?`
  );
  const insertTopic = db.prepare(
    `INSERT INTO published_topics (title, slug, publish_date, category, created_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  const findTopic = db.prepare(`SELECT id FROM published_topics WHERE slug = ? LIMIT 1`);

  for (const post of posts) {
    const parsed = parseCategory(post.topic?.category);
    let keyword =
      post.seoKeyword?.trim().toLowerCase() ||
      parsed.seo ||
      manualKw.get(post.slug) ||
      matchKeywordFromTitle(post.title, keywordPool);
    keyword = keywordKey(keyword);

    let angleId = parsed.slot || matchTitleToSlot(post.title, keyword);
    let slotKey = buildSlotKey(keyword, angleId);
    const existingSlot = filledBySlot.get(slotKey);
    if (existingSlot && existingSlot.slug !== post.slug) {
      angleId = `legacy-${normalizeSubAngle(post.slug).slice(0, 32)}`;
      slotKey = buildSlotKey(keyword, angleId);
    }
    const intentFamily =
      (parsed.intent && INTENT_FAMILIES.includes(parsed.intent)
        ? parsed.intent
        : null) ??
      inferIntentFamily({
        angleId,
        archetype: parsed.arch,
        title: post.title,
      });
    let subAngle =
      (parsed.subang ? normalizeSubAngle(parsed.subang) : null) ??
      inferSubAngle({
        title: post.title,
        intentFamily,
        angleId,
        slug: post.slug,
      });
    subAngle = ensureUniqueSubAngle(keyword, intentFamily, subAngle, usedSubAngleKeys);

    const category = buildCategory(
      parsed.baseName,
      keyword,
      angleId,
      intentFamily,
      subAngle,
      parsed.arch
    );
    const writtenAt =
      post.topic?.created_at ||
      post.createdAt ||
      post.publishDate ||
      new Date().toISOString();

    console.log(
      `  ${post.slug}\n    kw: ${keyword} | intent: ${intentFamily} | sub: ${subAngle} | slot: ${angleId}`
    );

    if (apply) {
      if (!post.seoKeyword?.trim()) {
        const r = updateBlogSeo.run(keyword, post.slug);
        if (r.changes) dbSeoUpdated++;
      }

      const topicRow = findTopic.get(post.slug);
      if (topicRow) {
        const r = updateTopic.run(post.title, category, post.slug);
        if (r.changes) dbTopicsUpdated++;
      } else {
        insertTopic.run(
          post.title,
          post.slug,
          post.publishDate || writtenAt,
          category,
          writtenAt
        );
        dbTopicsUpdated++;
      }
    }

    const row = {
      intentFamily,
      subAngle,
      angleId,
      archetype: parsed.arch,
      title: post.title,
      slug: post.slug,
      slotKey,
      writtenAt,
      source: manualKw.has(post.slug) ? "manual" : "backfill",
    };

    if (!newByKeyword[keyword]) newByKeyword[keyword] = [];
    newByKeyword[keyword].push(row);
    registryAdded++;

    if (!filledBySlot.has(slotKey)) {
      filledBySlot.set(slotKey, {
        slotKey,
        slug: post.slug,
        filledAt: writtenAt,
      });
      ledgerAdded++;
    }
  }

  const totalRecords = Object.values(newByKeyword).reduce((n, rows) => n + rows.length, 0);
  const totalKeywords = Object.keys(newByKeyword).length;

  if (apply) {
    registry.byKeyword = newByKeyword;
    registry.updatedAt = new Date().toISOString();
    writeFileSync(registryPath, JSON.stringify(registry, null, 2));

    ledger.filled = [...filledBySlot.values()];
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    db.close();
  } else {
    db.close();
  }

  console.log(`\n${apply ? "APPLIED" : "DRY RUN"}:`);
  console.log(`  posts processed: ${posts.length}`);
  console.log(`  registry: ${totalKeywords} keywords, ${totalRecords} records (+${registryAdded} new slugs)`);
  console.log(`  coverage ledger: ${filledBySlot.size} slots (+${ledgerAdded} new)`);
  if (apply) {
    console.log(`  blogs.seo_keyword backfilled: ${dbSeoUpdated}`);
    console.log(`  published_topics updated: ${dbTopicsUpdated}`);
  } else {
    console.log("  Re-run with --apply to write.");
  }
}

main();
