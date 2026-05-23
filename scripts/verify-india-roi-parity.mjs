#!/usr/bin/env node
/**
 * Regression check: India market profile must match legacy Taypro calculator math.
 * Run: npm run verify:roi-india
 */
const { calculateRoi } = await import("../src/lib/roi-calculator/calculate-roi.ts");
const { ROI_MARKET_PROFILES } = await import(
  "../src/lib/roi-calculator/market-profiles.ts"
);

function legacyIndia(input) {
  const {
    plantType,
    plantCapacityMW: E,
    plantCapacityKW: F,
    electricityTariff: G,
    moduleCapacityWp: H,
    automationLevel,
    installationType,
  } = input;
  const capacity = plantType === "groundMount" ? E * 1000 : F;
  const modules = Math.round(capacity / (H / 1000));
  const annualCostLabourSaved = modules * 0.5 * 20;
  const waterSavedLitres = modules * 20 * 3.5;
  const annualCostWaterSaved = waterSavedLitres * 0.12;
  const energyFactor = plantType === "groundMount" ? 0.025 : 0.113;
  const annualCostEnergyGain = capacity * energyFactor * 1500 * G;
  const automationMultiplier = automationLevel === "automatic" ? 2.0 : 0.5;
  const installationMultiplier =
    installationType === "fixedTilt"
      ? 2.0
      : installationType === "seasonalTilt"
        ? 2.0
        : 3.0;
  const baseInvestment =
    plantType === "groundMount"
      ? E * automationMultiplier * installationMultiplier
      : (F * automationMultiplier) / 130;
  const perUnitCost = Math.max(
    42000,
    Math.min(114000, 114000 - (114000 - 42000) * (baseInvestment / 400))
  );
  const totalInvestmentRequired = baseInvestment * perUnitCost;
  const annualCarbonSavings = capacity * energyFactor * 1500 * 0.496;
  return {
    annualCostLabourSaved,
    annualCostWaterSaved,
    annualCostEnergyGain,
    totalInvestmentRequired,
    waterSavedAnnually: waterSavedLitres,
    annualCarbonSavings,
  };
}

const ground = {
  plantType: "groundMount",
  installationType: "fixedTilt",
  automationLevel: "automatic",
  plantCapacityMW: 200,
  plantCapacityKW: 200,
  electricityTariff: 3,
  moduleCapacityWp: 545,
};

const rooftop = {
  plantType: "rooftop",
  installationType: "fixedTilt",
  automationLevel: "automatic",
  plantCapacityMW: 200,
  plantCapacityKW: 500,
  electricityTariff: 10,
  moduleCapacityWp: 545,
};

const cases = [
  ["200 MW ground", ground],
  ["500 kW rooftop", rooftop],
];

let failed = 0;
for (const [label, input] of cases) {
  const next = calculateRoi(input, ROI_MARKET_PROFILES.india);
  const leg = legacyIndia(input);
  for (const key of Object.keys(leg)) {
    if (next[key] !== leg[key]) {
      console.error(`FAIL ${label} ${key}: got ${next[key]}, expected ${leg[key]}`);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} mismatch(es). India ROI parity broken.`);
  process.exit(1);
}

console.log("OK — India ROI matches legacy calculator for all checked scenarios.");
