import type { RoiMarketProfile } from "@/lib/roi-calculator/market-profiles";

const NUMBER_LOCALE: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ar: "ar",
  ja: "ja-JP",
  bn: "bn-IN",
};

export function roiNumberLocale(locale: string, market: RoiMarketProfile): string {
  if (market.currency !== "INR") return market.formatLocale;
  return NUMBER_LOCALE[locale] ?? "en-IN";
}

export function formatRoiCurrency(
  amount: number,
  market: RoiMarketProfile,
  locale: string
): string {
  return new Intl.NumberFormat(roiNumberLocale(locale, market), {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: market.moneyMaxFractionDigits,
  }).format(amount);
}

export function formatRoiNumber(
  value: number,
  market: RoiMarketProfile,
  locale: string,
  maximumFractionDigits = 2
): string {
  return new Intl.NumberFormat(roiNumberLocale(locale, market), {
    maximumFractionDigits,
  }).format(value);
}

export function formatRoiCurrencyPlain(
  amount: number,
  market: RoiMarketProfile,
  locale: string
): string {
  return new Intl.NumberFormat(roiNumberLocale(locale, market), {
    minimumFractionDigits: market.moneyMaxFractionDigits,
    maximumFractionDigits: market.moneyMaxFractionDigits,
  }).format(amount);
}
