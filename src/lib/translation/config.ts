import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  type TayproLocale,
} from "@/i18n/markets";
import {
  DEFAULT_FREE_GEMINI_TEXT_MODEL,
  resolveFreeGeminiTextModel,
} from "@/lib/gemini/free-tier-models";

/** Canonical CMS language, admin edits this version; translations are generated from it. */
export const SOURCE_LOCALE: TayproLocale = "en";

export const TARGET_LOCALES = ACTIVE_LOCALES.filter(
  (l) => l !== SOURCE_LOCALE
) as Exclude<TayproLocale, "en">[];

export function localeDisplayName(locale: TayproLocale): string {
  return `${LOCALE_LABELS[locale].english} (${LOCALE_LABELS[locale].native})`;
}

export function geminiTranslationModel(): string {
  return resolveFreeGeminiTextModel(
    process.env.GEMINI_TRANSLATION_MODEL?.trim(),
    DEFAULT_FREE_GEMINI_TEXT_MODEL
  );
}

/**
 * Default for gemini-3.1-flash-lite free tier (500 RPD, 15 RPM with GEMINI_CALL_DELAY_MS).
 * ~80 translation calls/night + ~10 for blog automation leaves comfortable RPD headroom.
 */
export const DEFAULT_DAILY_TRANSLATION_MAX_PER_DAY = 10;
export const DEFAULT_DAILY_TRANSLATION_SPLIT_PER_TYPE = 5;

function parsePositiveInt(
  raw: string | undefined,
  fallback: number
): number {
  const parsed = raw ? Number.parseInt(raw, 10) : fallback;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Max CMS items (blogs + projects) to translate per daily cron run. */
export function getDailyTranslationMaxPerDay(): number {
  const unified = process.env.CMS_TRANSLATION_MAX_PER_DAY?.trim();
  if (unified) {
    return parsePositiveInt(unified, DEFAULT_DAILY_TRANSLATION_MAX_PER_DAY);
  }
  return parsePositiveInt(
    process.env.BLOG_TRANSLATION_MAX_PER_DAY?.trim(),
    DEFAULT_DAILY_TRANSLATION_MAX_PER_DAY
  );
}

/** @deprecated Use getDailyTranslationMaxPerDay */
export function getBlogTranslationMaxPerDay(): number {
  return getDailyTranslationMaxPerDay();
}

/**
 * When both blogs and projects need translation, each type gets this many slots
 * (spare capacity shifts to the type with more backlog, up to max per day).
 */
export function getDailyTranslationSplitPerType(): number {
  return parsePositiveInt(
    process.env.CMS_TRANSLATION_SPLIT_PER_TYPE?.trim(),
    DEFAULT_DAILY_TRANSLATION_SPLIT_PER_TYPE
  );
}
