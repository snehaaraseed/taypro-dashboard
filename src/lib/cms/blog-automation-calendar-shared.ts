/**
 * Pure calendar helpers for blog automation (no DB/fs).
 * Keep in sync with scripts/blog-writer-cron-gate.mjs holiday/weekend logic.
 */

export const DEFAULT_BLOG_WRITER_START_IST = "00:30";
export const DEFAULT_BLOG_AUTOMATION_MIN_GAP_DAYS = 1;
export const DEFAULT_BLOG_AUTOMATION_MAX_GAP_DAYS = 3;

/** Default 2026 India national holidays when JSON/env unavailable. */
export const DEFAULT_HOLIDAY_DATES = [
  "2026-01-26",
  "2026-03-10",
  "2026-03-11",
  "2026-03-30",
  "2026-04-02",
  "2026-04-14",
  "2026-05-01",
  "2026-08-15",
  "2026-08-28",
  "2026-10-02",
  "2026-10-20",
  "2026-10-21",
  "2026-11-08",
  "2026-11-09",
  "2026-12-25",
] as const;

export function getBlogAutomationTimezone(): string {
  if (typeof process !== "undefined" && process.env.BLOG_CRON_TZ?.trim()) {
    return process.env.BLOG_CRON_TZ.trim();
  }
  return "Asia/Kolkata";
}

export function parseWriterStartIst(raw?: string | null): number {
  const value = raw?.trim() || DEFAULT_BLOG_WRITER_START_IST;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 30;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function getWriterStartMinutes(): number {
  if (typeof process === "undefined") return 30;
  return parseWriterStartIst(process.env.BLOG_WRITER_START_IST);
}

export function getBlogAutomationMinGapDays(): number {
  if (typeof process === "undefined") return DEFAULT_BLOG_AUTOMATION_MIN_GAP_DAYS;
  const raw = process.env.BLOG_AUTOMATION_MIN_DAYS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_BLOG_AUTOMATION_MIN_GAP_DAYS;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BLOG_AUTOMATION_MIN_GAP_DAYS;
}

export function getBlogAutomationMaxGapDays(): number {
  if (typeof process === "undefined") return DEFAULT_BLOG_AUTOMATION_MAX_GAP_DAYS;
  const raw = process.env.BLOG_AUTOMATION_MAX_DAYS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_BLOG_AUTOMATION_MAX_GAP_DAYS;
  const min = getBlogAutomationMinGapDays();
  const max =
    Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_BLOG_AUTOMATION_MAX_GAP_DAYS;
  return Math.max(min, max);
}

export function ymdInAutomationTz(date: Date, tz = getBlogAutomationTimezone()): string {
  return date.toLocaleDateString("en-CA", { timeZone: tz });
}

export function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function weekdayIndexInTz(ymd: string, tz = getBlogAutomationTimezone()): number {
  const [y, m, d] = ymd.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(noonUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? 0;
}

export function isWeekendYmd(ymd: string, tz = getBlogAutomationTimezone()): boolean {
  const day = weekdayIndexInTz(ymd, tz);
  return day === 0 || day === 6;
}

export function mergeHolidayDates(extraDates: string[] = []): Set<string> {
  const fromEnv =
    typeof process !== "undefined"
      ? (process.env.BLOG_AUTOMATION_HOLIDAY_DATES?.trim() ?? "")
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean)
      : [];
  return new Set([...DEFAULT_HOLIDAY_DATES, ...extraDates, ...fromEnv]);
}

export function isHolidayYmd(ymd: string, holidays: Set<string>): boolean {
  return holidays.has(ymd);
}

export function isStaticBlackoutYmd(
  ymd: string,
  holidays: Set<string>,
  tz = getBlogAutomationTimezone()
): boolean {
  return isWeekendYmd(ymd, tz) || isHolidayYmd(ymd, holidays);
}

/** Next YYYY-MM-DD on or after `fromYmd` that is not weekend/holiday. */
export function nextNonBlackoutYmd(
  fromYmd: string,
  holidays: Set<string>,
  tz = getBlogAutomationTimezone(),
  maxDays = 14
): string {
  let cursor = fromYmd;
  for (let i = 0; i < maxDays; i++) {
    if (!isStaticBlackoutYmd(cursor, holidays, tz)) return cursor;
    cursor = addCalendarDaysYmd(cursor, 1);
  }
  return cursor;
}

/** Share of writes that use the preferred (min) gap before randomizing 1..max. */
export function getBlogAutomationPreferredGapWeight(): number {
  if (typeof process === "undefined") return 0.7;
  const raw = process.env.BLOG_AUTOMATION_PREFERRED_GAP_WEIGHT?.trim();
  const parsed = raw ? Number.parseFloat(raw) : 0.7;
  if (!Number.isFinite(parsed)) return 0.7;
  return Math.min(1, Math.max(0, parsed));
}

/**
 * Pick days until the next write. Prefers `min` (default 1 day); otherwise uniform in min..max.
 */
export function pickNextGapDays(
  min = getBlogAutomationMinGapDays(),
  max = getBlogAutomationMaxGapDays()
): number {
  if (min >= max) return min;
  const preferredWeight = getBlogAutomationPreferredGapWeight();
  if (Math.random() < preferredWeight) return min;
  const span = Math.max(0, max - min);
  return min + Math.floor(Math.random() * (span + 1));
}

export function calendarDaysBetweenYmd(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86_400_000);
}

export function writerWindowStartIso(
  ymd: string,
  tz = getBlogAutomationTimezone(),
  startMinutes = getWriterStartMinutes()
): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const hour = Math.floor(startMinutes / 60);
  const minute = startMinutes % 60;
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
      return new Date(t).toISOString();
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

  return new Date(t).toISOString();
}
