/**
 * Tier 1 expansion markets + Japan, strategic registry for i18n and GTM.
 * Locales map to site languages; several countries share `en` or `ar` for B2B solar.
 */

export type TayproLocale = "en" | "hi" | "ar" | "ja" | "bn";

export type ExpansionTier = "tier1" | "japan" | "tier2";

export interface TayproMarket {
  id: string;
  country: string;
  tier: ExpansionTier;
  /** Primary website locale for this market */
  locale: TayproLocale;
  /** ISO 3166-1 alpha-2 for hreflang / analytics */
  regionCode: string;
  notes?: string;
}

/** Active on taypro.in (routing + messages). */
export const ACTIVE_LOCALES = ["en", "hi", "ar", "ja", "bn"] as const satisfies readonly TayproLocale[];

export const LOCALE_LABELS: Record<
  TayproLocale,
  { native: string; english: string; dir: "ltr" | "rtl" }
> = {
  en: { native: "English", english: "English", dir: "ltr" },
  hi: { native: "हिन्दी", english: "Hindi", dir: "ltr" },
  ar: { native: "العربية", english: "Arabic", dir: "rtl" },
  ja: { native: "日本語", english: "Japanese", dir: "ltr" },
  bn: { native: "বাংলা", english: "Bengali", dir: "ltr" },
};

/** Tier 1 + Japan, country ↔ locale mapping */
export const EXPANSION_MARKETS: TayproMarket[] = [
  // India (home) — English first visit; Hindi at /hi/ via language switcher
  { id: "in", country: "India", tier: "tier1", locale: "en", regionCode: "IN", notes: "B2B default English; Hindi content at /hi/" },
  // South Asia
  { id: "bd", country: "Bangladesh", tier: "tier1", locale: "bn", regionCode: "BD" },
  { id: "lk", country: "Sri Lanka", tier: "tier1", locale: "en", regionCode: "LK", notes: "B2B tenders typically English" },
  { id: "np", country: "Nepal", tier: "tier1", locale: "en", regionCode: "NP" },
  { id: "bt", country: "Bhutan", tier: "tier1", locale: "en", regionCode: "BT" },
  // GCC
  { id: "ae", country: "United Arab Emirates", tier: "tier1", locale: "ar", regionCode: "AE" },
  { id: "sa", country: "Saudi Arabia", tier: "tier1", locale: "ar", regionCode: "SA" },
  { id: "om", country: "Oman", tier: "tier1", locale: "ar", regionCode: "OM" },
  { id: "qa", country: "Qatar", tier: "tier1", locale: "ar", regionCode: "QA" },
  { id: "bh", country: "Bahrain", tier: "tier1", locale: "ar", regionCode: "BH" },
  { id: "jo", country: "Jordan", tier: "tier1", locale: "ar", regionCode: "JO" },
  // North Africa (Arabic-first for site; French business common offline)
  { id: "eg", country: "Egypt", tier: "tier1", locale: "ar", regionCode: "EG" },
  { id: "ma", country: "Morocco", tier: "tier1", locale: "ar", regionCode: "MA" },
  { id: "tn", country: "Tunisia", tier: "tier1", locale: "ar", regionCode: "TN" },
  { id: "dz", country: "Algeria", tier: "tier1", locale: "ar", regionCode: "DZ" },
  // Asia-Pacific
  { id: "au", country: "Australia", tier: "tier1", locale: "en", regionCode: "AU" },
  { id: "jp", country: "Japan", tier: "japan", locale: "ja", regionCode: "JP" },
];

export function marketsForLocale(locale: TayproLocale): TayproMarket[] {
  return EXPANSION_MARKETS.filter((m) => m.locale === locale);
}

export function isActiveLocale(value: string): value is TayproLocale {
  return (ACTIVE_LOCALES as readonly string[]).includes(value);
}
