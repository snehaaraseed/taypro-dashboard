import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  type TayproLocale,
} from "@/i18n/markets";

/** Canonical CMS language, admin edits this version; translations are generated from it. */
export const SOURCE_LOCALE: TayproLocale = "en";

export const TARGET_LOCALES = ACTIVE_LOCALES.filter(
  (l) => l !== SOURCE_LOCALE
) as Exclude<TayproLocale, "en">[];

export function localeDisplayName(locale: TayproLocale): string {
  return `${LOCALE_LABELS[locale].english} (${LOCALE_LABELS[locale].native})`;
}

export function geminiTranslationModel(): string {
  return (
    process.env.GEMINI_TRANSLATION_MODEL?.trim() || "gemini-3.1-flash-lite"
  );
}

/**
 * Default for gemini-3.1-flash-lite free tier (500 RPD, 15 RPM with GEMINI_CALL_DELAY_MS).
 * ~80 translation calls/night + ~10 for blog automation leaves comfortable RPD headroom.
 */
export const DEFAULT_BLOG_TRANSLATION_MAX_PER_DAY = 10;

/** Max published English blogs to translate (all target locales) per daily cron run. */
export function getBlogTranslationMaxPerDay(): number {
  const raw = process.env.BLOG_TRANSLATION_MAX_PER_DAY?.trim();
  const parsed = raw
    ? Number.parseInt(raw, 10)
    : DEFAULT_BLOG_TRANSLATION_MAX_PER_DAY;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_BLOG_TRANSLATION_MAX_PER_DAY;
}
