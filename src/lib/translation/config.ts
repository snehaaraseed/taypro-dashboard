import {
  ACTIVE_LOCALES,
  LOCALE_LABELS,
  type TayproLocale,
} from "@/i18n/markets";
import {
  DEFAULT_FREE_GEMINI_TEXT_MODEL,
  FREE_GEMINI_TEXT_MODEL_RETRY,
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

/** Ordered free-tier models for translation (primary → retry variant). */
export function geminiTranslationModelCandidates(): string[] {
  const primary = resolveFreeGeminiTextModel(
    process.env.GEMINI_TRANSLATION_MODEL?.trim(),
    DEFAULT_FREE_GEMINI_TEXT_MODEL
  );
  const retry = resolveFreeGeminiTextModel(
    process.env.GEMINI_TRANSLATION_RETRY_MODEL?.trim(),
    FREE_GEMINI_TEXT_MODEL_RETRY
  );

  const seen = new Set<string>();
  const out: string[] = [];
  for (const model of [primary, retry, DEFAULT_FREE_GEMINI_TEXT_MODEL, FREE_GEMINI_TEXT_MODEL_RETRY]) {
    const id = model.trim().toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length > 0 ? out : [DEFAULT_FREE_GEMINI_TEXT_MODEL];
}

/** Split large HTML bodies into separate Gemini calls above this size (masked chars). */
export function getTranslationContentChunkChars(): number {
  return parsePositiveInt(
    process.env.CMS_TRANSLATION_CONTENT_CHUNK_CHARS?.trim(),
    10_000
  );
}

/** Pause before retrying a queue item after transient 503 / high-demand errors. */
export function getTranslationRetry503Ms(): number {
  return parsePositiveInt(
    process.env.CMS_TRANSLATION_RETRY_503_MS?.trim(),
    5_000
  );
}

/** Pause before retrying after JSON parse failures or other non-quota errors. */
export function getTranslationRetryErrorMs(): number {
  return parsePositiveInt(
    process.env.CMS_TRANSLATION_RETRY_ERROR_MS?.trim(),
    10_000
  );
}

/** CMS translation deadline timezone (midnight stop for post-writer runs). */
export function getTranslationTimezone(): string {
  return process.env.CMS_TRANSLATION_TZ?.trim() || "Asia/Kolkata";
}

function ymdInTranslationTz(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: getTranslationTimezone() });
}

function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Unix epoch (seconds) for 00:00:00 on the next calendar day in CMS_TRANSLATION_TZ. */
export function getNextMidnightStopAtEpoch(now = new Date()): number {
  const tz = getTranslationTimezone();
  const tomorrowYmd = addCalendarDaysYmd(ymdInTranslationTz(now), 1);
  const [year, month, day] = tomorrowYmd.split("-").map(Number);
  let t = Date.UTC(year, month - 1, day, 0, 0, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let i = 0; i < 48; i++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(t)).map((p) => [p.type, p.value])
    ) as Record<string, string>;
    const gotYmd = `${parts.year}-${parts.month}-${parts.day}`;
    const gotH = Number(parts.hour);
    const gotM = Number(parts.minute);
    const gotS = Number(parts.second);
    if (gotYmd === tomorrowYmd && gotH === 0 && gotM === 0 && gotS === 0) {
      return Math.floor(t / 1000);
    }
    t +=
      Date.UTC(year, month - 1, day, 0, 0, 0) -
      Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        gotH,
        gotM,
        gotS
      );
  }

  return Math.floor((now.getTime() + 86_400_000) / 1000);
}

/**
 * Legacy cap for manual/debug runs only. Post-writer automation uses full backlog
 * until both Gemini keys hit quota or midnight IST.
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
