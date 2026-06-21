/**
 * Unit checks for keyword intent helpers (no server-only imports).
 * Run: npm run seo:test-keyword-intent
 */
import { parseSearchIntentFamily } from "../src/lib/seo/keyword-intent-taxonomy";
import { inferSubAngle, normalizeSubAngle } from "../src/lib/seo/keyword-sub-angle";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`✓ ${name}`);
  } else {
    failed++;
    console.error(`✗ ${name}`);
  }
}

assert(
  "parses valid intent family",
  parseSearchIntentFamily("financial_roi") === "financial_roi"
);

assert(
  "rejects invalid intent id",
  parseSearchIntentFamily("buyer_guide") === null
);

assert(
  "normalize sub-angle slug",
  normalizeSubAngle("vs Fixed-Tilt Systems") === "vs_fixed_tilt_systems"
);

assert(
  "infers comparison sub-angle from title",
  inferSubAngle({
    title: "Tracker Robot vs Fixed-Tilt Systems in India",
    intentFamily: "comparison_alternative",
  }) === "vs_fixed_tilt_systems_in_india"
);

assert(
  "uses angle id when present",
  inferSubAngle({
    title: "Any title",
    intentFamily: "technical_howto",
    angleId: "freq-tracker",
  }) === "freq_tracker"
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
