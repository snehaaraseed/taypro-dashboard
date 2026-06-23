#!/usr/bin/env node
/**
 * Regression check: Taypro OPEX pricing model.
 * Run: node scripts/verify-opex-pricing.mjs
 */
const { calculateOpexCost } = await import(
  "../src/lib/roi-calculator/calculate-opex-core.ts"
);
const { calculateOpexRoi } = await import(
  "../src/lib/roi-calculator/calculate-roi-core.ts"
);
const { ROI_MARKET_PROFILES } = await import(
  "../src/lib/roi-calculator/market-profiles.ts"
);

const MODULE_WP = 540;

function assertClose(actual, expected, label, tolerance = 1) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

// 5 MW fixed tilt, 5 cycles — below 10 MW flat rate 0.70, hits minimum
const small = calculateOpexCost({
  plantCapacityMW: 5,
  moduleCapacityWp: MODULE_WP,
  installationType: "fixedTilt",
  cleaningCyclesPerMonth: 5,
});
assertClose(small.ratePerModulePerCycle, 0.7, "5 MW rate");
assertClose(small.monthlyOpex, 100_000, "5 MW monthly floor");

// 50 MW fixed tilt, 10 cycles
const large = calculateOpexCost({
  plantCapacityMW: 50,
  moduleCapacityWp: MODULE_WP,
  installationType: "fixedTilt",
  cleaningCyclesPerMonth: 10,
});
assertClose(large.monthlyOpex, 480_969, "50 MW fixed 10 cycles monthly", 5);

// 50 MW single-axis tracker, 10 cycles — 1.8× fixed tilt
const tracker = calculateOpexCost({
  plantCapacityMW: 50,
  moduleCapacityWp: MODULE_WP,
  installationType: "singleAxisTracker",
  cleaningCyclesPerMonth: 10,
});
assertClose(tracker.monthlyOpex, 865_744, "50 MW tracker 10 cycles monthly", 5);

// 50 MW seasonal tilt — 1.5× fixed tilt
const seasonal = calculateOpexCost({
  plantCapacityMW: 50,
  moduleCapacityWp: MODULE_WP,
  installationType: "seasonalTilt",
  cleaningCyclesPerMonth: 10,
});
assertClose(seasonal.monthlyOpex, 721_454, "50 MW seasonal 10 cycles monthly", 5);

// Full ROI integration — no CAPEX
const roi = calculateOpexRoi(
  {
    plantType: "groundMount",
    installationType: "fixedTilt",
    automationLevel: "semiAutomatic",
    plantCapacityMW: 50,
    plantCapacityKW: 100,
    electricityTariff: 3,
    moduleCapacityWp: MODULE_WP,
    procurementModel: "opex",
    cleaningCyclesPerMonth: 10,
  },
  ROI_MARKET_PROFILES.india
);

if (roi.totalInvestmentRequired !== 0) {
  throw new Error("OPEX mode should have zero CAPEX");
}
if (!roi.opex) {
  throw new Error("OPEX details missing");
}
assertClose(roi.opex.annualOpex, large.annualOpex, "integrated annual OPEX");
assertClose(
  roi.opex.netAnnualBenefit,
  roi.totalMoneySavedAnnually - roi.opex.annualOpex,
  "net annual benefit"
);

console.log("verify-opex-pricing: OK");
