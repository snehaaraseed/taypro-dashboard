/**
 * Audit semantic coordinate pool quality (no Gemini).
 * Run: npx tsx --require ./scripts/preload-stub-server-only.cjs scripts/audit-semantic-slots.ts
 */
import {
  countTheoreticalTopicCoordinates,
  enumerateOpenTopicCoordinates,
  buildSemanticSlotKey,
} from "../src/lib/seo/semantic-coordinate-enumeration";
import { buildCoordinateKey } from "../src/lib/seo/semantic-topic-coordinates";
import {
  isTierAMoneyPageKeyword,
  renderCoordinateTopic,
} from "../src/lib/seo/topic-coordinate-renderer";
import { listSemanticDomains } from "../src/lib/seo/semantic-topic-coordinates";

type QualityFlag =
  | "duplicate_title"
  | "keyword_stuffing"
  | "how_to_how_to"
  | "unreplaced_template"
  | "title_too_short"
  | "title_too_long"
  | "generic_keyword"
  | "scale_in_keyword_and_title";

function classifyTitle(title: string, keyword: string): QualityFlag[] {
  const flags: QualityFlag[] = [];
  const t = title.toLowerCase();
  const k = keyword.toLowerCase();
  if (t.length < 40) flags.push("title_too_short");
  if (t.length > 95) flags.push("title_too_long");
  if (/how to how to/i.test(title)) flags.push("how_to_how_to");
  if (/\{keyword\}|\{geo\}/i.test(title)) flags.push("unreplaced_template");
  const kwWords = k.split(/\s+/).filter((w) => w.length > 2);
  const hits = kwWords.filter((w) => t.includes(w)).length;
  if (kwWords.length >= 4 && hits >= kwWords.length - 1) {
    flags.push("keyword_stuffing");
  }
  if (k.split(" ").length <= 4 && /50 100mw|utility scale/i.test(k)) {
    flags.push("generic_keyword");
  }
  if (/50 100mw|10 50mw|100mw plus/i.test(k) && /50mw|100mw/i.test(title)) {
    flags.push("scale_in_keyword_and_title");
  }
  return flags;
}

const all = enumerateOpenTopicCoordinates({ limit: 50_000, interleaveDomains: false });
const counts = countTheoreticalTopicCoordinates();

const titleCounts = new Map<string, number>();
const keywordCounts = new Map<string, number>();
const flagCounts: Record<QualityFlag, number> = {
  duplicate_title: 0,
  keyword_stuffing: 0,
  how_to_how_to: 0,
  unreplaced_template: 0,
  title_too_short: 0,
  title_too_long: 0,
  generic_keyword: 0,
  scale_in_keyword_and_title: 0,
};

const flaggedSamples: Record<string, string[]> = {};
const domainCounts: Record<string, number> = {};
const intentCounts: Record<string, number> = {};
const genuine: string[] = [];
const scrap: string[] = [];

for (const c of all) {
  const r = renderCoordinateTopic(c);
  if (!r) continue;
  domainCounts[c.domainId] = (domainCounts[c.domainId] ?? 0) + 1;
  intentCounts[c.intentFamily] = (intentCounts[c.intentFamily] ?? 0) + 1;
  titleCounts.set(r.title.toLowerCase(), (titleCounts.get(r.title.toLowerCase()) ?? 0) + 1);
  keywordCounts.set(r.keyword.toLowerCase(), (keywordCounts.get(r.keyword.toLowerCase()) ?? 0) + 1);

  const flags = classifyTitle(r.title, r.keyword);
  for (const f of flags) {
    flagCounts[f]++;
    if (!flaggedSamples[f]) flaggedSamples[f] = [];
    if (flaggedSamples[f]!.length < 3) {
      flaggedSamples[f]!.push(r.title);
    }
  }

  const isScrap =
    flags.includes("unreplaced_template") ||
    flags.includes("how_to_how_to") ||
    (flags.includes("keyword_stuffing") && flags.includes("scale_in_keyword_and_title"));

  if (isScrap && scrap.length < 12) scrap.push(r.title);
  else if (
    !flags.includes("keyword_stuffing") &&
    r.title.length >= 45 &&
    r.title.length <= 90 &&
    genuine.length < 12
  ) {
    genuine.push(`[${c.intentFamily}] ${r.title}`);
  }
}

const dupTitles = [...titleCounts.entries()]
  .filter(([, n]) => n > 1)
  .sort((a, b) => b[1] - a[1]);

const uniqueTitles = titleCounts.size;
const uniqueKeywords = keywordCounts.size;
const dupRate = ((all.length - uniqueTitles) / all.length) * 100;

// Intent/search value heuristic
let highValue = 0;
let mediumValue = 0;
let lowValue = 0;
for (const c of all) {
  const r = renderCoordinateTopic(c)!;
  const flags = classifyTitle(r.title, r.keyword);
  const hasIntent =
    /how to|vs |tco|roi|checklist|frequency|pr |performance ratio|soiling|opex|rfp|warranty|scada|tracker|robot|monsoon|rajasthan|gujarat/i.test(
      r.title
    );
  if (flags.includes("keyword_stuffing") || !hasIntent) lowValue++;
  else if (flags.includes("scale_in_keyword_and_title") || r.title.length > 85)
    mediumValue++;
  else highValue++;
}

console.log("\n=== SEMANTIC SLOT AUDIT ===\n");
console.log("Pool size:", counts);
console.log("Enumerated open:", all.length);
console.log("Unique titles:", uniqueTitles, `(${dupRate.toFixed(1)}% would share exact title)`);
console.log("Unique primary keywords:", uniqueKeywords);
console.log("\nIntent mix:", intentCounts);
console.log("\nQuality flags (slots may have multiple):", flagCounts);
console.log("\nValue tier (heuristic):");
console.log(`  High (clear search intent, clean title): ${highValue} (${((highValue / all.length) * 100).toFixed(1)}%)`);
console.log(`  Medium (usable but awkward): ${mediumValue} (${((mediumValue / all.length) * 100).toFixed(1)}%)`);
console.log(`  Low (thin/stuffed/generic): ${lowValue} (${((lowValue / all.length) * 100).toFixed(1)}%)`);
console.log("\nDuplicate title groups:", dupTitles.length);
if (dupTitles[0]) {
  console.log("  Top dupe:", dupTitles[0][1], "×", dupTitles[0][0].slice(0, 80));
}
console.log("\n--- GENUINE samples (good titles) ---");
genuine.forEach((s) => console.log(" ", s));
console.log("\n--- SCRAP / awkward samples ---");
scrap.forEach((s) => console.log(" ", s.slice(0, 100)));
console.log("\n--- Flag samples ---");
for (const [k, v] of Object.entries(flaggedSamples)) {
  console.log(` ${k}:`, v[0]?.slice(0, 90));
}
