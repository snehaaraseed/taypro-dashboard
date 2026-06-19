#!/usr/bin/env node
/**
 * Cron helpers: Pacific soft-start gate + text-model quota hold file.
 * Keep in sync with src/lib/gemini/quota-schedule.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

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

const cmd = process.argv[2];

if (cmd === "past-soft-start") {
  process.exit(isPastGeminiQuotaSoftStart() ? 0 : 1);
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
  "Usage: blog-writer-cron-gate.mjs past-soft-start | check-hold <file> | write-hold <file>"
);
process.exit(2);
