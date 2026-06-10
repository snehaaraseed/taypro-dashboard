/** Blog publish / schedule helpers (pure — safe on server and client). */

export type BlogPublishInput = {
  published?: boolean;
  scheduledPublishAt?: string | null;
  publishDate?: string;
};

export type ResolvedBlogPublishFields = {
  published: boolean;
  scheduledPublishAt: string | null;
  publishDate: string;
};

const FUTURE_SCHEDULE_BUFFER_MS = 60_000;

export function isFutureScheduledPublish(
  scheduledPublishAt: string | null | undefined,
  nowMs = Date.now()
): boolean {
  if (!scheduledPublishAt) return false;
  const t = new Date(scheduledPublishAt).getTime();
  if (Number.isNaN(t)) return false;
  return t > nowMs + FUTURE_SCHEDULE_BUFFER_MS;
}

export function isBlogScheduledDraft(meta: {
  published?: boolean;
  scheduledPublishAt?: string | null;
}): boolean {
  return meta.published === false && Boolean(meta.scheduledPublishAt);
}

export function isBlogScheduledPending(meta: {
  published?: boolean;
  scheduledPublishAt?: string | null;
}): boolean {
  return (
    isBlogScheduledDraft(meta) &&
    isFutureScheduledPublish(meta.scheduledPublishAt)
  );
}

export function resolveBlogPublishFields(
  input: BlogPublishInput,
  existing?: {
    published: boolean;
    scheduledPublishAt?: string | null;
    publishDate: string;
  }
):
  | { ok: true; value: ResolvedBlogPublishFields }
  | { ok: false; error: string } {
  const nowIso = new Date().toISOString();

  let scheduledPublishAt: string | null;
  if (input.scheduledPublishAt === undefined) {
    scheduledPublishAt = existing?.scheduledPublishAt ?? null;
  } else if (
    input.scheduledPublishAt === null ||
    input.scheduledPublishAt === ""
  ) {
    scheduledPublishAt = null;
  } else {
    const parsed = new Date(input.scheduledPublishAt);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Invalid scheduled publish date and time." };
    }
    scheduledPublishAt = parsed.toISOString();
  }

  let published =
    input.published !== undefined
      ? input.published
      : (existing?.published ?? true);

  if (scheduledPublishAt) {
    if (isFutureScheduledPublish(scheduledPublishAt)) {
      published = false;
    } else {
      published = true;
      scheduledPublishAt = null;
    }
  }

  if (published) {
    scheduledPublishAt = null;
  }

  let publishDate =
    input.publishDate?.trim() ||
    existing?.publishDate ||
    scheduledPublishAt ||
    nowIso;

  if (!published && scheduledPublishAt) {
    publishDate = scheduledPublishAt;
  }

  return {
    ok: true,
    value: { published, scheduledPublishAt, publishDate },
  };
}

/** Format ISO datetime for `<input type="datetime-local" />` in local time. */
export function toDatetimeLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalInputToIso(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function isoToDateInputValue(iso: string | null | undefined): string {
  if (!iso) return new Date().toISOString().split("T")[0];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  return d.toISOString().split("T")[0];
}

const AUTOMATION_PUBLISH_START_HOUR = 9;
/** Inclusive end: 17:00 is the last publish minute (5 PM). */
const AUTOMATION_PUBLISH_END_HOUR = 17;

function automationPublishTz(): string {
  if (typeof process !== "undefined" && process.env.BLOG_CRON_TZ?.trim()) {
    return process.env.BLOG_CRON_TZ.trim();
  }
  return "Asia/Kolkata";
}

function ymdInAutomationTz(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: automationPublishTz() });
}

function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

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

function isoAtYmdAndMinute(ymd: string, minuteOfDay: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  let t = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: automationPublishTz(),
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

/**
 * Random publish time between 09:00 and 17:00 in BLOG_CRON_TZ (default IST).
 * If called after 17:00, schedules the next calendar day in that window.
 */
export function pickAutomationScheduledPublishAt(now = new Date()): string {
  const tz = automationPublishTz();
  const startMinute = AUTOMATION_PUBLISH_START_HOUR * 60;
  const endMinute = AUTOMATION_PUBLISH_END_HOUR * 60;
  const nowMinute = minutesSinceMidnightInTz(now, tz);
  let targetYmd = ymdInAutomationTz(now);

  let windowStart = startMinute;
  let windowEnd = endMinute;

  if (nowMinute >= endMinute) {
    targetYmd = addCalendarDaysYmd(targetYmd, 1);
  } else if (nowMinute >= startMinute) {
    windowStart = Math.min(nowMinute + 1, endMinute);
  }

  const span = Math.max(1, windowEnd - windowStart + 1);
  const pickedMinute = windowStart + Math.floor(Math.random() * span);
  return isoAtYmdAndMinute(targetYmd, pickedMinute);
}

export function getAutomationPublishTimezone(): string {
  return automationPublishTz();
}

/** English automation draft that is scheduled but not yet live. */
export function isScheduledAutomationSource(meta: {
  published?: boolean;
  scheduledPublishAt?: string | null;
}): boolean {
  return isBlogScheduledPending(meta);
}
