import type { RoiMarketProfile } from "@/lib/roi-calculator/market-profiles";

export type PlantType = "groundMount" | "rooftop";
export type InstallationType = "fixedTilt" | "seasonalTilt" | "singleAxisTracker";
export type AutomationLevel = "automatic" | "semiAutomatic";

export interface RoiCalculationInput {
  plantType: PlantType;
  installationType: InstallationType;
  automationLevel: AutomationLevel;
  plantCapacityMW: number;
  plantCapacityKW: number;
  /** Electricity tariff in the market's local currency (per kWh). */
  electricityTariff: number;
  moduleCapacityWp: number;
}

export interface RoiCalculationResult {
  annualCostLabourSaved: number;
  annualCostWaterSaved: number;
  annualCostEnergyGain: number;
  totalMoneySavedAnnually: number;
  totalInvestmentRequired: number;
  roiTimeline: number;
  annualisedROI: number;
  roi20Years: number;
  waterSavedAnnually: number;
  annualCarbonSavings: number;
}

function moduleCount(capacityKw: number, moduleCapacityWp: number): number {
  return Math.round(capacityKw / (moduleCapacityWp / 1000));
}

/**
 * Directional ROI model, all amounts in the market profile's local currency.
 * Structure matches the legacy India Taypro spreadsheet assumptions.
 */
export function calculateRoi(
  input: RoiCalculationInput,
  market: RoiMarketProfile
): RoiCalculationResult {
  const {
    plantType,
    plantCapacityMW,
    plantCapacityKW,
    electricityTariff,
    moduleCapacityWp,
    automationLevel,
    installationType,
  } = input;

  const e = market.economics;
  const capacityKw =
    plantType === "groundMount" ? plantCapacityMW * 1000 : plantCapacityKW;
  const modules = moduleCount(capacityKw, moduleCapacityWp);

  const annualCostLabourSaved =
    modules * e.labourPerModulePerCycle * e.cleaningCyclesPerYear;

  const waterSavedAnnually =
    modules * e.cleaningCyclesPerYear * e.litresPerModulePerCycle;
  const annualCostWaterSaved = waterSavedAnnually * e.waterCostPerLitre;

  const energyFactor =
    plantType === "groundMount"
      ? e.soilingRecoveryFactorGround
      : e.soilingRecoveryFactorRooftop;

  const annualCostEnergyGain =
    capacityKw * energyFactor * e.specificYieldKwhPerKw * electricityTariff;

  const totalMoneySavedAnnually =
    annualCostLabourSaved + annualCostWaterSaved + annualCostEnergyGain;

  const automationMultiplier = automationLevel === "automatic" ? 2.0 : 0.5;
  const installationMultiplier =
    installationType === "fixedTilt"
      ? 2.0
      : installationType === "seasonalTilt"
        ? 2.0
        : 3.0;

  const baseInvestment =
    plantType === "groundMount"
      ? plantCapacityMW * automationMultiplier * installationMultiplier
      : (plantCapacityKW * automationMultiplier) / 130;

  const { investmentUnitMin, investmentUnitMax, investmentScaleCap } = e;
  const perUnitCost = Math.max(
    investmentUnitMin,
    Math.min(
      investmentUnitMax,
      investmentUnitMax -
        (investmentUnitMax - investmentUnitMin) *
          (baseInvestment / investmentScaleCap)
    )
  );
  const totalInvestmentRequired = baseInvestment * perUnitCost;

  const roiTimeline =
    totalMoneySavedAnnually > 0
      ? totalInvestmentRequired / totalMoneySavedAnnually
      : 0;

  const annualisedROI =
    totalInvestmentRequired > 0
      ? (Math.pow(
          (totalMoneySavedAnnually * 20) / totalInvestmentRequired,
          1 / 20
        ) -
          1) *
        100
      : 0;

  const roi20Years =
    totalInvestmentRequired > 0
      ? ((totalMoneySavedAnnually * 20 * 0.9 - totalInvestmentRequired) /
          totalInvestmentRequired) *
        100
      : 0;

  const annualCarbonSavings =
    capacityKw * energyFactor * e.specificYieldKwhPerKw * e.gridEmissionKgPerKwh;

  return {
    annualCostLabourSaved,
    annualCostWaterSaved,
    annualCostEnergyGain,
    totalMoneySavedAnnually,
    totalInvestmentRequired,
    roiTimeline,
    annualisedROI,
    roi20Years,
    waterSavedAnnually,
    annualCarbonSavings,
  };
}
