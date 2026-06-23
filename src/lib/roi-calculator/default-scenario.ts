import type { RoiCalculationInput, ProcurementModel } from "@/lib/roi-calculator/roi-types";
import type { RoiMarketProfile } from "@/lib/roi-calculator/market-profiles";

export const DEFAULT_MODULE_CAPACITY_WP = 545;
export const DEFAULT_INTERACTIVE_CAPACITY_MW = 200;
export const EXAMPLE_SCENARIO_CAPACITIES_MW = [50, 200] as const;

export type ExampleScenarioCapacityMw =
  (typeof EXAMPLE_SCENARIO_CAPACITIES_MW)[number];

export function buildExampleRoiInput(
  capacityMw: number,
  market: RoiMarketProfile
): RoiCalculationInput {
  return {
    plantType: "groundMount",
    installationType: "fixedTilt",
    automationLevel: "automatic",
    plantCapacityMW: capacityMw,
    plantCapacityKW: 200,
    electricityTariff: market.defaultTariffGround,
    moduleCapacityWp: DEFAULT_MODULE_CAPACITY_WP,
  };
}

export function buildDefaultInteractiveFormData(market: RoiMarketProfile) {
  const input = buildExampleRoiInput(DEFAULT_INTERACTIVE_CAPACITY_MW, market);
  return {
    plantName: "",
    plantType: input.plantType,
    installationType: input.installationType,
    automationLevel: input.automationLevel,
    plantCapacityMW: input.plantCapacityMW,
    plantCapacityKW: input.plantCapacityKW,
    electricityTariff: input.electricityTariff,
    moduleCapacity: input.moduleCapacityWp,
    procurementModel: "capex" as ProcurementModel,
    cleaningCyclesPerMonth: 5,
  };
}
