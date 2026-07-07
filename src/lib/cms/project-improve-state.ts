import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export type ProjectImproveSlugState = {
  /** Next narrative angle index to try (rotates on each failed attempt). */
  nextAngle: number;
  /** Consecutive runs that did not complete this slug (deprioritize in queue). */
  failStreak: number;
  lastError?: string;
  updatedAt: string;
};

type ImproveStateFile = Record<string, ProjectImproveSlugState>;

function statePath(): string {
  return path.join(
    getDeploymentRoot(),
    ".runtime",
    "project-improve",
    "state.json"
  );
}

function readState(): ImproveStateFile {
  const file = statePath();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as ImproveStateFile;
  } catch {
    return {};
  }
}

function writeState(state: ImproveStateFile): void {
  const file = statePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

export function getProjectImproveSlugState(
  slug: string
): ProjectImproveSlugState | null {
  return readState()[slug] ?? null;
}

export function recordProjectImproveFailure(
  slug: string,
  nextAngle: number,
  error: string
): void {
  const state = readState();
  const prev = state[slug];
  state[slug] = {
    nextAngle,
    failStreak: (prev?.failStreak ?? 0) + 1,
    lastError: error.slice(0, 500),
    updatedAt: new Date().toISOString(),
  };
  writeState(state);
}

export function clearProjectImproveSlugState(slug: string): void {
  const state = readState();
  if (!state[slug]) return;
  delete state[slug];
  writeState(state);
}

export function loadProjectImproveFailStreaks(): Map<string, number> {
  const state = readState();
  return new Map(
    Object.entries(state).map(([slug, s]) => [slug, s.failStreak ?? 0])
  );
}
