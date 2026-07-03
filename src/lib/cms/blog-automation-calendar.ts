import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { pickAutomationScheduledPublishAt } from "@/lib/cms/blog-schedule";
import { listPublishedInsights } from "@/lib/cms/insightService";
import {
  addCalendarDaysYmd,
  calendarDaysBetweenYmd,
  getBlogAutomationMaxGapDays,
  getBlogAutomationMinGapDays,
  getBlogAutomationTimezone,
  isStaticBlackoutYmd,
  mergeHolidayDates,
  nextNonBlackoutYmd,
  pickNextGapDays,
  writerWindowStartIso,
  ymdInAutomationTz,
} from "@/lib/cms/blog-automation-calendar-shared";

export type BlogCadenceState = {
  requiredGapDays: number;
  setAt: string;
};

export type BlogBlackoutReason =
  | "weekend"
  | "holiday"
  | "insight_published_today"
  | null;

function runtimeDir(): string {
  const root = getDeploymentRoot();
  const envDir = process.env.BLOG_CRON_RUNTIME_DIR?.trim();
  return envDir ? path.resolve(envDir) : path.join(root, ".runtime", "blog-cron");
}

function cadenceStatePath(): string {
  return path.join(runtimeDir(), "cadence-state.json");
}

function holidaysFilePath(): string {
  const env = process.env.BLOG_AUTOMATION_HOLIDAYS_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "blog-automation-holidays.json");
}

let cachedHolidaySet: Set<string> | null = null;

export function loadHolidayDates(): Set<string> {
  if (cachedHolidaySet) return cachedHolidaySet;

  let fileDates: string[] = [];
  const filePath = holidaysFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
        dates?: string[];
      };
      if (Array.isArray(raw.dates)) {
        fileDates = raw.dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
      }
    } catch {
      fileDates = [];
    }
  }

  cachedHolidaySet = mergeHolidayDates(fileDates);
  return cachedHolidaySet;
}

export function loadCadenceState(): BlogCadenceState {
  const filePath = cadenceStatePath();
  const fallback: BlogCadenceState = {
    requiredGapDays: getBlogAutomationMinGapDays(),
    setAt: new Date(0).toISOString(),
  };
  if (!fs.existsSync(filePath)) return fallback;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as BlogCadenceState;
    const min = getBlogAutomationMinGapDays();
    const max = getBlogAutomationMaxGapDays();
    const gap = Number(raw.requiredGapDays);
    if (!Number.isFinite(gap) || gap < min) return { ...fallback, requiredGapDays: min };
    return {
      requiredGapDays: Math.min(gap, max),
      setAt: raw.setAt ?? fallback.setAt,
    };
  } catch {
    return fallback;
  }
}

export function saveCadenceState(state: BlogCadenceState): void {
  const dir = runtimeDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(cadenceStatePath(), JSON.stringify(state, null, 2));
}

/** Pick and persist the gap required before the *next* write. */
export function rotateCadenceAfterSuccessfulWrite(now = new Date()): BlogCadenceState {
  const next: BlogCadenceState = {
    requiredGapDays: pickNextGapDays(),
    setAt: now.toISOString(),
  };
  saveCadenceState(next);
  return next;
}

async function hasEnglishResearchInsightPublishedOnYmd(ymd: string): Promise<boolean> {
  if (process.env.BLOG_AUTOMATION_SKIP_INSIGHT_BLACKOUT?.trim() === "1") {
    return false;
  }
  const tz = getBlogAutomationTimezone();
  const insights = await listPublishedInsights("en", "mini_study");
  return insights.some((row) => {
    const rowYmd = ymdInAutomationTz(new Date(row.publishDate), tz);
    return rowYmd === ymd;
  });
}

export async function getBlogBlackoutReason(
  date = new Date()
): Promise<BlogBlackoutReason> {
  const tz = getBlogAutomationTimezone();
  const ymd = ymdInAutomationTz(date, tz);
  const holidays = loadHolidayDates();

  if (isStaticBlackoutYmd(ymd, holidays, tz)) {
    const day = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
    }).format(date);
    if (day === "Sat" || day === "Sun") return "weekend";
    return "holiday";
  }

  if (await hasEnglishResearchInsightPublishedOnYmd(ymd)) {
    return "insight_published_today";
  }

  return null;
}

export async function isBlogAutomationBlackoutDay(date = new Date()): Promise<boolean> {
  return (await getBlogBlackoutReason(date)) !== null;
}

export function nextBlogAutomationDayYmd(fromYmd: string): string {
  const holidays = loadHolidayDates();
  const tz = getBlogAutomationTimezone();
  return nextNonBlackoutYmd(addCalendarDaysYmd(fromYmd, 1), holidays, tz);
}

export function nextEligibleWriterDayYmd(fromYmd: string): string {
  const holidays = loadHolidayDates();
  const tz = getBlogAutomationTimezone();
  return nextNonBlackoutYmd(fromYmd, holidays, tz);
}

export function computeNextEligibleAt(
  lastRunYmd: string,
  requiredGapDays: number
): string {
  const holidays = loadHolidayDates();
  const tz = getBlogAutomationTimezone();
  let targetYmd = addCalendarDaysYmd(lastRunYmd, requiredGapDays);
  targetYmd = nextNonBlackoutYmd(targetYmd, holidays, tz);
  return writerWindowStartIso(targetYmd, tz);
}

export function pickAutomationPublishAt(now = new Date()): string {
  return pickAutomationScheduledPublishAt(now, loadHolidayDates());
}

export {
  calendarDaysBetweenYmd,
  getBlogAutomationTimezone,
  writerWindowStartIso,
  ymdInAutomationTz,
} from "@/lib/cms/blog-automation-calendar-shared";
