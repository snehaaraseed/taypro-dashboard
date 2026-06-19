import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { passesSeoKeywordFilters } from "@/lib/seo/keyword-filters";
import type { SeoKeywordRow } from "@/lib/seo/keyword-stats";

export type SeoKeywordExpansionEntry = SeoKeywordRow & {
  cluster?: string;
};

export type SeoKeywordExpansionFile = {
  description?: string;
  generatedAt?: string;
  count?: number;
  keywords: SeoKeywordExpansionEntry[];
};

let cachedExpansion: SeoKeywordExpansionEntry[] | null = null;

function resolveExpansionPath(): string {
  const envPath = process.env.SEO_KEYWORDS_EXPANSION_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-keywords-expansion.json");
}

/** Programmatic keyword pool (generic + utility + rooftop); CSV rows win on duplicates. */
export function loadSeoKeywordExpansion(): SeoKeywordExpansionEntry[] {
  if (cachedExpansion) return cachedExpansion;

  const filePath = resolveExpansionPath();
  if (!fs.existsSync(filePath)) {
    cachedExpansion = [];
    return cachedExpansion;
  }

  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as SeoKeywordExpansionFile;
    const list = Array.isArray(raw.keywords) ? raw.keywords : [];
    cachedExpansion = list
      .map((row): SeoKeywordExpansionEntry | null => {
        const keyword = row.keyword?.toLowerCase().trim();
        if (!keyword || !passesSeoKeywordFilters(keyword)) return null;
        return {
          keyword,
          volumeBucket: row.volumeBucket > 0 ? row.volumeBucket : 50,
          competition: row.competition || "Low",
          competitionIndex:
            Number.isFinite(row.competitionIndex) && row.competitionIndex >= 0
              ? row.competitionIndex
              : 20,
          cluster: row.cluster,
        };
      })
      .filter((row): row is SeoKeywordExpansionEntry => row !== null);
  } catch {
    cachedExpansion = [];
  }

  return cachedExpansion;
}

export function clearSeoKeywordExpansionCache(): void {
  cachedExpansion = null;
}
