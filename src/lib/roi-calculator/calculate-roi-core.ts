import {
  GROUND_MOUNT_SOILING_RECOVERY_FACTOR,
  type RoiMarketProfile,
} from "@/lib/roi-calculator/market-profiles";
import type {
  InstallationType,
  RoiCalculationInput,
  RoiCalculationResult,
  RoiCalculatorPublicResult,
  RoiProjectionSeries,
  RoiProjectionYearPoint,
} from "@/lib/roi-calculator/roi-types";

const HORIZON_YEARS = 20;
const SAVINGS_RETENTION_20Y = 0.9;
const AMC_WARRANTY_YEARS = 1;
const AMC_ESCALATION = 0.02;
const INDIA_ROBOT_AMC_RATE = 6000;
const INDIA_INVESTMENT_UNIT_MIN = 42_000;

function moduleCount(capacityKw: number, moduleCapacityWp: number): number {
  return Math.round(capacityKw / (moduleCapacityWp / 1000));
}

function getInstallationMultiplier(installationType: InstallationType): number {
  if (installationType === "fixedTilt") return 1.3;
  if (installationType === "seasonalTilt") return 1.5;
  return 2.5;
}

function plantCapacityMwForAmc(input: RoiCalculationInput): number {
  return input.plantType === "groundMount"
    ? input.plantCapacityMW
    : input.plantCapacityKW / 1000;
}

function computeRobotAmcSchedule(options: {
  capacityMw: number;
  installationMultiplier: number;
  amcRate: number;
  horizonYears?: number;
}): { annualAmcYear2: number; totalAmc20Years: number; amcByYear: number[] } {
  const horizonYears = options.horizonYears ?? HORIZON_YEARS;
  const annualAmcYear2 =
    options.amcRate * options.installationMultiplier * options.capacityMw;
  const amcByYear: number[] = [];

  for (let year = 1; year <= horizonYears; year += 1) {
    if (year <= AMC_WARRANTY_YEARS) {
      amcByYear.push(0);
      continue;
    }
    const yearsAfterWarranty = year - AMC_WARRANTY_YEARS - 1;
    amcByYear.push(annualAmcYear2 * (1 + AMC_ESCALATION) ** yearsAfterWarranty);
  }

  const totalAmc20Years = amcByYear.reduce((sum, value) => sum + value, 0);
  return { annualAmcYear2, totalAmc20Years, amcByYear };
}

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
      ? GROUND_MOUNT_SOILING_RECOVERY_FACTOR
      : e.soilingRecoveryFactorRooftop;

  const annualCostEnergyGain =
    capacityKw * energyFactor * e.specificYieldKwhPerKw * electricityTariff;

  const totalMoneySavedAnnually =
    annualCostLabourSaved + annualCostWaterSaved + annualCostEnergyGain;

  const automationMultiplier = automationLevel === "automatic" ? 2.0 : 0.5;
  const installationMultiplier = getInstallationMultiplier(installationType);

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

  const amcRate = Math.round(
    INDIA_ROBOT_AMC_RATE * (investmentUnitMin / INDIA_INVESTMENT_UNIT_MIN)
  );
  const { annualAmcYear2, totalAmc20Years, amcByYear } = computeRobotAmcSchedule({
    capacityMw: plantCapacityMwForAmc(input),
    installationMultiplier,
    amcRate,
  });

  const totalGrossSavings20 =
    totalMoneySavedAnnually * HORIZON_YEARS * SAVINGS_RETENTION_20Y;
  const net20YearSavings =
    totalGrossSavings20 - totalInvestmentRequired - totalAmc20Years;

  const roiTimeline =
    totalMoneySavedAnnually > 0
      ? totalInvestmentRequired / totalMoneySavedAnnually
      : 0;

  const annualisedROI =
    totalInvestmentRequired > 0
      ? (Math.pow(
          (totalMoneySavedAnnually * HORIZON_YEARS) / totalInvestmentRequired,
          1 / HORIZON_YEARS
        ) -
          1) *
        100
      : 0;

  const roi20Years =
    totalInvestmentRequired > 0
      ? (net20YearSavings / totalInvestmentRequired) * 100
      : 0;

  const annualCarbonSavings =
    capacityKw * energyFactor * e.specificYieldKwhPerKw * e.gridEmissionKgPerKwh;

  return {
    annualCostLabourSaved,
    annualCostWaterSaved,
    annualCostEnergyGain,
    totalMoneySavedAnnually,
    totalInvestmentRequired,
    annualAmcYear2,
    totalAmc20Years,
    amcByYear,
    net20YearSavings,
    roiTimeline,
    annualisedROI,
    roi20Years,
    waterSavedAnnually,
    annualCarbonSavings,
  };
}

export function buildRoiProjectionSeries(
  result: RoiCalculationResult
): RoiProjectionSeries {
  const years: RoiProjectionYearPoint[] = [];
  let cumulativeSavings = 0;
  let cumulativeCost = result.totalInvestmentRequired;
  let cumulativeWaterLiters = 0;
  let cumulativeCarbonKg = 0;
  let paybackYear: number | null = null;

  years.push({
    year: 0,
    cumulativeSavings: 0,
    cumulativeCost: result.totalInvestmentRequired,
    cumulativeWaterLiters: 0,
    cumulativeCarbonKg: 0,
  });

  for (let index = 0; index < HORIZON_YEARS; index += 1) {
    const prevSavings = cumulativeSavings;
    const prevCost = cumulativeCost;

    cumulativeSavings += result.totalMoneySavedAnnually;
    cumulativeCost += result.amcByYear[index] ?? 0;
    cumulativeWaterLiters += result.waterSavedAnnually;
    cumulativeCarbonKg += result.annualCarbonSavings;

    const year = index + 1;

    if (
      paybackYear === null &&
      cumulativeSavings >= cumulativeCost &&
      cumulativeSavings > prevSavings
    ) {
      const savingsStep = cumulativeSavings - prevSavings;
      const gapBefore = prevCost - prevSavings;
      const fraction =
        savingsStep > 0 ? Math.min(1, Math.max(0, gapBefore / savingsStep)) : 1;
      paybackYear = year - 1 + fraction;
    }

    years.push({
      year,
      cumulativeSavings,
      cumulativeCost,
      cumulativeWaterLiters,
      cumulativeCarbonKg,
    });
  }

  return { years, paybackYear };
}

export function toPublicRoiResult(
  result: RoiCalculationResult
): RoiCalculatorPublicResult {
  const { amcByYear: _amcByYear, annualAmcYear2: _annualAmcYear2, ...publicResult } =
    result;
  return publicResult;
}
