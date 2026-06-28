import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { createSlug } from "@/app/utils/blogFileUtils";
import { readPublishedTopics } from "@/lib/cms/topicService";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";

/**
 * Validated, search-grounded blog briefs, the single source of truth for what
 * the daily automation writes. Every brief is backed by real demand evidence.
 */
export type DiscoveredBrief = {
  id: string;
  title: string;
  primaryKeyword: string;
  intentFamily: SearchIntentFamily;
  angleId: string;
  domainId: string;
  query: string;
  serpGap: string;
  peopleAlsoAsk: string[];
  freshnessNote?: string;
  sources: { title?: string; uri?: string }[];
  /** Validator quality score (higher = scheduled earlier). */
  score: number;
  discoveredAt: string;
};

export type DiscoveredBriefsFile = {
  version?: number;
  description?: string;
  generatedAt?: string;
  briefs: DiscoveredBrief[];
};

export type DiscoveredBriefsStateFile = {
  filled: { briefId: string; slug: string; filledAt: string }[];
  rejected: { briefId: string; reason: string; at: string }[];
};

function resolveQueuePath(): string {
  const env = process.env.DISCOVERED_BRIEFS_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "discovered-briefs.json");
}

function resolveStatePath(): string {
  const env = process.env.DISCOVERED_BRIEFS_STATE_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "discovered-briefs-state.json");
}

export function briefSlotKey(briefId: string): string {
  return `brief::${briefId}`;
}

export function loadDiscoveredBriefs(): DiscoveredBrief[] {
  const filePath = resolveQueuePath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as DiscoveredBriefsFile;
    return Array.isArray(raw.briefs) ? raw.briefs : [];
  } catch {
    return [];
  }
}

export function saveDiscoveredBriefs(briefs: DiscoveredBrief[]): void {
  const filePath = resolveQueuePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        version: 1,
        description:
          "Search-grounded, validated blog briefs. Refilled weekly by topic discovery; cron writes one per day.",
        generatedAt: new Date().toISOString(),
        briefs,
      },
      null,
      2
    )
  );
}

/** Add new briefs, de-duped by id and title. Returns count actually added. */
export function appendDiscoveredBriefs(incoming: DiscoveredBrief[]): number {
  const existing = loadDiscoveredBriefs();
  const byId = new Set(existing.map((b) => b.id));
  const byTitle = new Set(existing.map((b) => b.title.toLowerCase().trim()));
  let added = 0;
  for (const brief of incoming) {
    if (byId.has(brief.id)) continue;
    if (byTitle.has(brief.title.toLowerCase().trim())) continue;
    existing.push(brief);
    byId.add(brief.id);
    byTitle.add(brief.title.toLowerCase().trim());
    added += 1;
  }
  existing.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  saveDiscoveredBriefs(existing);
  return added;
}

export function loadDiscoveredBriefsState(): DiscoveredBriefsStateFile {
  const filePath = resolveStatePath();
  if (!fs.existsSync(filePath)) return { filled: [], rejected: [] };
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as DiscoveredBriefsStateFile;
    return {
      filled: Array.isArray(raw.filled) ? raw.filled : [],
      rejected: Array.isArray(raw.rejected) ? raw.rejected : [],
    };
  } catch {
    return { filled: [], rejected: [] };
  }
}

export function saveDiscoveredBriefsState(state: DiscoveredBriefsStateFile): void {
  const filePath = resolveStatePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

export function listFilledBriefIds(): Set<string> {
  return new Set(loadDiscoveredBriefsState().filled.map((r) => r.briefId));
}

export function listRejectedBriefIds(): Set<string> {
  return new Set(loadDiscoveredBriefsState().rejected.map((r) => r.briefId));
}

export function markBriefFilled(briefId: string, slug: string): void {
  const state = loadDiscoveredBriefsState();
  state.filled = state.filled.filter((r) => r.briefId !== briefId);
  state.filled.push({ briefId, slug, filledAt: new Date().toISOString() });
  saveDiscoveredBriefsState(state);
}

export function markBriefRejected(briefId: string, reason: string): void {
  const state = loadDiscoveredBriefsState();
  if (state.rejected.some((r) => r.briefId === briefId)) return;
  state.rejected.push({
    briefId,
    reason: reason.slice(0, 300),
    at: new Date().toISOString(),
  });
  saveDiscoveredBriefsState(state);
}

export function getBriefById(briefId: string): DiscoveredBrief | null {
  return loadDiscoveredBriefs().find((b) => b.id === briefId) ?? null;
}

export function sortedBriefQueue(): DiscoveredBrief[] {
  return [...loadDiscoveredBriefs()].sort(
    (a, b) => b.score - a.score || a.id.localeCompare(b.id)
  );
}

async function publishedBlocklist(): Promise<Set<string>> {
  const blocked = new Set<string>();
  const topics = await readPublishedTopics();
  for (const t of topics) {
    blocked.add(t.slug.toLowerCase());
    blocked.add(t.title.toLowerCase().trim());
  }
  return blocked;
}

export type PickBriefOptions = {
  rejectedSlotKeys?: string[];
  excludeBriefIds?: string[];
  briefId?: string | null;
};

/** Next open, unpublished, non-rejected brief (primary automation source). */
export async function pickNextBrief(
  options?: PickBriefOptions
): Promise<DiscoveredBrief | null> {
  const rejectedSlots = new Set(options?.rejectedSlotKeys ?? []);
  const exclude = new Set(options?.excludeBriefIds ?? []);
  const filled = listFilledBriefIds();
  const rejected = listRejectedBriefIds();
  const published = await publishedBlocklist();

  const queue = options?.briefId
    ? [getBriefById(options.briefId)].filter(Boolean) as DiscoveredBrief[]
    : sortedBriefQueue();

  for (const brief of queue) {
    if (filled.has(brief.id) || rejected.has(brief.id) || exclude.has(brief.id)) {
      continue;
    }
    if (rejectedSlots.has(briefSlotKey(brief.id))) continue;
    const slugGuess = createSlug(brief.title);
    if (
      published.has(slugGuess) ||
      published.has(brief.title.toLowerCase().trim())
    ) {
      continue;
    }
    return brief;
  }
  return null;
}

export function countBriefStats(): {
  total: number;
  filled: number;
  rejected: number;
  open: number;
} {
  const total = loadDiscoveredBriefs().length;
  const filled = listFilledBriefIds().size;
  const rejected = listRejectedBriefIds().size;
  return { total, filled, rejected, open: Math.max(0, total - filled - rejected) };
}
