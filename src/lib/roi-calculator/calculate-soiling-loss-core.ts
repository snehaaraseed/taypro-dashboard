export type SoilingLossInput = {
  plantCapacityMW: number;
  soilingLossPercent: number;
  electricityTariff: number;
  specificYieldKwhPerKw: number;
};

export type SoilingLossResult = {
  annualGenerationKwh: number;
  annualGenerationMwh: number;
  annualLossKwh: number;
  annualLossMwh: number;
  annualRevenueLoss: number;
  monthlyRevenueLoss: number;
  dailyLossKwh: number;
};

export function calculateSoilingLoss(input: SoilingLossInput): SoilingLossResult {
  const mw = Math.max(0, input.plantCapacityMW);
  const lossPct = Math.min(100, Math.max(0, input.soilingLossPercent));
  const tariff = Math.max(0, input.electricityTariff);
  const yieldKwhPerKw = Math.max(0, input.specificYieldKwhPerKw);

  const annualGenerationKwh = mw * 1000 * yieldKwhPerKw;
  const annualLossKwh = annualGenerationKwh * (lossPct / 100);
  const annualRevenueLoss = annualLossKwh * tariff;

  return {
    annualGenerationKwh,
    annualGenerationMwh: annualGenerationKwh / 1000,
    annualLossKwh,
    annualLossMwh: annualLossKwh / 1000,
    annualRevenueLoss,
    monthlyRevenueLoss: annualRevenueLoss / 12,
    dailyLossKwh: annualLossKwh / 365,
  };
}

export const SOILING_REGION_PRESETS = [
  { id: "low", labelKey: "presetLow", percent: 6 },
  { id: "typical", labelKey: "presetTypical", percent: 12 },
  { id: "high", labelKey: "presetHigh", percent: 20 },
] as const;
