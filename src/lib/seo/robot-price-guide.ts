import { calculateRoi } from "@/lib/roi-calculator/calculate-roi";
import { ROI_MARKET_PROFILES } from "@/lib/roi-calculator/market-profiles";

export const PRICE_GUIDE_PATH = "/solar-panel-cleaning-robot-price-india";

export type IndicativeCapexTier = {
  /** Plant capacity in MW */
  mw: number;
  /** Directional CAPEX in INR (automatic, fixed-tilt, ground-mount) */
  investmentInr: number;
  /** Approximate payback in years */
  paybackYears: number;
  /** Total annual savings in INR */
  annualSavingsInr: number;
  /** Approximate module count at 540 Wp */
  moduleCount: number;
  /** Investment divided by module count (directional ₹/module) */
  investmentPerModuleInr: number;
};

const INDIA = ROI_MARKET_PROFILES.india;
const DEFAULT_MODULE_WP = 540;
const REPRESENTATIVE_MW_TIERS = [10, 50, 100] as const;

function moduleCount(capacityKw: number, moduleCapacityWp: number): number {
  return Math.round(capacityKw / (moduleCapacityWp / 1000));
}

/** Indicative CAPEX bands using the same ROI model as the public calculator. */
export function getIndicativeCapexBands(): IndicativeCapexTier[] {
  return REPRESENTATIVE_MW_TIERS.map((mw) => {
    const result = calculateRoi(
      {
        plantType: "groundMount",
        installationType: "fixedTilt",
        automationLevel: "automatic",
        plantCapacityMW: mw,
        plantCapacityKW: 100,
        electricityTariff: INDIA.defaultTariffGround,
        moduleCapacityWp: DEFAULT_MODULE_WP,
      },
      INDIA
    );
    const modules = moduleCount(mw * 1000, DEFAULT_MODULE_WP);
    return {
      mw,
      investmentInr: Math.round(result.totalInvestmentRequired),
      paybackYears: Math.round(result.roiTimeline * 10) / 10,
      annualSavingsInr: Math.round(result.totalMoneySavedAnnually),
      moduleCount: modules,
      investmentPerModuleInr:
        modules > 0
          ? Math.round(result.totalInvestmentRequired / modules)
          : 0,
    };
  });
}

/** Format INR for marketing copy (en-IN locale). */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
