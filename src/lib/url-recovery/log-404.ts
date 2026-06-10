import "server-only";

import fs from "node:fs";
import path from "node:path";
import { normalizePath } from "@/lib/url-recovery/normalize";

type HitEntry = {
  path: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  suggestedTarget?: string;
};

type HitsFile = {
  description: string;
  updatedAt: string;
  hits: Record<string, HitEntry>;
};

const HITS_PATH = path.join(process.cwd(), "data/404-hits.json");

function readHits(): HitsFile {
  try {
    const raw = fs.readFileSync(HITS_PATH, "utf8");
    const parsed = JSON.parse(raw) as HitsFile;
    if (parsed.hits && typeof parsed.hits === "object") return parsed;
  } catch {
    // start fresh when missing or invalid
  }
  return {
    description:
      "Aggregated 404 paths for redirect-candidate review (see scripts/merge-404-redirect-candidates.mjs).",
    updatedAt: new Date().toISOString(),
    hits: {},
  };
}

/** Best-effort append to data/404-hits.json (skipped on read-only filesystems). */
export async function log404Hit(
  logicalPath: string,
  suggestedTarget?: string
): Promise<void> {
  if (process.env.URL_RECOVERY_LOG_404 === "0") return;

  const normalized = normalizePath(logicalPath);
  if (!normalized || normalized === "/") return;

  try {
    const file = readHits();
    const now = new Date().toISOString();
    const existing = file.hits[normalized];

    file.hits[normalized] = {
      path: normalized,
      count: (existing?.count ?? 0) + 1,
      firstSeen: existing?.firstSeen ?? now,
      lastSeen: now,
      suggestedTarget: suggestedTarget ?? existing?.suggestedTarget,
    };
    file.updatedAt = now;

    fs.mkdirSync(path.dirname(HITS_PATH), { recursive: true });
    fs.writeFileSync(HITS_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  } catch {
    // ignore on serverless / read-only volumes
  }
}
