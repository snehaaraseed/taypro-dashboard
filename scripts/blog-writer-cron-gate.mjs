#!/usr/bin/env node
/**
 * Cron helpers: Pacific soft-start gate + text-model quota hold file.
 * Keep in sync with src/lib/gemini/quota-schedule.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const PT = "America/Los_Angeles";
const DEFAULT_SOFT_START_MIN = 30;

function softStartMinutes() {
  const raw = process.env.GEMINI_QUOTA_SOFT_START_MINUTES?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_SOFT_START_MIN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_SOFT_START_MIN;
}

function ymdInTz(date, timeZone) {
  return date.toLocaleDateString("en-CA", { timeZone });
}

function minutesSinceMidnightInTz(date, timeZone) {
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

function addCalendarDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function epochForClockInTz(ymd, minutesFromMidnight, timeZone) {
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
    );
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

export function isPastGeminiQuotaSoftStart(now = new Date()) {
  return minutesSinceMidnightInTz(now, PT) >= softStartMinutes();
}

export function getNextGeminiQuotaSoftStartEpoch(now = new Date()) {
  const ymd = ymdInTz(now, PT);
  const minutes = minutesSinceMidnightInTz(now, PT);
  const softMin = softStartMinutes();
  const targetYmd = minutes < softMin ? ymd : addCalendarDaysYmd(ymd, 1);
  return epochForClockInTz(targetYmd, softMin, PT);
}

function formatNextStartIst(epoch) {
  return new Date(epoch * 1000).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const IST = "Asia/Kolkata";
const DEFAULT_BLOG_WRITER_START = "00:30";
const DEFAULT_RUNTIME_DIR = ".runtime/blog-cron";

function blogWriterStartMinutes() {
  const raw = process.env.BLOG_WRITER_START_IST?.trim() || DEFAULT_BLOG_WRITER_START;
  const m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 30;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** True when IST clock is at or past the daily blog-writer start (default 00:30 IST). */
export function isPastBlogWriterStartIst(now = new Date()) {
  return minutesSinceMidnightInTz(now, IST) >= blogWriterStartMinutes();
}

function resolveAppRoot() {
  return process.env.TAYPRO_APP_ROOT ?? process.cwd();
}

function loadHolidayYmds() {
  const root = resolveAppRoot();
  const envPath = process.env.BLOG_AUTOMATION_HOLIDAYS_PATH?.trim();
  const filePath = envPath
    ? path.resolve(envPath)
    : path.join(root, "data", "blog-automation-holidays.json");
  const defaults = [
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
  ];
  let fileDates = [];
  if (existsSync(filePath)) {
    try {
      const raw = JSON.parse(readFileSync(filePath, "utf8"));
      if (Array.isArray(raw.dates)) fileDates = raw.dates;
    } catch {
      fileDates = [];
    }
  }
  const envDates = (process.env.BLOG_AUTOMATION_HOLIDAY_DATES?.trim() ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  return new Set([...defaults, ...fileDates, ...envDates]);
}

function weekdayIndexIst(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: IST,
    weekday: "short",
  }).format(noonUtc);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
}

/** True on weekdays that are not configured holidays (insight blackout is API-only). */
export function isBlogAutomationDayIst(now = new Date()) {
  const ymd = ymdInTz(now, IST);
  const day = weekdayIndexIst(ymd);
  if (day === 0 || day === 6) return false;
  return !loadHolidayYmds().has(ymd);
}

function formatBlogWriterStartIst() {
  const total = blogWriterStartMinutes();
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m} IST`;
}

function resolveRuntimeDir() {
  const root = process.env.TAYPRO_APP_ROOT ?? process.cwd();
  return process.env.BLOG_CRON_RUNTIME_DIR?.trim()
    ? process.env.BLOG_CRON_RUNTIME_DIR.trim()
    : path.join(root, DEFAULT_RUNTIME_DIR);
}

function istYmdCompact(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: IST }).replace(/-/g, "");
}

function isBlogDoneTodayIst(now = new Date()) {
  return existsSync(path.join(resolveRuntimeDir(), `done-${istYmdCompact(now)}`));
}

const cmd = process.argv[2];

if (cmd === "past-soft-start") {
  process.exit(isPastGeminiQuotaSoftStart() ? 0 : 1);
}

if (cmd === "past-blog-writer-start") {
  process.exit(isPastBlogWriterStartIst() ? 0 : 1);
}

if (cmd === "is-automation-day") {
  process.exit(isBlogAutomationDayIst() ? 0 : 1);
}

if (cmd === "format-blog-writer-start-ist") {
  console.log(formatBlogWriterStartIst());
  process.exit(0);
}

if (cmd === "next-soft-start-epoch") {
  console.log(String(getNextGeminiQuotaSoftStartEpoch()));
  process.exit(0);
}

if (cmd === "format-next-soft-start-ist") {
  console.log(formatNextStartIst(getNextGeminiQuotaSoftStartEpoch()));
  process.exit(0);
}

if (cmd === "blog-done-today") {
  process.exit(isBlogDoneTodayIst() ? 0 : 1);
}

if (cmd === "check-hold") {
  const path = process.argv[3];
  if (!path) process.exit(2);
  const holdUntil = Number(readFileSync(path, "utf8").trim());
  if (!Number.isFinite(holdUntil)) process.exit(1);
  process.exit(Date.now() / 1000 < holdUntil ? 0 : 1);
}

if (cmd === "write-hold") {
  const path = process.argv[3];
  if (!path) process.exit(2);
  const epoch = getNextGeminiQuotaSoftStartEpoch();
  writeFileSync(path, String(epoch));
  console.log(formatNextStartIst(epoch));
  process.exit(0);
}

console.error(
  "Usage: blog-writer-cron-gate.mjs past-soft-start | past-blog-writer-start | is-automation-day | format-blog-writer-start-ist | next-soft-start-epoch | format-next-soft-start-ist | blog-done-today | check-hold <file> | write-hold <file>"
);
process.exit(2);
