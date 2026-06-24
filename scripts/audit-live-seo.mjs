#!/usr/bin/env node
/**
 * Post-deploy SEO smoke test for money pages.
 * Usage: NEXT_PUBLIC_SITE_URL=https://taypro.in node scripts/audit-live-seo.mjs
 */
import assert from "node:assert/strict";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in").replace(
  /\/$/,
  ""
);

const MONEY_PATHS = [
  "/",
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  "/solar-panel-cleaning-robot-price-india",
  "/solar-panel-cleaning-robot-price-calculator",
  "/compare/taypro-vs-solabot",
  "/solar-panel-cleaning-service-india",
];

const SERP_DESC_MAX = 155;
const MIN_HOME_WORDS = 600;
const MIN_COMPARE_WORDS = 700;

function stripHtml(html) {
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

const failures = [];

for (const path of MONEY_PATHS) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Taypro-SEO-Audit/1.0" },
    redirect: "follow",
  });
  if (!res.ok) {
    failures.push(`${path}: HTTP ${res.status}`);
    continue;
  }
  const html = await res.text();
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "";
  const desc =
    html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const hreflangCount = (html.match(/hrefLang=/gi) || []).length;
  const words = wordCount(stripHtml(html));
  const robotsNoindex = /name="robots" content="[^"]*noindex/i.test(html);

  if (!title) failures.push(`${path}: missing <title>`);
  if (title.includes("| Taypro | Taypro"))
    failures.push(`${path}: double brand in title: ${title}`);
  if (desc.length > SERP_DESC_MAX + 1)
    failures.push(`${path}: description too long (${desc.length})`);
  if (h1Count !== 1) failures.push(`${path}: expected 1 h1, got ${h1Count}`);
  if (hreflangCount < 6)
    failures.push(`${path}: expected 6+ hreflang, got ${hreflangCount}`);
  if (path === "/" && words < MIN_HOME_WORDS)
    failures.push(`${path}: homepage words ${words} < ${MIN_HOME_WORDS}`);
  if (path.includes("/compare/") && words < MIN_COMPARE_WORDS)
    failures.push(`${path}: compare words ${words} < ${MIN_COMPARE_WORDS}`);

  console.log(
    `OK ${path} | title:${title.slice(0, 50)}… | desc:${desc.length} | words:${words} | h1:${h1Count}`
  );
}

// Coming-soon pages should be noindex
for (const path of [
  "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
  "/solar-panel-cleaning-system/orion-plant-intelligence-platform",
]) {
  const html = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "Taypro-SEO-Audit/1.0" },
  }).then((r) => r.text());
  if (!/name="robots" content="[^"]*noindex/i.test(html)) {
    failures.push(`${path}: expected noindex`);
  } else {
    console.log(`OK ${path} | noindex present`);
  }
}

if (failures.length > 0) {
  console.error("\nSEO audit failures:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("\naudit-live-seo: all checks passed");
