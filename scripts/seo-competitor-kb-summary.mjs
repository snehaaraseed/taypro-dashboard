#!/usr/bin/env node
/**
 * Print competitor landscape KB summary and validate JSON shape.
 * Refresh data/competitor-landscape.json manually after web research (see meta.sources).
 *
 * Usage: node scripts/seo-competitor-kb-summary.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filePath = path.join(root, "data", "competitor-landscape.json");

if (!fs.existsSync(filePath)) {
  console.error("Missing data/competitor-landscape.json");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

if (!data.meta?.lastResearched || !Array.isArray(data.competitors)) {
  console.error("Invalid competitor-landscape.json structure");
  process.exit(1);
}

console.log(`Competitor landscape KB — last researched ${data.meta.lastResearched}`);
console.log(`Scope: ${data.meta.scope}`);
console.log(`Tracked competitors: ${data.competitors.length}\n`);

for (const c of data.competitors) {
  console.log(`• ${c.name} (${c.id}) — ${c.hq ?? "HQ n/a"}`);
  if (c.website) console.log(`  ${c.website}`);
}

console.log("\nMarket roundups:");
for (const r of data.indiaMarketContext?.rankingSources ?? []) {
  const top = r.topFive?.map((t) => t.name).join(", ");
  console.log(`• ${r.source}: ${top}`);
}

console.log("\nTaypro when-to-win criteria:");
for (const w of data.tayproPositioning?.whenTayproWins ?? []) {
  console.log(`• ${w}`);
}

console.log("\nOK — wired into buildBlogKnowledgeContext via src/lib/seo/competitor-knowledge.ts");
