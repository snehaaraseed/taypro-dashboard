#!/usr/bin/env node
/**
 * Prints fleet ESG impact from shared assumptions (sanity check for marketing stats).
 * Run: node scripts/verify-fleet-esg.mjs
 */
import { calculateFleetEsgImpact } from "../src/lib/esg/calculate-fleet-esg-impact.ts";
import {
  buildTayproMarketingImpactStats,
  formatCompactImpactValue,
} from "../src/lib/esg/format-fleet-marketing-impact.ts";
import { FLEET_ESG_ASSUMPTIONS } from "../src/lib/esg/fleet-impact-assumptions.ts";

const impact = calculateFleetEsgImpact();
const stats = buildTayproMarketingImpactStats();

console.log("Fleet ESG assumptions:", FLEET_ESG_ASSUMPTIONS);
console.log("\nCalculated impact (5 GW fleet):");
console.log(`  Modules in fleet:        ${impact.totalModules.toLocaleString("en-IN")}`);
console.log(
  `  Water saved / year:      ${impact.waterSavedLitresAnnually.toLocaleString("en-IN")} L (${formatCompactImpactValue(impact.waterSavedLitresAnnually)})`
);
console.log(
  `  Extra generation / year: ${impact.additionalGenerationKwhAnnually.toLocaleString("en-IN")} kWh (${Math.round(impact.additionalGenerationGwhAnnually)} GWh)`
);
console.log(
  `  CO₂ avoided / year:      ${Math.round(impact.co2AvoidedMetricTonsAnnually).toLocaleString("en-IN")} t (${formatCompactImpactValue(impact.co2AvoidedMetricTonsAnnually)})`
);
console.log(
  `  Olympic pools equivalent: ~${Math.round(impact.olympicPoolsOfWaterEquivalent)}`
);
console.log("\nMarketing stat tiles:");
console.log(`  Water:  ${stats.waterSavedAnnually.value}`);
console.log(`  Energy: ${stats.extraCleanEnergyAnnually.value}`);
console.log(`  CO₂:    ${stats.co2ReducedAnnually.value}`);
