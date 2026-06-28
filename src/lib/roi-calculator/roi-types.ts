export type PlantType = "groundMount" | "rooftop";
export type InstallationType = "fixedTilt" | "seasonalTilt" | "singleAxisTracker";
export type AutomationLevel = "automatic" | "semiAutomatic";
export type ProcurementModel = "capex" | "opex";

export interface RoiCalculationInput {
  plantType: PlantType;
  installationType: InstallationType;
  automationLevel: AutomationLevel;
  plantCapacityMW: number;
  plantCapacityKW: number;
  /** Electricity tariff in the market's local currency (per kWh). */
  electricityTariff: number;
  moduleCapacityWp: number;
  procurementModel?: ProcurementModel;
  /** OPEX: dry cleaning cycles per month (3–10). Ground-mount only. */
  cleaningCyclesPerMonth?: number;
}

export interface RoiOpexDetails {
  monthlyOpex: number;
  annualOpex: number;
  ratePerModulePerCycle: number;
  moduleCount: number;
  cleaningCyclesPerMonth: number;
  minimumApplied: boolean;
  netAnnualBenefit: number;
  installationMultiplier: number;
}

export interface RoiCalculationResult {
  annualCostLabourSaved: number;
  annualCostWaterSaved: number;
  annualCostEnergyGain: number;
  totalMoneySavedAnnually: number;
  totalInvestmentRequired: number;
  annualAmcYear2: number;
  totalAmc20Years: number;
  amcByYear: number[];
  net20YearSavings: number;
  roiTimeline: number;
  annualisedROI: number;
  roi20Years: number;
  waterSavedAnnually: number;
  annualCarbonSavings: number;
  procurementModel: ProcurementModel;
  opex?: RoiOpexDetails;
}

/** Client-safe subset, year-by-year AMC schedule stays server-side. */
export type RoiCalculatorPublicResult = Omit<
  RoiCalculationResult,
  "amcByYear" | "annualAmcYear2"
>;

export interface RoiProjectionYearPoint {
  year: number;
  cumulativeSavings: number;
  cumulativeCost: number;
  cumulativeWaterLiters: number;
  cumulativeCarbonKg: number;
}

export interface RoiProjectionSeries {
  years: RoiProjectionYearPoint[];
  /** Calendar year when cumulative savings cross cumulative cost (fractional). */
  paybackYear: number | null;
}

export interface RoiCalculateApiResponse {
  results: RoiCalculatorPublicResult;
  projection: RoiProjectionSeries;
  procurementModel: ProcurementModel;
}
