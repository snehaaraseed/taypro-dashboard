/**
 * Gemini Developer API daily (RPD) quotas reset at midnight Pacific Time.
 * @see https://ai.google.dev/gemini-api/docs/rate-limits
 */

export const GEMINI_QUOTA_RESET_TIMEZONE = "America/Los_Angeles";

/** Minutes after Pacific midnight before automation uses Gemini (default 00:30 PT). */
export const DEFAULT_GEMINI_QUOTA_SOFT_START_MINUTES = 30;

const MS_PER_DAY = 86_400_000;

function minutesSinceMidnightInTz(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function getGeminiQuotaSoftStartMinutes(): number {
  const raw = process.env.GEMINI_QUOTA_SOFT_START_MINUTES?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_GEMINI_QUOTA_SOFT_START_MINUTES;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_GEMINI_QUOTA_SOFT_START_MINUTES;
}

/** True when local Pacific time is at or past the post-reset soft start (00:30 PT by default). */
export function isPastGeminiQuotaSoftStart(now = new Date()): boolean {
  return (
    minutesSinceMidnightInTz(now, GEMINI_QUOTA_RESET_TIMEZONE) >=
    getGeminiQuotaSoftStartMinutes()
  );
}

export function formatGeminiQuotaSoftStartInIst(now = new Date()): string {
  const tz = GEMINI_QUOTA_RESET_TIMEZONE;
  const ymd = ymdInTz(now, tz);
  const [year, month, day] = ymd.split("-").map(Number);
  const softMinutes = getGeminiQuotaSoftStartMinutes();
  const hour = Math.floor(softMinutes / 60);
  const minute = softMinutes % 60;
  let t = Date.UTC(year, month - 1, day, hour, minute, 0);
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
    if (gotYmd === ymd && gotH === hour && gotM === minute) {
      return new Date(t).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
    t +=
      Date.UTC(year, month - 1, day, hour, minute, 0) -
      Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        gotH,
        gotM,
        0
      );
  }

  return new Date(t).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ymdInTz(date: Date, timeZone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Unix epoch (seconds) for the next midnight in America/Los_Angeles. */
export function getNextGeminiQuotaResetEpoch(now = new Date()): number {
  const tz = GEMINI_QUOTA_RESET_TIMEZONE;
  const tomorrowYmd = addCalendarDaysYmd(ymdInTz(now, tz), 1);
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

  return Math.floor((now.getTime() + MS_PER_DAY) / 1000);
}

/** Human-readable next reset in IST (for ops logs). */
export function formatNextGeminiQuotaResetInIst(now = new Date()): string {
  const epoch = getNextGeminiQuotaResetEpoch(now);
  return new Date(epoch * 1000).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
