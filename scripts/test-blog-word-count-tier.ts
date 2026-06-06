/**
 * Unit-style checks for blog word-count tier resolution (no Gemini).
 * Run: npm run seo:test-word-count-tier
 */
import {
  resolveBlogWordCountPolicy,
  resolveBlogWordCountTier,
} from "../src/lib/seo/blog-word-count-tier";
import {
  ANGLE_ARCHETYPE_BY_ID,
  ANGLE_CONTRACT_BY_ID,
  getWordCountTierForAngle,
} from "../src/lib/seo/angle-contract-data";

type Case = {
  name: string;
  input: Parameters<typeof resolveBlogWordCountTier>[0];
  expected: ReturnType<typeof resolveBlogWordCountTier>;
};

const cases: Case[] = [
  {
    name: "ledger comparison angle",
    input: { angleId: "brush-vs-robot", primaryKeyword: "solar panel cleaning brush" },
    expected: "pillar",
  },
  {
    name: "ledger frequency angle",
    input: { angleId: "freq-50mw", primaryKeyword: "solar panel cleaning frequency" },
    expected: "narrow",
  },
  {
    name: "unmapped cost angle via archetype",
    input: { angleId: "cost-per-mw", primaryKeyword: "solar panel cleaning cost" },
    expected: "pillar",
  },
  {
    name: "vendor shortlist angle",
    input: { angleId: "mfg-shortlist", primaryKeyword: "solar panel manufacturers" },
    expected: "pillar",
  },
  {
    name: "checklist playbook angle",
    input: { angleId: "waterless-drought", primaryKeyword: "waterless cleaning" },
    expected: "narrow",
  },
  {
    name: "comparison intent without angle",
    input: { searchIntent: "Commercial comparison", primaryKeyword: "solar cleaning brush" },
    expected: "pillar",
  },
  {
    name: "high volume + high competition",
    input: { volumeBucket: 5000, competitionIndex: 100, primaryKeyword: "solar panel washing" },
    expected: "pillar",
  },
  {
    name: "high competition alone (mid volume) stays standard",
    input: { volumeBucket: 200, competitionIndex: 100, primaryKeyword: "misc keyword" },
    expected: "standard",
  },
  {
    name: "high competition with tier B volume",
    input: { volumeBucket: 500, competitionIndex: 97, primaryKeyword: "solar panel cleaning kit" },
    expected: "pillar",
  },
  {
    name: "tier C long-tail volume bucket",
    input: { volumeBucket: 50, competitionIndex: 95, primaryKeyword: "robot manufacturers in india" },
    expected: "narrow",
  },
  {
    name: "low competition soiling keyword",
    input: { volumeBucket: 500, competitionIndex: 1, primaryKeyword: "dust on solar panels" },
    expected: "narrow",
  },
  {
    name: "generic keyword fallback",
    input: { primaryKeyword: "utility solar om planning" },
    expected: "standard",
  },
];

let failed = 0;

for (const test of cases) {
  const actual = resolveBlogWordCountTier(test.input);
  if (actual !== test.expected) {
    console.error(`FAIL ${test.name}: expected ${test.expected}, got ${actual}`);
    failed += 1;
  } else {
    console.log(`OK ${test.name} → ${actual}`);
  }
}

const contractIds = Object.keys(ANGLE_CONTRACT_BY_ID).sort();
const archetypeIds = Object.keys(ANGLE_ARCHETYPE_BY_ID).sort();
if (contractIds.join("|") !== archetypeIds.join("|")) {
  console.error("FAIL angle sync: ANGLE_ARCHETYPE_BY_ID keys do not match ANGLE_CONTRACT_BY_ID");
  const missing = contractIds.filter((id) => !(id in ANGLE_ARCHETYPE_BY_ID));
  const extra = archetypeIds.filter((id) => !(id in ANGLE_CONTRACT_BY_ID));
  if (missing.length) console.error("  missing in ANGLE_ARCHETYPE_BY_ID:", missing.join(", "));
  if (extra.length) console.error("  extra in ANGLE_ARCHETYPE_BY_ID:", extra.join(", "));
  failed += 1;
} else {
  console.log(`OK angle sync (${contractIds.length} angle ids)`);
}

for (const id of contractIds) {
  const contractArchetype = ANGLE_CONTRACT_BY_ID[id].archetype;
  const mappedArchetype = ANGLE_ARCHETYPE_BY_ID[id];
  if (contractArchetype !== mappedArchetype) {
    console.error(
      `FAIL angle sync ${id}: contract=${contractArchetype} mapped=${mappedArchetype}`
    );
    failed += 1;
  }
}

const policy = resolveBlogWordCountPolicy({ angleId: "freq-tracker" });
if (policy.minWords !== 900 || policy.tier !== "narrow") {
  console.error(`FAIL narrow policy: ${JSON.stringify(policy)}`);
  failed += 1;
} else {
  console.log("OK narrow policy floors");
}

const sampleAngles = [
  "cost-per-mw",
  "mfg-om-bridge",
  "default-compare",
  "default-om",
  "freq-dust-belt",
] as const;

for (const angleId of sampleAngles) {
  const tier = getWordCountTierForAngle(angleId);
  console.log(`angle ${angleId} → ${tier}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log(`\nAll ${cases.length + 2} tier checks passed.`);
