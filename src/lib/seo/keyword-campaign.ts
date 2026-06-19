import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import {
  buildSlotCatalog,
  loadFilledSlotKeys,
  loadPermanentFailedSlotKeys,
} from "@/lib/seo/coverage-ledger";
import type { GscOpportunity } from "@/lib/seo/gsc-sync";
import {
  loadSeoKeywordRows,
  type SeoKeywordRow,
} from "@/lib/seo/keyword-stats";
import { loadSeoBlogQueueKeywords } from "@/lib/seo/seo-blog-queue";

export type KeywordCampaignStatus = "eligible" | "cooldown" | "saturated";

export type KeywordCampaignEntry = {
  keyword: string;
  gscQuery: string | null;
  lastPosition: number | null;
  lastImpressions: number;
  gscReason: GscOpportunity["reason"] | null;
  gscScore: number;
  lastBlogSlug: string | null;
  lastBlogPublishedAt: string | null;
  nextReviewAfter: string | null;
  status: KeywordCampaignStatus;
};

export type KeywordCampaignFile = {
  description?: string;
  updatedAt: string | null;
  entries: KeywordCampaignEntry[];
};

export type CampaignPreview = {
  eligibleCount: number;
  cooldownCount: number;
  saturatedCount: number;
  totalCount: number;
};

let cachedFile: KeywordCampaignFile | null = null;

function resolveCampaignPath(): string {
  const envPath = process.env.SEO_KEYWORD_CAMPAIGNS_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-keyword-campaigns.json");
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getCampaignCooldownDays(): number {
  return envInt("SEO_CAMPAIGN_COOLDOWN_DAYS", 21);
}

export function isKeywordCampaignEnabled(): boolean {
  const raw = process.env.SEO_CAMPAIGN_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0") return false;
  if (raw === "true" || raw === "1") return true;
  return fs.existsSync(resolveCampaignPath());
}

export function invalidateKeywordCampaignCache(): void {
  cachedFile = null;
}

function readCampaignFile(): KeywordCampaignFile {
  if (cachedFile) return cachedFile;
  const filePath = resolveCampaignPath();
  if (!fs.existsSync(filePath)) {
    cachedFile = { updatedAt: null, entries: [] };
    return cachedFile;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as KeywordCampaignFile;
    cachedFile = {
      description: raw.description,
      updatedAt: raw.updatedAt ?? null,
      entries: Array.isArray(raw.entries) ? raw.entries : [],
    };
    return cachedFile;
  } catch {
    cachedFile = { updatedAt: null, entries: [] };
    return cachedFile;
  }
}

function writeCampaignFile(data: KeywordCampaignFile): void {
  const filePath = resolveCampaignPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const payload: KeywordCampaignFile = {
    description:
      data.description ??
      "GSC-driven keyword campaigns with post-publish cooldown. Refreshed weekly via sync-gsc; updated on blog publish.",
    updatedAt: data.updatedAt,
    entries: data.entries,
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  cachedFile = payload;
}

/** Map a GSC query string to the closest seo-keywords.csv row. */
export function mapGscQueryToSeoKeyword(
  query: string,
  rows: SeoKeywordRow[]
): string | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  const byKeyword = new Map(rows.map((r) => [r.keyword.toLowerCase(), r.keyword]));
  if (byKeyword.has(q)) return byKeyword.get(q)!;

  let best: string | null = null;
  let bestLen = 0;

  for (const row of rows) {
    const kw = row.keyword.toLowerCase();
    if (kw.length < 8 && q.length >= 8) continue;

    if (q.includes(kw) && kw.length > bestLen) {
      best = row.keyword;
      bestLen = kw.length;
      continue;
    }
    if (kw.includes(q) && q.length >= 8 && q.length > bestLen) {
      best = row.keyword;
      bestLen = q.length;
    }
  }

  return best;
}

function isInCooldown(entry: KeywordCampaignEntry, now = new Date()): boolean {
  if (!entry.nextReviewAfter) return false;
  const review = new Date(entry.nextReviewAfter);
  return review.getTime() > now.getTime();
}

function computeStatus(
  entry: KeywordCampaignEntry,
  now = new Date()
): KeywordCampaignStatus {
  if (entry.status === "saturated") return "saturated";
  if (isInCooldown(entry, now)) return "cooldown";
  return "eligible";
}

function queueOrderIndex(keyword: string): number {
  const queue = loadSeoBlogQueueKeywords();
  const idx = queue.indexOf(keyword.toLowerCase().trim());
  return idx >= 0 ? idx : 9999;
}

async function keywordsWithOpenSlots(): Promise<Set<string>> {
  const filled = await loadFilledSlotKeys();
  const permanentFailed = await loadPermanentFailedSlotKeys();
  const open = new Set<string>();
  for (const slot of buildSlotCatalog()) {
    if (filled.has(slot.slotKey)) continue;
    if (permanentFailed.has(slot.slotKey)) continue;
    open.add(slot.keyword.toLowerCase().trim());
  }
  return open;
}

/** Upsert GSC metrics; preserve publish/cooldown fields. */
export function refreshKeywordCampaignsFromGsc(
  opportunities: GscOpportunity[]
): KeywordCampaignFile {
  const rows = loadSeoKeywordRows();
  const file = readCampaignFile();
  const byKeyword = new Map<string, KeywordCampaignEntry>(
    file.entries.map((e) => [e.keyword.toLowerCase(), e])
  );
  const now = new Date();

  for (const opp of opportunities) {
    const keyword = mapGscQueryToSeoKeyword(opp.query, rows);
    if (!keyword) continue;

    const key = keyword.toLowerCase();
    const existing = byKeyword.get(key);

    const merged: KeywordCampaignEntry = {
      keyword: key,
      gscQuery: opp.query,
      lastPosition: opp.position,
      lastImpressions: opp.impressions,
      gscReason: opp.reason,
      gscScore: opp.score,
      lastBlogSlug: existing?.lastBlogSlug ?? null,
      lastBlogPublishedAt: existing?.lastBlogPublishedAt ?? null,
      nextReviewAfter: existing?.nextReviewAfter ?? null,
      status: existing?.status ?? "eligible",
    };
    merged.status = computeStatus(merged, now);
    byKeyword.set(key, merged);
  }

  // Seed queue keywords without GSC row yet (eligible, score 0)
  for (const kw of loadSeoBlogQueueKeywords()) {
    const key = kw.toLowerCase().trim();
    if (!key || byKeyword.has(key)) continue;
    if (!rows.some((r) => r.keyword.toLowerCase() === key)) continue;
    byKeyword.set(key, {
      keyword: key,
      gscQuery: null,
      lastPosition: null,
      lastImpressions: 0,
      gscReason: null,
      gscScore: 0,
      lastBlogSlug: null,
      lastBlogPublishedAt: null,
      nextReviewAfter: null,
      status: "eligible",
    });
  }

  const entries = [...byKeyword.values()].sort(
    (a, b) => b.gscScore - a.gscScore || queueOrderIndex(a.keyword) - queueOrderIndex(b.keyword)
  );

  const updated: KeywordCampaignFile = {
    description: file.description,
    updatedAt: now.toISOString(),
    entries,
  };
  writeCampaignFile(updated);
  return updated;
}

export function getKeywordCampaignEntry(
  keyword: string
): KeywordCampaignEntry | null {
  const key = keyword.toLowerCase().trim();
  return readCampaignFile().entries.find((e) => e.keyword === key) ?? null;
}

export function getCampaignPreview(): CampaignPreview {
  const file = readCampaignFile();
  let eligibleCount = 0;
  let cooldownCount = 0;
  let saturatedCount = 0;
  for (const e of file.entries) {
    const status = computeStatus(e);
    if (status === "eligible") eligibleCount++;
    else if (status === "cooldown") cooldownCount++;
    else saturatedCount++;
  }
  return {
    eligibleCount,
    cooldownCount,
    saturatedCount,
    totalCount: file.entries.length,
  };
}

export type PickFocusKeywordOptions = {
  excludeKeywords?: string[];
};

/** Highest-score eligible keyword with open coverage slots. */
export async function pickFocusKeywordForToday(
  options?: PickFocusKeywordOptions
): Promise<string | null> {
  if (!isKeywordCampaignEnabled()) return null;

  const file = readCampaignFile();
  if (file.entries.length === 0) return null;

  const excluded = new Set(
    (options?.excludeKeywords ?? []).map((k) => k.toLowerCase().trim()).filter(Boolean)
  );
  const openKeywords = await keywordsWithOpenSlots();
  const now = new Date();

  const candidates = file.entries.filter((entry) => {
    const key = entry.keyword.toLowerCase();
    if (excluded.has(key)) return false;
    if (!openKeywords.has(key)) return false;
    if (computeStatus(entry, now) !== "eligible") return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort(
    (a, b) =>
      b.gscScore - a.gscScore ||
      queueOrderIndex(a.keyword) - queueOrderIndex(b.keyword)
  );

  return candidates[0].keyword;
}

export function markCampaignPublished(
  keyword: string,
  input: { slug: string; positionAtPublish?: number | null }
): void {
  const key = keyword.toLowerCase().trim();
  if (!key) return;

  const file = readCampaignFile();
  const now = new Date();
  const cooldownDays = getCampaignCooldownDays();
  const nextReview = new Date(now);
  nextReview.setUTCDate(nextReview.getUTCDate() + cooldownDays);

  const existing = file.entries.find((e) => e.keyword === key);
  const entry: KeywordCampaignEntry = existing
    ? { ...existing }
    : {
        keyword: key,
        gscQuery: null,
        lastPosition: null,
        lastImpressions: 0,
        gscReason: null,
        gscScore: 0,
        lastBlogSlug: null,
        lastBlogPublishedAt: null,
        nextReviewAfter: null,
        status: "eligible",
      };

  entry.lastBlogSlug = input.slug;
  entry.lastBlogPublishedAt = now.toISOString();
  entry.nextReviewAfter = nextReview.toISOString();
  if (input.positionAtPublish != null) {
    entry.lastPosition = input.positionAtPublish;
  }
  entry.status = "cooldown";

  const others = file.entries.filter((e) => e.keyword !== key);
  writeCampaignFile({
    ...file,
    updatedAt: now.toISOString(),
    entries: [...others, entry].sort(
      (a, b) => b.gscScore - a.gscScore || a.keyword.localeCompare(b.keyword)
    ),
  });
}
