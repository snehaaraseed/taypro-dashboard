import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { loadSeoKeywordRows } from "@/lib/seo/keyword-stats";
import {
  getCoveredIntentFamilySet,
  type KeywordIntentRecord,
} from "@/lib/seo/keyword-intent-registry";
import {
  inferIntentFamilyFromTitle,
  type SearchIntentFamily,
} from "@/lib/seo/keyword-intent-taxonomy";

export type GscIntentGap = {
  query: string;
  matchedKeyword: string;
  intentFamily: SearchIntentFamily;
  impressions: number;
  position: number;
  score: number;
  covered: boolean;
};

type GscReportRow = {
  query?: string;
  impressions?: number;
  position?: number;
  score?: number;
};

function resolveReportPath(): string {
  const envPath = process.env.GSC_LATEST_REPORT_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "gsc-latest-report.json");
}

function matchQueryToKeyword(
  query: string,
  keywords: string[]
): string | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let best: { keyword: string; score: number } | null = null;
  for (const keyword of keywords) {
    const k = keyword.toLowerCase();
    if (q === k) return k;
    if (q.includes(k) || k.includes(q)) {
      const score = Math.min(q.length, k.length);
      if (!best || score > best.score) best = { keyword: k, score };
      continue;
    }
    const qWords = q.split(/\s+/).filter((w) => w.length > 3);
    const kWords = k.split(/\s+/).filter((w) => w.length > 3);
    const overlap = qWords.filter((w) => kWords.includes(w)).length;
    if (overlap >= 2) {
      const score = overlap * 10;
      if (!best || score > best.score) best = { keyword: k, score };
    }
  }
  return best?.keyword ?? null;
}

let cachedGaps: GscIntentGap[] | null = null;

export function loadGscIntentGaps(): GscIntentGap[] {
  if (cachedGaps) return cachedGaps;

  const filePath = resolveReportPath();
  if (!fs.existsSync(filePath)) {
    cachedGaps = [];
    return cachedGaps;
  }

  // Reentrancy guard: loadSeoKeywordRows() scores rows via getGscIntentGapScoreBoost()
  // which calls back into this function before the first load finishes.
  cachedGaps = [];

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      topOpportunities?: GscReportRow[];
    };
    const rows = Array.isArray(raw.topOpportunities) ? raw.topOpportunities : [];
    const keywords = loadSeoKeywordRows().map((r) => r.keyword);
    const gaps: GscIntentGap[] = [];

    for (const row of rows) {
      const query = row.query?.trim();
      if (!query) continue;
      const matchedKeyword = matchQueryToKeyword(query, keywords);
      if (!matchedKeyword) continue;

      const intentFamily =
        inferIntentFamilyFromTitle(query) ?? "technical_howto";
      const covered = getCoveredIntentFamilySet(matchedKeyword).has(intentFamily);

      gaps.push({
        query,
        matchedKeyword,
        intentFamily,
        impressions: row.impressions ?? 0,
        position: row.position ?? 99,
        score: row.score ?? row.impressions ?? 0,
        covered,
      });
    }

    cachedGaps = gaps.sort((a, b) => b.score - a.score);
    return cachedGaps;
  } catch {
    cachedGaps = [];
    return cachedGaps;
  }
}

export function invalidateGscIntentGapsCache(): void {
  cachedGaps = null;
}

/** Boost keyword ranking when GSC shows uncovered intent impressions. */
export function getGscIntentGapScoreBoost(keyword: string): number {
  const k = keyword.toLowerCase().trim();
  let boost = 0;
  for (const gap of loadGscIntentGaps()) {
    if (gap.matchedKeyword !== k || gap.covered) continue;
    boost += Math.min(800, Math.floor(gap.impressions / 2));
    if (gap.position <= 15) boost += 200;
  }
  return boost;
}

/** Best GSC-suggested intent family for a keyword (uncovered gaps only). */
export function gscSuggestedIntentForKeyword(
  keyword: string
): SearchIntentFamily | null {
  const k = keyword.toLowerCase().trim();
  const uncovered = loadGscIntentGaps().filter(
    (g) => g.matchedKeyword === k && !g.covered
  );
  if (uncovered.length === 0) return null;
  uncovered.sort((a, b) => b.score - a.score);
  return uncovered[0]?.intentFamily ?? null;
}

export function formatGscIntentGapsForPrompt(limit = 8): string {
  const gaps = loadGscIntentGaps()
    .filter((g) => !g.covered)
    .slice(0, limit);
  if (gaps.length === 0) return "";

  const lines = gaps.map(
    (g) =>
      `- "${g.matchedKeyword}" needs ${g.intentFamily} (GSC: "${g.query}" — ${g.impressions} imp, pos ${g.position.toFixed(1)})`
  );
  return `GSC INTENT GAPS (queries with impressions but no matching cluster post yet):
${lines.join("\n")}`;
}

export function listGscIntentGapsForKeyword(keyword: string): GscIntentGap[] {
  const k = keyword.toLowerCase().trim();
  return loadGscIntentGaps().filter((g) => g.matchedKeyword === k);
}
