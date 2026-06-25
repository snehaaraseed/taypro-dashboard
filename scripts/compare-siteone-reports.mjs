#!/usr/bin/env node
/**
 * Compare two SiteOne Crawler JSON reports (baseline vs after remediation).
 * Usage: node scripts/compare-siteone-reports.mjs [baseline.json] [current.json]
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const baselinePath =
  process.argv[2] ?? join(process.cwd(), "seo-audit-inputs/siteone-full-report.json");
const currentPath =
  process.argv[3] ?? join(process.cwd(), "seo-audit-inputs/siteone-full-report-v2.json");

function load(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function scoreMap(data) {
  const cats = data.qualityScores?.categories ?? [];
  const overall = data.qualityScores?.overall?.score;
  const map = { overall };
  for (const c of cats) map[c.code] = c.score;
  return map;
}

function countSummary(data, status) {
  return (data.summary?.items ?? []).filter((i) => i.status === status).length;
}

function findSummary(data, aplCode) {
  return (data.summary?.items ?? []).find((i) => i.aplCode === aplCode)?.text ?? null;
}

function countLongTitles(data) {
  return (data.results ?? []).filter(
    (r) => r.extras?.Title && r.extras.Title.length > 60
  ).length;
}

function countStatus(data, status) {
  return data.stats?.countByStatus?.[status] ?? 0;
}

const baseline = load(baselinePath);
const current = load(currentPath);

const bScores = scoreMap(baseline);
const cScores = scoreMap(current);

console.log("SiteOne report comparison");
console.log(`  Baseline: ${baselinePath}`);
console.log(`  Current:  ${currentPath}`);
console.log("");

console.log("Quality scores:");
for (const key of [
  "overall",
  "seo",
  "performance",
  "security",
  "accessibility",
  "best-practices",
]) {
  const b = bScores[key];
  const c = cScores[key];
  const delta = c != null && b != null ? (c - b).toFixed(1) : "n/a";
  const sign = Number(delta) > 0 ? "+" : "";
  console.log(`  ${key.padEnd(18)} ${b ?? "n/a"} → ${c ?? "n/a"} (${sign}${delta})`);
}

console.log("");
console.log("Key metrics:");
const metrics = [
  ["Total URLs", baseline.stats?.totalUrls, current.stats?.totalUrls],
  ["404 responses", countStatus(baseline, "404"), countStatus(current, "404")],
  ["308 redirects", countStatus(baseline, "308"), countStatus(current, "308")],
  ["Titles >60 chars", countLongTitles(baseline), countLongTitles(current)],
  [
    "Critical findings",
    countSummary(baseline, "CRITICAL"),
    countSummary(current, "CRITICAL"),
  ],
  [
    "Warning findings",
    countSummary(baseline, "WARNING"),
    countSummary(current, "WARNING"),
  ],
];

for (const [label, b, c] of metrics) {
  const delta = c - b;
  const sign = delta > 0 ? "+" : "";
  console.log(`  ${label.padEnd(22)} ${b} → ${c} (${sign}${delta})`);
}

console.log("");
console.log("Summary deltas (notice-level SEO):");
for (const code of [
  "seo-title-length",
  "seo-meta-description-length",
  "seo-canonical-missing",
  "404",
  "redirects",
  "slowUrls",
]) {
  console.log(`  ${code}:`);
  console.log(`    before: ${findSummary(baseline, code) ?? "—"}`);
  console.log(`    after:  ${findSummary(current, code) ?? "—"}`);
}
