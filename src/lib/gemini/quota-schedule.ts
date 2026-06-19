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

/** Unix epoch (seconds) for the next 00:30 PT soft start on or after `now`. */
export function getNextGeminiQuotaSoftStartEpoch(now = new Date()): number {
  const tz = GEMINI_QUOTA_RESET_TIMEZONE;
  const ymd = ymdInTz(now, tz);
  const minutes = minutesSinceMidnightInTz(now, tz);
  const softMin = getGeminiQuotaSoftStartMinutes();
  const targetYmd =
    minutes < softMin ? ymd : addCalendarDaysYmd(ymd, 1);
  return epochForClockInTz(targetYmd, softMin, tz);
}

function epochForClockInTz(
  ymd: string,
  minutesFromMidnight: number,
  timeZone: string
): number {
  const [year, month, day] = ymd.split("-").map(Number);
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  let t = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
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
      return Math.floor(t / 1000);
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

  return Math.floor(t / 1000);
}

export function formatNextGeminiQuotaSoftStartInIst(now = new Date()): string {
  return new Date(getNextGeminiQuotaSoftStartEpoch(now) * 1000).toLocaleString(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }
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

/** IST clock used for blog-writer cron window (ops timezone). */
export const BLOG_WRITER_TIMEZONE = "Asia/Kolkata";

export const DEFAULT_BLOG_WRITER_START_IST = "13:35";
export const DEFAULT_BLOG_WRITER_STOP_IST = "12:30";

function parseIstClockToMinutes(value: string | undefined, fallback: string): number {
  const raw = (value?.trim() || fallback).match(/^(\d{1,2}):(\d{2})$/);
  if (!raw) {
    const fb = fallback.match(/^(\d{1,2}):(\d{2})$/);
    if (!fb) return 13 * 60 + 35;
    return Number(fb[1]) * 60 + Number(fb[2]);
  }
  return Number(raw[1]) * 60 + Number(raw[2]);
}

export function getBlogWriterStartMinutes(): number {
  return parseIstClockToMinutes(
    process.env.BLOG_WRITER_START_IST,
    DEFAULT_BLOG_WRITER_START_IST
  );
}

/** Exclusive end of the retry window (dead zone begins here until start). */
export function getBlogWriterStopMinutes(): number {
  return parseIstClockToMinutes(
    process.env.BLOG_WRITER_STOP_IST,
    DEFAULT_BLOG_WRITER_STOP_IST
  );
}

/**
 * Blog writer may call Gemini between start (default 13:35 IST) and stop (default 12:30 IST next day).
 * Dead zone [stop, start) avoids calls before fresh quota + post-reset buffer.
 */
export function isWithinBlogWriterWindow(now = new Date()): boolean {
  const minutes = minutesSinceMidnightInTz(now, BLOG_WRITER_TIMEZONE);
  const start = getBlogWriterStartMinutes();
  const stop = getBlogWriterStopMinutes();
  return minutes >= start || minutes < stop;
}

export function getNextBlogWriterStartEpoch(now = new Date()): number {
  const tz = BLOG_WRITER_TIMEZONE;
  const ymd = ymdInTz(now, tz);
  const minutes = minutesSinceMidnightInTz(now, tz);
  const startMin = getBlogWriterStartMinutes();
  const targetYmd =
    minutes < startMin ? ymd : addCalendarDaysYmd(ymd, 1);
  return epochForClockInTz(targetYmd, startMin, tz);
}

export function formatNextBlogWriterStartInIst(now = new Date()): string {
  return new Date(getNextBlogWriterStartEpoch(now) * 1000).toLocaleString(
    "en-IN",
    {
      timeZone: BLOG_WRITER_TIMEZONE,
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export function formatBlogWriterWindowInIst(): string {
  const startH = Math.floor(getBlogWriterStartMinutes() / 60);
  const startM = getBlogWriterStartMinutes() % 60;
  const stopH = Math.floor(getBlogWriterStopMinutes() / 60);
  const stopM = getBlogWriterStopMinutes() % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(startH)}:${pad(startM)}–${pad(stopH)}:${pad(stopM)} IST (next day)`;
}
