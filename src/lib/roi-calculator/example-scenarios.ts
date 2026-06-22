import { calculateRoi } from "@/lib/roi-calculator/calculate-roi-core";
import {
  buildExampleRoiInput,
  EXAMPLE_SCENARIO_CAPACITIES_MW,
  type ExampleScenarioCapacityMw,
} from "@/lib/roi-calculator/default-scenario";
import { resolveRoiMarket, type RoiMarketProfile } from "@/lib/roi-calculator/market-profiles";
import type { RoiCalculationInput, RoiCalculationResult } from "@/lib/roi-calculator/roi-types";

export type ExampleScenarioResult = {
  capacityMw: ExampleScenarioCapacityMw;
  input: RoiCalculationInput;
  result: RoiCalculationResult;
};

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
