#!/usr/bin/env node
/**
 * Seed data/seo-keyword-campaigns.json from GSC boost + editorial queue + published topics.
 *
 * Usage: node scripts/backfill-keyword-campaigns.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

const root = join(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const COOLDOWN_DAYS = Number.parseInt(
  process.env.SEO_CAMPAIGN_COOLDOWN_DAYS || "21",
  10
);

function loadJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadCsvKeywords() {
  const csvPath = join(root, "data", "seo-keywords.csv");
  if (!existsSync(csvPath)) return [];
  const lines = readFileSync(csvPath, "utf8").split(/\r?\n/);
  const keywords = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith("Keyword") || line.startsWith("#")) continue;
    const cols = line.split("\t");
    const kw = cols[0]?.trim().toLowerCase();
    if (kw) keywords.push(kw);
  }
  return keywords;
}

function mapGscQueryToSeoKeyword(query, csvKeywords) {
  const q = query.toLowerCase().trim();
  if (csvKeywords.includes(q)) return q;
  let best = null;
  let bestLen = 0;
  for (const kw of csvKeywords) {
    if (kw.length < 8 && q.length >= 8) continue;
    if (q.includes(kw) && kw.length > bestLen) {
      best = kw;
      bestLen = kw.length;
    } else if (kw.includes(q) && q.length >= 8 && q.length > bestLen) {
      best = kw;
      bestLen = q.length;
    }
  }
  return best;
}

function parseSeoKeywordFromCategory(category) {
  const match = (category ?? "").match(/seo:([^|]+)/i);
  return match?.[1]?.trim().toLowerCase() ?? null;
}

function loadPublishedByKeyword() {
  const byKeyword = new Map();
  const dbCandidates = [
    join(root, "data", "cms.sqlite"),
    join(root, "data", "cms.db"),
  ];
  const dbPath = dbCandidates.find((p) => existsSync(p));
  if (!dbPath) return byKeyword;

  const db = new Database(dbPath, { readonly: true });
  try {
    const rows = db
      .prepare(
        "SELECT slug, category, publish_date FROM blogs WHERE locale = 'en' AND published = 1"
      )
      .all();
    for (const row of rows) {
      const kw = parseSeoKeywordFromCategory(row.category);
      if (!kw) continue;
      const existing = byKeyword.get(kw);
      const date = row.publish_date || "";
      if (!existing || date > existing.publishedAt) {
        byKeyword.set(kw, { slug: row.slug, publishedAt: date });
      }
    }
  } catch {
    try {
      const topics = db.prepare("SELECT slug, category FROM published_topics").all();
      for (const row of topics) {
        const kw = parseSeoKeywordFromCategory(row.category);
        if (!kw || byKeyword.has(kw)) continue;
        byKeyword.set(kw, { slug: row.slug, publishedAt: new Date().toISOString() });
      }
    } catch {
      // optional
    }
  } finally {
    db.close();
  }
  return byKeyword;
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function isInCooldown(nextReviewAfter) {
  if (!nextReviewAfter) return false;
  return new Date(nextReviewAfter).getTime() > Date.now();
}

function main() {
  const csvKeywords = loadCsvKeywords();
  const boost = loadJson(join(root, "data", "seo-gsc-boost.json"));
  const queue = loadJson(join(root, "data", "seo-blog-queue.json"));
  const publishedByKeyword = loadPublishedByKeyword();

  const byKeyword = new Map();

  for (const opp of boost?.opportunities ?? []) {
    const keyword = mapGscQueryToSeoKeyword(opp.query, csvKeywords);
    if (!keyword) continue;
    byKeyword.set(keyword, {
      keyword,
      gscQuery: opp.query,
      lastPosition: opp.position ?? null,
      lastImpressions: opp.impressions ?? 0,
      gscReason: opp.reason ?? null,
      gscScore: opp.score ?? 0,
      lastBlogSlug: null,
      lastBlogPublishedAt: null,
      nextReviewAfter: null,
      status: "eligible",
    });
  }

  for (const kw of queue?.keywords ?? []) {
    const key = kw.toLowerCase().trim();
    if (!key || !csvKeywords.includes(key) || byKeyword.has(key)) continue;
    byKeyword.set(key, {
      keyword: key,
      gscQuery: null,
      lastPosition: null,
      lastImpressions: 0,
      gscReason: null,
      gscScore: 0,
      lastBlogSlug: null,
      lastBlogPublishedAt: null,
      nextReviewAfter: null,
      status: "eligible",
    });
  }

  for (const [keyword, pub] of publishedByKeyword) {
    const entry = byKeyword.get(keyword) ?? {
      keyword,
      gscQuery: null,
      lastPosition: null,
      lastImpressions: 0,
      gscReason: null,
      gscScore: 0,
      lastBlogSlug: null,
      lastBlogPublishedAt: null,
      nextReviewAfter: null,
      status: "eligible",
    };
    entry.lastBlogSlug = pub.slug;
    entry.lastBlogPublishedAt = pub.publishedAt;
    entry.nextReviewAfter = addDays(pub.publishedAt || new Date().toISOString(), COOLDOWN_DAYS);
    entry.status = isInCooldown(entry.nextReviewAfter) ? "cooldown" : "eligible";
    byKeyword.set(keyword, entry);
  }

  const entries = [...byKeyword.values()].sort(
    (a, b) => b.gscScore - a.gscScore || a.keyword.localeCompare(b.keyword)
  );

  const out = {
    description:
      "GSC-driven keyword campaigns with post-publish cooldown. Refreshed weekly via sync-gsc; updated on blog publish.",
    updatedAt: new Date().toISOString(),
    entries,
  };

  const outPath = join(root, "data", "seo-keyword-campaigns.json");
  console.log(`Campaign entries: ${entries.length}`);
  console.log(
    `  eligible: ${entries.filter((e) => e.status === "eligible").length}, cooldown: ${entries.filter((e) => e.status === "cooldown").length}`
  );

  if (dryRun) {
    console.log(JSON.stringify(out, null, 2).slice(0, 1500) + "\n…");
    return;
  }

  mkdirSync(join(root, "data"), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();
