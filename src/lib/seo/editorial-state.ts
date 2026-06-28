import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export type EditorialRejection = {
  slotKey: string;
  reason: string;
  similarToSlug?: string | null;
  permanent: boolean;
  at: string;
};

export type EditorialStateFile = {
  date: string;
  electedSlotKey?: string | null;
  backupSlotKey?: string | null;
  attemptsToday: number;
  rejections: EditorialRejection[];
};

const PERMANENT_REJECTION_PATTERNS = [
  "Outline too similar",
  "Blog too similar",
  "Topic already published",
  "Keyword corpus conflict",
  "already covered by existing post",
] as const;

function runtimeDir(): string {
  return path.join(getDeploymentRoot(), ".runtime", "blog-cron");
}

function statePath(): string {
  return path.join(runtimeDir(), "editorial-state.json");
}

function todayYmd(): string {
  const tz = process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

export function isPermanentRejectionReason(reason: string): boolean {
  return PERMANENT_REJECTION_PATTERNS.some((p) => reason.includes(p));
}

export function loadEditorialState(): EditorialStateFile {
  const day = todayYmd();
  const filePath = statePath();
  if (!fs.existsSync(filePath)) {
    return { date: day, attemptsToday: 0, rejections: [] };
  }
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as EditorialStateFile;
    if (raw.date !== day) {
      return { date: day, attemptsToday: 0, rejections: [] };
    }
    return {
      date: day,
      electedSlotKey: raw.electedSlotKey ?? null,
      backupSlotKey: raw.backupSlotKey ?? null,
      attemptsToday: raw.attemptsToday ?? 0,
      rejections: Array.isArray(raw.rejections) ? raw.rejections : [],
    };
  } catch {
    return { date: day, attemptsToday: 0, rejections: [] };
  }
}

export function saveEditorialState(state: EditorialStateFile): void {
  const dir = runtimeDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2));
}

export function getPermanentRejectedSlotKeys(): Set<string> {
  const state = loadEditorialState();
  return new Set(
    state.rejections.filter((r) => r.permanent).map((r) => r.slotKey)
  );
}

export function recordEditorialRejection(input: {
  slotKey: string;
  reason: string;
  similarToSlug?: string | null;
}): void {
  const state = loadEditorialState();
  const permanent = isPermanentRejectionReason(input.reason);
  const key = `${input.slotKey}::${input.reason.slice(0, 80)}`;
  const exists = state.rejections.some(
    (r) => `${r.slotKey}::${r.reason.slice(0, 80)}` === key
  );
  if (!exists) {
    state.rejections.push({
      slotKey: input.slotKey,
      reason: input.reason,
      similarToSlug: input.similarToSlug ?? null,
      permanent,
      at: new Date().toISOString(),
    });
  }
  saveEditorialState(state);
}

export function incrementEditorialAttemptsToday(): number {
  const state = loadEditorialState();
  state.attemptsToday += 1;
  saveEditorialState(state);
  return state.attemptsToday;
}

export function setElectedSlotKeys(input: {
  primary?: string | null;
  backup?: string | null;
}): void {
  const state = loadEditorialState();
  if (input.primary !== undefined) state.electedSlotKey = input.primary;
  if (input.backup !== undefined) state.backupSlotKey = input.backup;
  saveEditorialState(state);
}
