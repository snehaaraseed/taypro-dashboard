import type { TayproLocale } from "@/i18n/markets";

export type CalculatorCurrencyCode =
  | "INR"
  | "USD"
  | "AED"
  | "SAR"
  | "JPY"
  | "BDT"
  | "AUD";

export type RoiMarketId =
  | "india"
  | "bangladesh"
  | "gcc"
  | "uae"
  | "saudi"
  | "mena"
  | "japan"
  | "australia";

/** next-intl key under PriceCalculatorPage.calculator for the region name */
export type RoiRegionLabelKey =
  | "regionIndia"
  | "regionBangladesh"
  | "regionGcc"
  | "regionUae"
  | "regionSaudi"
  | "regionMena"
  | "regionJapan"
  | "regionAustralia";

export interface RoiMarketEconomics {
  /** Manual cleaning labour avoided per module per cycle (local currency). */
  labourPerModulePerCycle: number;
  /** Representative wet-wash / manual cycles replaced per year. */
  cleaningCyclesPerYear: number;
  /** Litres of water avoided per module per cycle vs wet washing. */
  litresPerModulePerCycle: number;
  /** Cost of water per litre for wet-wash baseline (local currency). */
  waterCostPerLitre: number;
  /** Annual specific yield kWh per kW (P50). */
  specificYieldKwhPerKw: number;
  /** Share of annual yield value recovered on ground-mount from better cleaning. */
  soilingRecoveryFactorGround: number;
  soilingRecoveryFactorRooftop: number;
  /** Fleet-unit CAPEX band (same formula shape as India model). */
  investmentUnitMin: number;
  investmentUnitMax: number;
  investmentScaleCap: number;
  /** Grid emission factor kg CO₂ per kWh for carbon line item. */
  gridEmissionKgPerKwh: number;
}

export interface RoiMarketProfile {
  id: RoiMarketId;
  regionLabelKey: RoiRegionLabelKey;
  currency: CalculatorCurrencyCode;
  formatLocale: string;
  moneyMaxFractionDigits: number;
  defaultTariffGround: number;
  defaultTariffRooftop: number;
  tariffMin: number;
  tariffMax: number;
  tariffStep: number;
  economics: RoiMarketEconomics;
}

/** Cookie set by middleware from CDN geo headers. */
export const VISITOR_COUNTRY_COOKIE = "taypro-geo-country";

const INDIA_REGION_CODES = new Set(["IN", "BT", "NP"]);
const GCC_USD_COUNTRIES = new Set(["OM", "QA", "BH", "JO"]);
const MENA_USD_COUNTRIES = new Set(["EG", "MA", "TN", "DZ"]);

/**
 * Indicative market assumptions (2025–26) for directional ROI only.
 * India values match the legacy Taypro calculator; other markets use
 * typical utility PPA / commercial tariffs, local labour, water, and yield.
 */
export const ROI_MARKET_PROFILES: Record<RoiMarketId, RoiMarketProfile> = {
  india: {
    id: "india",
    regionLabelKey: "regionIndia",
    currency: "INR",
    formatLocale: "en-IN",
    moneyMaxFractionDigits: 2,
    defaultTariffGround: 3,
    defaultTariffRooftop: 10,
    tariffMin: 1,
    tariffMax: 50,
    tariffStep: 0.1,
    economics: {
      labourPerModulePerCycle: 0.5,
      cleaningCyclesPerYear: 20,
      litresPerModulePerCycle: 3,
      waterCostPerLitre: 0.12,
      specificYieldKwhPerKw: 1500,
      soilingRecoveryFactorGround: 0.0295,
      soilingRecoveryFactorRooftop: 0.113,
      investmentUnitMin: 42_000,
      investmentUnitMax: 114_000,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.496,
    },
  },
  bangladesh: {
    id: "bangladesh",
    regionLabelKey: "regionBangladesh",
    currency: "BDT",
    formatLocale: "en-BD",
    moneyMaxFractionDigits: 2,
    // Utility-scale ~BDT 6–8/kWh; C&I rooftop higher
    defaultTariffGround: 6.5,
    defaultTariffRooftop: 18,
    tariffMin: 3,
    tariffMax: 35,
    tariffStep: 0.5,
    economics: {
      labourPerModulePerCycle: 1.2,
      cleaningCyclesPerYear: 18,
      litresPerModulePerCycle: 3,
      waterCostPerLitre: 0.22,
      specificYieldKwhPerKw: 1450,
      soilingRecoveryFactorGround: 0.028,
      soilingRecoveryFactorRooftop: 0.105,
      investmentUnitMin: 61_000,
      investmentUnitMax: 165_000,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.52,
    },
  },
  gcc: {
    id: "gcc",
    regionLabelKey: "regionGcc",
    currency: "USD",
    formatLocale: "en-US",
    moneyMaxFractionDigits: 2,
    // Utility PPA ~2–3¢/kWh; C&I rooftop ~8–12¢
    defaultTariffGround: 0.025,
    defaultTariffRooftop: 0.09,
    tariffMin: 0.01,
    tariffMax: 0.35,
    tariffStep: 0.005,
    economics: {
      labourPerModulePerCycle: 0.035,
      cleaningCyclesPerYear: 24,
      litresPerModulePerCycle: 4,
      waterCostPerLitre: 0.006,
      specificYieldKwhPerKw: 1900,
      soilingRecoveryFactorGround: 0.038,
      soilingRecoveryFactorRooftop: 0.12,
      investmentUnitMin: 520,
      investmentUnitMax: 1_400,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.42,
    },
  },
  uae: {
    id: "uae",
    regionLabelKey: "regionUae",
    currency: "AED",
    formatLocale: "en-AE",
    moneyMaxFractionDigits: 2,
    defaultTariffGround: 0.09,
    defaultTariffRooftop: 0.33,
    tariffMin: 0.03,
    tariffMax: 1.2,
    tariffStep: 0.01,
    economics: {
      labourPerModulePerCycle: 0.13,
      cleaningCyclesPerYear: 24,
      litresPerModulePerCycle: 4,
      waterCostPerLitre: 0.022,
      specificYieldKwhPerKw: 1950,
      soilingRecoveryFactorGround: 0.038,
      soilingRecoveryFactorRooftop: 0.12,
      investmentUnitMin: 1_900,
      investmentUnitMax: 5_150,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.42,
    },
  },
  saudi: {
    id: "saudi",
    regionLabelKey: "regionSaudi",
    currency: "SAR",
    formatLocale: "en-SA",
    moneyMaxFractionDigits: 2,
    defaultTariffGround: 0.09,
    defaultTariffRooftop: 0.34,
    tariffMin: 0.03,
    tariffMax: 1.2,
    tariffStep: 0.01,
    economics: {
      labourPerModulePerCycle: 0.13,
      cleaningCyclesPerYear: 24,
      litresPerModulePerCycle: 4,
      waterCostPerLitre: 0.021,
      specificYieldKwhPerKw: 1920,
      soilingRecoveryFactorGround: 0.037,
      soilingRecoveryFactorRooftop: 0.118,
      investmentUnitMin: 1_950,
      investmentUnitMax: 5_280,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.44,
    },
  },
  mena: {
    id: "mena",
    regionLabelKey: "regionMena",
    currency: "USD",
    formatLocale: "en-US",
    moneyMaxFractionDigits: 2,
    defaultTariffGround: 0.02,
    defaultTariffRooftop: 0.07,
    tariffMin: 0.01,
    tariffMax: 0.3,
    tariffStep: 0.005,
    economics: {
      labourPerModulePerCycle: 0.018,
      cleaningCyclesPerYear: 20,
      litresPerModulePerCycle: 3,
      waterCostPerLitre: 0.004,
      specificYieldKwhPerKw: 1750,
      soilingRecoveryFactorGround: 0.032,
      soilingRecoveryFactorRooftop: 0.11,
      investmentUnitMin: 480,
      investmentUnitMax: 1_300,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.45,
    },
  },
  japan: {
    id: "japan",
    regionLabelKey: "regionJapan",
    currency: "JPY",
    formatLocale: "ja-JP",
    moneyMaxFractionDigits: 0,
    defaultTariffGround: 10,
    defaultTariffRooftop: 22,
    tariffMin: 5,
    tariffMax: 45,
    tariffStep: 1,
    economics: {
      labourPerModulePerCycle: 120,
      cleaningCyclesPerYear: 16,
      litresPerModulePerCycle: 2.5,
      waterCostPerLitre: 4,
      specificYieldKwhPerKw: 1180,
      soilingRecoveryFactorGround: 0.018,
      soilingRecoveryFactorRooftop: 0.075,
      investmentUnitMin: 77_000,
      investmentUnitMax: 209_000,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.39,
    },
  },
  australia: {
    id: "australia",
    regionLabelKey: "regionAustralia",
    currency: "AUD",
    formatLocale: "en-AU",
    moneyMaxFractionDigits: 2,
    defaultTariffGround: 0.055,
    defaultTariffRooftop: 0.2,
    tariffMin: 0.02,
    tariffMax: 0.5,
    tariffStep: 0.01,
    economics: {
      labourPerModulePerCycle: 1.1,
      cleaningCyclesPerYear: 14,
      litresPerModulePerCycle: 2.5,
      waterCostPerLitre: 0.0035,
      specificYieldKwhPerKw: 1680,
      soilingRecoveryFactorGround: 0.022,
      soilingRecoveryFactorRooftop: 0.09,
      investmentUnitMin: 780,
      investmentUnitMax: 2_110,
      investmentScaleCap: 400,
      gridEmissionKgPerKwh: 0.65,
    },
  },
};

export function resolveRoiMarket(
  locale: TayproLocale | string,
  countryCode: string | null | undefined
): RoiMarketProfile {
  const country = countryCode?.trim().toUpperCase() ?? null;

  if (
    locale === "hi" ||
    country === "IN" ||
    (country !== null && INDIA_REGION_CODES.has(country))
  ) {
    return ROI_MARKET_PROFILES.india;
  }

  if (locale === "bn" || country === "BD") {
    return ROI_MARKET_PROFILES.bangladesh;
  }

  if (locale === "ja" || country === "JP") {
    return ROI_MARKET_PROFILES.japan;
  }

  if (country === "AU") {
    return ROI_MARKET_PROFILES.australia;
  }

  if (country === "AE") {
    return ROI_MARKET_PROFILES.uae;
  }

  if (country === "SA") {
    return ROI_MARKET_PROFILES.saudi;
  }

  if (country && GCC_USD_COUNTRIES.has(country)) {
    return ROI_MARKET_PROFILES.gcc;
  }

  if (country && MENA_USD_COUNTRIES.has(country)) {
    return ROI_MARKET_PROFILES.mena;
  }

  if (locale === "ar") {
    return ROI_MARKET_PROFILES.gcc;
  }

  if (locale === "en") {
    if (country && country !== "IN") {
      return ROI_MARKET_PROFILES.gcc;
    }
    return ROI_MARKET_PROFILES.india;
  }

  return ROI_MARKET_PROFILES.india;
}

/** @deprecated Use RoiMarketProfile — kept for imports during migration */
export type CalculatorCurrencyProfile = Pick<
  RoiMarketProfile,
  | "currency"
  | "formatLocale"
  | "moneyMaxFractionDigits"
  | "defaultTariffGround"
  | "defaultTariffRooftop"
  | "tariffMin"
  | "tariffMax"
  | "tariffStep"
> & { code: CalculatorCurrencyCode };

export function resolveCalculatorCurrency(
  locale: TayproLocale | string,
  countryCode: string | null | undefined
): CalculatorCurrencyProfile {
  const m = resolveRoiMarket(locale, countryCode);
  return {
    code: m.currency,
    currency: m.currency,
    formatLocale: m.formatLocale,
    moneyMaxFractionDigits: m.moneyMaxFractionDigits,
    defaultTariffGround: m.defaultTariffGround,
    defaultTariffRooftop: m.defaultTariffRooftop,
    tariffMin: m.tariffMin,
    tariffMax: m.tariffMax,
    tariffStep: m.tariffStep,
  };
}
