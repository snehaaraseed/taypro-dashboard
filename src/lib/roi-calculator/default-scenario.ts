import {
  calculateRoi,
  type RoiCalculationInput,
  type RoiCalculationResult,
} from "@/lib/roi-calculator/calculate-roi";
import {
  resolveRoiMarket,
  type RoiMarketProfile,
} from "@/lib/roi-calculator/market-profiles";

export const DEFAULT_MODULE_CAPACITY_WP = 545;
export const DEFAULT_INTERACTIVE_CAPACITY_MW = 200;
export const EXAMPLE_SCENARIO_CAPACITIES_MW = [50, 200] as const;

export type ExampleScenarioCapacityMw =
  (typeof EXAMPLE_SCENARIO_CAPACITIES_MW)[number];

export type ExampleScenarioResult = {
  capacityMw: ExampleScenarioCapacityMw;
  input: RoiCalculationInput;
  result: RoiCalculationResult;
};

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
    plantType: input.plantType,
    installationType: input.installationType,
    automationLevel: input.automationLevel,
    plantCapacityMW: input.plantCapacityMW,
    plantCapacityKW: input.plantCapacityKW,
    electricityTariff: input.electricityTariff,
    moduleCapacity: input.moduleCapacityWp,
  };
}

export function computeExampleScenarios(
  locale: string
): { market: RoiMarketProfile; scenarios: ExampleScenarioResult[] } {
  const market = resolveRoiMarket(locale, null);

  const scenarios = EXAMPLE_SCENARIO_CAPACITIES_MW.map((capacityMw) => {
    const input = buildExampleRoiInput(capacityMw, market);
    return {
      capacityMw,
      input,
      result: calculateRoi(input, market),
    };
  });

  return { market, scenarios };
}
