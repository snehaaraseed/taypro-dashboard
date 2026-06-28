import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { loadSeoKeywordRows } from "@/lib/seo/keyword-stats";
import { loadEvergreenFallbackCatalog } from "@/lib/seo/evergreen-fallback";
import {
  briefSlotKey,
  listFilledBriefIds,
  listRejectedBriefIds,
  sortedBriefQueue,
  type DiscoveredBrief,
} from "@/lib/seo/discovered-brief-queue";
import { getPermanentRejectedSlotKeys } from "@/lib/seo/editorial-state";

export type CalendarDayRow = {
  date: string;
  primaryBriefId: string;
  backupBriefId: string;
  evergreenId: string;
  primary: {
    briefId: string;
    slotKey: string;
    keyword: string;
    title: string;
  };
  backup: {
    briefId: string;
    slotKey: string;
    keyword: string;
    title: string;
  };
};

export type EditorialCalendarFile = {
  generatedAt: string;
  days: CalendarDayRow[];
  stats?: {
    candidatePool: number;
    daysRequested: number;
    daysScheduled: number;
    source: "discovered-briefs";
  };
};

function resolveCalendarPath(): string {
  const env = process.env.EDITORIAL_CALENDAR_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "editorial-calendar.json");
}

function buildDayEntry(brief: DiscoveredBrief) {
  return {
    briefId: brief.id,
    slotKey: briefSlotKey(brief.id),
    keyword: brief.primaryKeyword,
    title: brief.title,
  };
}

export function generateEditorialCalendar(days = 90): EditorialCalendarFile {
  const filled = listFilledBriefIds();
  const rejected = listRejectedBriefIds();
  const permanentRejected = getPermanentRejectedSlotKeys();
  const candidates = sortedBriefQueue().filter((b) => {
    if (filled.has(b.id) || rejected.has(b.id)) return false;
    if (permanentRejected.has(briefSlotKey(b.id))) return false;
    return true;
  });

  const tz = process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
  const today = new Date();
  const calendarDays: CalendarDayRow[] = [];
  let lastDomain = "";
  let candidateIdx = 0;
  const usedIds = new Set<string>();
  const evergreenCatalog = loadEvergreenFallbackCatalog();

  const pick = (preferDifferentDomain: boolean): DiscoveredBrief | null => {
    for (let i = candidateIdx; i < candidates.length; i++) {
      const b = candidates[i]!;
      if (usedIds.has(b.id)) continue;
      if (
        preferDifferentDomain &&
        calendarDays.length > 0 &&
        b.domainId &&
        b.domainId === lastDomain
      ) {
        continue;
      }
      candidateIdx = i + 1;
      usedIds.add(b.id);
      lastDomain = b.domainId ?? "";
      return b;
    }
    for (let i = 0; i < candidates.length; i++) {
      const b = candidates[i]!;
      if (usedIds.has(b.id)) continue;
      candidateIdx = i + 1;
      usedIds.add(b.id);
      lastDomain = b.domainId ?? "";
      return b;
    }
    return null;
  };

  for (let d = 0; d < days; d++) {
    const date = new Date(today.getTime() + d * 86_400_000);
    const ymd = date.toLocaleDateString("en-CA", { timeZone: tz });

    const primaryBrief = pick(true);
    const backupBrief = pick(true);
    if (!primaryBrief || !backupBrief) break;

    const evergreenId =
      evergreenCatalog.length > 0
        ? evergreenCatalog[d % evergreenCatalog.length]!.id
        : "pr-calc-50mw";

    calendarDays.push({
      date: ymd,
      primaryBriefId: primaryBrief.id,
      backupBriefId: backupBrief.id,
      evergreenId,
      primary: buildDayEntry(primaryBrief),
      backup: buildDayEntry(backupBrief),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      candidatePool: candidates.length,
      daysRequested: days,
      daysScheduled: calendarDays.length,
      source: "discovered-briefs",
    },
    days: calendarDays,
  };
}

export function saveEditorialCalendar(calendar: EditorialCalendarFile): void {
  const filePath = resolveCalendarPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(calendar, null, 2));
}

export function loadEditorialCalendar(): EditorialCalendarFile | null {
  const filePath = resolveCalendarPath();
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as EditorialCalendarFile;
  } catch {
    return null;
  }
}

export function loadTodayCalendarRow(): CalendarDayRow | null {
  const tz = process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
  const today = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const cal = loadEditorialCalendar();
  if (!cal) return null;
  return cal.days.find((d) => d.date === today) ?? null;
}

/** Volume hint from planner CSV for calendar scoring extension. */
export function getKeywordVolumeBucket(keyword: string): number {
  const rows = loadSeoKeywordRows();
  const row = rows.find((r) => r.keyword.toLowerCase() === keyword.toLowerCase());
  return row?.volumeBucket ?? 50;
}
