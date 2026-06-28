import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export type GscSnapshotRow = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscSnapshotPageRow = {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscSnapshotPayload = {
  period: string;
  capturedAt: string;
  lookbackDays: number;
  siteUrl: string;
  queries: GscSnapshotRow[];
  pages: GscSnapshotPageRow[];
};

function resolveSnapshotsDir(): string {
  const envPath = process.env.GSC_SNAPSHOTS_DIR?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "gsc-snapshots");
}

function snapshotPath(period: string): string {
  return path.join(resolveSnapshotsDir(), `${period}.json`);
}

export function loadGscSnapshot(period: string): GscSnapshotPayload | null {
  const filePath = snapshotPath(period);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as GscSnapshotPayload;
  } catch {
    return null;
  }
}

export function writeGscSnapshot(payload: GscSnapshotPayload): string {
  const dir = resolveSnapshotsDir();
  fs.mkdirSync(dir, { recursive: true });
  const filePath = snapshotPath(payload.period);
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}

/** Previous calendar month as YYYY-MM from a given period. */
export function previousPeriod(period: string): string {
  const [yearStr, monthStr] = period.split("-");
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new Error(`Invalid period: ${period}`);
  }
  const date = new Date(Date.UTC(year, month - 2, 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function currentPeriod(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function periodToSlugSuffix(period: string): string {
  const [yearStr, monthStr] = period.split("-");
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const name = monthNames[monthIndex] ?? "unknown";
  return `${name}-${yearStr}`;
}

export function periodToTitleLabel(period: string): string {
  const [yearStr, monthStr] = period.split("-");
  const monthIndex = Number.parseInt(monthStr, 10) - 1;
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const name = monthNames[monthIndex] ?? period;
  return `${name} ${yearStr}`;
}
