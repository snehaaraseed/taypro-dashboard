import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  type TayproLocale,
} from "@/i18n/markets";

/** Canonical CMS language — admin edits this version; translations are generated from it. */
export const SOURCE_LOCALE: TayproLocale = "en";

export const TARGET_LOCALES = ACTIVE_LOCALES.filter(
  (l) => l !== SOURCE_LOCALE
) as Exclude<TayproLocale, "en">[];

export function localeDisplayName(locale: TayproLocale): string {
  return `${LOCALE_LABELS[locale].english} (${LOCALE_LABELS[locale].native})`;
}

export function geminiTranslationModel(): string {
  return process.env.GEMINI_TRANSLATION_MODEL?.trim() || "gemini-2.0-flash";
}
