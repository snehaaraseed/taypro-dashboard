/**
 * Fleet-level ESG assumptions for Taypro marketing impact figures (5+ GW India utility).
 *
 * Sources / rationale:
 * - ~2,000–3,000 modules per MW on typical Indian utility plants (midpoint 2,500).
 * - ~20 wet-cleaning passes per year is common for manual/traditional washing.
 * - ~3–4 L water per module per wet pass (midpoint 3.5 L).
 * - ~2–3% extra annual generation vs wet baselines from better, repeatable dry cleaning.
 * - 1,500 kWh/kW/year P50 specific yield; 0.496 kg CO₂/kWh India grid factor (directional).
 */
export const FLEET_ESG_ASSUMPTIONS = {
  /** Installed / supported robot fleet capacity (GW). */
  fleetCapacityGw: 5,
  /** Typical utility-scale modules per MW in India (2,000–3,000 range). */
  modulesPerMw: 2500,
  /** Traditional wet-wash cycles replaced per year. */
  wetCleaningCyclesPerYear: 20,
  /** Litres of water per module per wet-cleaning cycle (3–4 L). */
  litresPerModulePerWetCycle: 3.5,
  /** Extra annual energy vs wet cleaning (2–3% generation gain; midpoint 2.5%). */
  generationGainVsWetCleaning: 0.025,
  /** P50 specific yield (kWh per kW DC per year) — India utility-scale. */
  specificYieldKwhPerKw: 1500,
  /** Grid emission factor (kg CO₂ per kWh) — India indicative / CEA-class. */
  gridEmissionKgPerKwh: 0.496,
  /** Litres in a standard Olympic swimming pool (50 m × 25 m × 2 m). */
  olympicPoolLitres: 2_500_000,
} as const;

export type FleetEsgAssumptions = typeof FLEET_ESG_ASSUMPTIONS;
