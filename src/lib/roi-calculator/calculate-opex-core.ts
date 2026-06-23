import type { InstallationType } from "@/lib/roi-calculator/roi-types";

export const OPEX_RATE_MAX_INR = 0.7;
export const OPEX_RATE_MIN_INR = 0.45;
export const OPEX_MIN_MONTHLY_INR = 100_000;
export const OPEX_CYCLES_PER_MONTH_MIN = 3;
export const OPEX_CYCLES_PER_MONTH_MAX = 10;
export const OPEX_CAPACITY_THRESHOLD_MW = 10;
export const OPEX_MODULE_SCALE_MW = 100;

export interface OpexCostInput {
  plantCapacityMW: number;
  moduleCapacityWp: number;
  installationType: InstallationType;
  cleaningCyclesPerMonth: number;
}

export interface OpexCostResult {
  moduleCount: number;
  ratePerModulePerCycle: number;
  installationMultiplier: number;
  rawMonthlyOpex: number;
  monthlyOpex: number;
  annualOpex: number;
  minimumApplied: boolean;
  cleaningCyclesPerMonth: number;
}

export function moduleCountFromCapacity(
  capacityKw: number,
  moduleCapacityWp: number
): number {
  return Math.round(capacityKw / (moduleCapacityWp / 1000));
}

export function getOpexInstallationMultiplier(
  installationType: InstallationType
): number {
  if (installationType === "fixedTilt") return 1;
  if (installationType === "seasonalTilt") return 1.5;
  return 1.8;
}

function modulesAtMw(mw: number, moduleCapacityWp: number): number {
  return moduleCountFromCapacity(mw * 1000, moduleCapacityWp);
}

export function calculateOpexRatePerModule(params: {
  capacityMw: number;
  modules: number;
  moduleCapacityWp: number;
  cleaningCyclesPerMonth: number;
}): number {
  const { capacityMw, modules, moduleCapacityWp, cleaningCyclesPerMonth } =
    params;

  if (capacityMw < OPEX_CAPACITY_THRESHOLD_MW) {
    return OPEX_RATE_MAX_INR;
  }

  const modulesAt10Mw = modulesAtMw(
    OPEX_CAPACITY_THRESHOLD_MW,
    moduleCapacityWp
  );
  const modulesAt100Mw = modulesAtMw(OPEX_MODULE_SCALE_MW, moduleCapacityWp);
  const moduleSpan = modulesAt100Mw - modulesAt10Mw;

  const cycleFactor =
    (cleaningCyclesPerMonth - OPEX_CYCLES_PER_MONTH_MIN) /
    (OPEX_CYCLES_PER_MONTH_MAX - OPEX_CYCLES_PER_MONTH_MIN);
  const moduleFactor =
    moduleSpan > 0
      ? Math.min(1, Math.max(0, (modules - modulesAt10Mw) / moduleSpan))
      : 0;
  const combinedFactor = 0.5 * cycleFactor + 0.5 * moduleFactor;

  return (
    OPEX_RATE_MAX_INR -
    (OPEX_RATE_MAX_INR - OPEX_RATE_MIN_INR) * combinedFactor
  );
}

export function calculateOpexCost(input: OpexCostInput): OpexCostResult {
  const cleaningCyclesPerMonth = Math.min(
    OPEX_CYCLES_PER_MONTH_MAX,
    Math.max(OPEX_CYCLES_PER_MONTH_MIN, input.cleaningCyclesPerMonth)
  );
  const capacityKw = input.plantCapacityMW * 1000;
  const modules = moduleCountFromCapacity(capacityKw, input.moduleCapacityWp);
  const ratePerModulePerCycle = calculateOpexRatePerModule({
    capacityMw: input.plantCapacityMW,
    modules,
    moduleCapacityWp: input.moduleCapacityWp,
    cleaningCyclesPerMonth,
  });
  const installationMultiplier = getOpexInstallationMultiplier(
    input.installationType
  );

  const rawMonthlyOpex =
    modules *
    cleaningCyclesPerMonth *
    ratePerModulePerCycle *
    installationMultiplier;
  const monthlyOpex = Math.max(rawMonthlyOpex, OPEX_MIN_MONTHLY_INR);

  return {
    moduleCount: modules,
    ratePerModulePerCycle,
    installationMultiplier,
    rawMonthlyOpex,
    monthlyOpex,
    annualOpex: monthlyOpex * 12,
    minimumApplied: rawMonthlyOpex < OPEX_MIN_MONTHLY_INR,
    cleaningCyclesPerMonth,
  };
}
