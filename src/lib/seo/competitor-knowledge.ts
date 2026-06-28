import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

export type CompetitorRecord = {
  id: string;
  name: string;
  hq?: string;
  founded?: number;
  website?: string;
  segment?: string[];
  cleaningTechnology?: string;
  products?: unknown;
  indiaPresence?: string;
  commercialModel?: string[];
  publicProof?: string[];
  strengths?: string[];
  limitationsVsTaypro?: string[];
  sources?: string[];
};

export type CompetitorLandscape = {
  meta: {
    lastResearched: string;
    scope: string;
    purpose: string;
    disclaimer: string;
  };
  indiaMarketContext: {
    summary: string;
    rankingSources: {
      source: string;
      url: string;
      topFive: {
        rank: number;
        name: string;
        approxShare?: string;
        notable?: string;
      }[];
      note?: string;
    }[];
    commonBuyerCriteria: string[];
  };
  tayproPositioning: {
    category: string;
    differentiators: string[];
    whenTayproWins: string[];
  };
  competitors: CompetitorRecord[];
  categoryComparisonFramework: {
    dimensions: { key: string; options: string[] }[];
    blogUsageRules: string[];
  };
};

let cachedLandscape: CompetitorLandscape | null = null;

export function loadCompetitorLandscape(): CompetitorLandscape | null {
  if (cachedLandscape) return cachedLandscape;

  const filePath = path.join(getDeploymentRoot(), "data", "competitor-landscape.json");
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    cachedLandscape = JSON.parse(raw) as CompetitorLandscape;
    return cachedLandscape;
  } catch {
    return null;
  }
}

function formatProducts(products: unknown): string {
  if (!products) return "n/a";
  if (Array.isArray(products)) {
    return products
      .map((item) =>
        typeof item === "string"
          ? item
          : typeof item === "object" && item && "name" in item
            ? `${(item as { name: string; notes?: string }).name}${
                (item as { notes?: string }).notes
                  ? ` (${(item as { notes?: string }).notes})`
                  : ""
              }`
            : JSON.stringify(item)
      )
      .join("; ");
  }
  return String(products);
}

function formatCompetitorBlock(c: CompetitorRecord): string {
  const lines = [
    `- ${c.name} (${c.id})`,
    `  HQ: ${c.hq ?? "n/a"} | Segment: ${c.segment?.join(", ") ?? "n/a"}`,
    `  Technology: ${c.cleaningTechnology ?? "n/a"}`,
    `  Products: ${formatProducts(c.products)}`,
    `  India: ${c.indiaPresence ?? "n/a"}`,
    `  Model: ${c.commercialModel?.join(", ") ?? "n/a"}`,
  ];

  if (c.publicProof?.length) {
    lines.push(`  Proof (public): ${c.publicProof.slice(0, 3).join(" | ")}`);
  }
  if (c.strengths?.length) {
    lines.push(`  Strengths: ${c.strengths.join("; ")}`);
  }
  if (c.limitationsVsTaypro?.length) {
    lines.push(`  Taypro angle: ${c.limitationsVsTaypro.join("; ")}`);
  }

  return lines.join("\n");
}

/**
 * Compact competitor landscape for blog/project AI prompts.
 * Factual only, specs and share figures must match data/competitor-landscape.json.
 */
export function formatCompetitorKnowledgeBlock(): string {
  const landscape = loadCompetitorLandscape();
  if (!landscape) return "";

  const { meta, indiaMarketContext, tayproPositioning, competitors, categoryComparisonFramework } =
    landscape;

  const rankingBlock = indiaMarketContext.rankingSources
    .map((r) => {
      const leaders = r.topFive
        .map((t) => `${t.rank}. ${t.name}${t.approxShare ? ` (${t.approxShare})` : ""}`)
        .join(", ");
      return `  - ${r.source}: ${leaders}${r.note ? `, ${r.note}` : ""}`;
    })
    .join("\n");

  const competitorBlocks = competitors.map(formatCompetitorBlock).join("\n");

  const rules = categoryComparisonFramework.blogUsageRules
    .map((r) => `- ${r}`)
    .join("\n");

  const whenTayproWins = tayproPositioning.whenTayproWins
    .map((w) => `- ${w}`)
    .join("\n");

  return `COMPETITOR LANDSCAPE (researched ${meta.lastResearched}; ${meta.disclaimer})

INDIA MARKET:
${indiaMarketContext.summary}

Shipment / share roundups (cite source year if used):
${rankingBlock}

Buyer criteria: ${indiaMarketContext.commonBuyerCriteria.join("; ")}

TAYPRO VS MARKET (use with PRODUCT KNOWLEDGE + PUBLIC PROOF):
- Category: ${tayproPositioning.category}
- Differentiators: ${tayproPositioning.differentiators.join("; ")}
When Taypro is the better fit:
${whenTayproWins}

TRACKED COMPETITORS (${competitors.length}):
${competitorBlocks}

COMPARISON BLOG RULES:
${rules}`;
}

/** Reset in-memory cache (tests or after data file refresh). */
export function clearCompetitorLandscapeCache(): void {
  cachedLandscape = null;
}
