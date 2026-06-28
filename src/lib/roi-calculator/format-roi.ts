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

function roiCurrencySymbol(market: RoiMarketProfile, locale: string): string {
  const parts = new Intl.NumberFormat(roiNumberLocale(locale, market), {
    style: "currency",
    currency: market.currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? market.currency;
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

export type PaybackDurationLabels = {
  year: string;
  years: string;
  month: string;
  months: string;
};

/** Fractional years → e.g. "2 years 6 months" or "9 months". */
export function formatRoiPaybackDuration(
  yearsFraction: number,
  labels: PaybackDurationLabels
): string {
  let totalMonths = Math.round(Math.max(0, yearsFraction) * 12);
  if (yearsFraction > 0 && totalMonths === 0) {
    totalMonths = 1;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? labels.year : labels.years}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? labels.month : labels.months}`);
  }

  return parts.length > 0 ? parts.join(" ") : `0 ${labels.months}`;
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

function formatSouthAsianCompact(
  amount: number,
  market: RoiMarketProfile,
  locale: string,
  symbol: string,
  plain: boolean
): string | null {
  const abs = Math.abs(amount);
  if (abs >= 10_000_000) {
    const n = formatRoiNumber(amount / 10_000_000, market, locale, 2);
    return plain ? `${symbol} ${n} Cr` : `${symbol}${n} Cr`;
  }
  if (abs >= 100_000) {
    const n = formatRoiNumber(amount / 100_000, market, locale, 2);
    return plain ? `${symbol} ${n} L` : `${symbol}${n} L`;
  }
  return null;
}

function formatWesternCompact(
  amount: number,
  market: RoiMarketProfile,
  locale: string,
  symbol: string,
  plain: boolean
): string | null {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const n = formatRoiNumber(amount / 1_000_000, market, locale, 2);
    return plain ? `${symbol} ${n} M` : `${symbol}${n}M`;
  }
  if (abs >= 100_000) {
    const n = formatRoiNumber(amount / 1_000, market, locale, 1);
    return plain ? `${symbol} ${n} K` : `${symbol}${n}K`;
  }
  return null;
}

/** Executive-friendly amounts for PDF (Cr / Lakh for INR). ASCII-only: jsPDF cannot render ₹. */
export function formatRoiPdfMoney(
  amount: number,
  market: RoiMarketProfile,
  locale: string
): string {
  const plain = true;
  const symbol = market.currency;

  if (market.currency === "INR" || market.currency === "BDT") {
    const compact = formatSouthAsianCompact(amount, market, locale, symbol, plain);
    if (compact) return compact;
    return `${symbol} ${formatRoiCurrencyPlain(amount, market, locale)}`;
  }

  if (market.currency === "JPY") {
    const abs = Math.abs(amount);
    if (abs >= 100_000_000) {
      const n = formatRoiNumber(amount / 100_000_000, market, locale, 2);
      return `JPY ${n} oku`;
    }
    if (abs >= 10_000) {
      const n = formatRoiNumber(amount / 10_000, market, locale, 0);
      return `JPY ${n} man`;
    }
    return `JPY ${formatRoiCurrencyPlain(amount, market, locale)}`;
  }

  const compact = formatWesternCompact(amount, market, locale, symbol, plain);
  if (compact) return compact;
  return `${symbol} ${formatRoiCurrencyPlain(amount, market, locale)}`;
}

/**
 * Compact currency for ROI UI cards, Cr/L for INR & BDT, M/K for USD-family, 万/億 for JPY.
 * Falls back to full `formatRoiCurrency` for smaller amounts.
 */
export function formatRoiMoneyCompact(
  amount: number,
  market: RoiMarketProfile,
  locale: string,
  options?: { plainCurrencyPrefix?: boolean }
): string {
  const plain = options?.plainCurrencyPrefix ?? false;
  const symbol = plain ? market.currency : roiCurrencySymbol(market, locale);

  if (market.currency === "INR" || market.currency === "BDT") {
    const compact = formatSouthAsianCompact(amount, market, locale, symbol, plain);
    if (compact) return compact;
    return plain
      ? `${market.currency} ${formatRoiCurrencyPlain(amount, market, locale)}`
      : formatRoiCurrency(amount, market, locale);
  }

  if (market.currency === "JPY") {
    const abs = Math.abs(amount);
    if (abs >= 100_000_000) {
      const n = formatRoiNumber(amount / 100_000_000, market, locale, 2);
      return `${symbol}${n}億`;
    }
    if (abs >= 10_000) {
      const n = formatRoiNumber(amount / 10_000, market, locale, 0);
      return `${symbol}${n}万`;
    }
    return formatRoiCurrency(amount, market, locale);
  }

  const compact = formatWesternCompact(amount, market, locale, symbol, plain);
  if (compact) return compact;

  return plain
    ? `${market.currency} ${formatRoiCurrencyPlain(amount, market, locale)}`
    : formatRoiCurrency(amount, market, locale);
}
