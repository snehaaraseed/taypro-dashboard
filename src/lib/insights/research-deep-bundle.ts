import "server-only";

import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import { runGroundedFactResearch, formatFactBriefForPrompt } from "@/lib/gemini/grounded-fact-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import { runGroundedSerpResearch } from "@/lib/gemini/grounded-serp-research";
import type { ResearchTopicConfig } from "@/lib/insights/research-topics-config";

export type DeepResearchBundle = {
  serpBrief: SerpResearchBrief;
  factBriefs: FactResearchBrief[];
};

async function withGroundingRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 2
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`[deep-research] ${label} attempt ${i + 1} failed:`, error);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Multi-pass Google Search grounding before long-form writing.
 * 1× SERP + 3× focused fact passes (regulatory, operations, economics).
 */
export async function runDeepResearchBundle(
  topic: ResearchTopicConfig
): Promise<DeepResearchBundle> {
  const serpBrief = await withGroundingRetry("serp", () =>
    runGroundedSerpResearch({
      keyword: topic.keyword,
      angle: topic.angle,
      audience: topic.audience,
      serpCallsSoFar: 0,
      insightsMode: true,
    })
  );

  const shared = {
    commonH2Themes: serpBrief.commonH2Themes,
    serpGaps: serpBrief.serpGaps,
    insightsMode: true as const,
  };

  const factBriefs: FactResearchBrief[] = [];

  factBriefs.push(
    await withGroundingRetry("facts-core", () =>
      runGroundedFactResearch({
        keyword: topic.keyword,
        title: topic.titleStem, ...shared,
        serpCallsSoFar: 1,
      })
    )
  );

  factBriefs.push(
    await withGroundingRetry("facts-regulatory", () =>
      runGroundedFactResearch({
        keyword: `${topic.keyword} MNRE CEA regulations India solar`,
        title: `${topic.titleStem}, regulatory & policy data`, ...shared,
        serpCallsSoFar: 2,
        factFocus:
          "MNRE, CEA, state DISCOM/water policy, environmental compliance, recent circulars with year",
      })
    )
  );

  factBriefs.push(
    await withGroundingRetry("facts-operations", () =>
      runGroundedFactResearch({
        keyword: `${topic.keyword} operations case study India MW plant`,
        title: `${topic.titleStem}, field operations & deployments`, ...shared,
        serpCallsSoFar: 3,
        factFocus:
          "real utility-scale deployments, robot vs manual comparisons, tracker cleaning, O&M labour, cleaning frequency",
      })
    )
  );

  return { serpBrief, factBriefs };
}

export function formatAllFactBriefsForPrompt(briefs: FactResearchBrief[]): string {
  return briefs
    .map((b, i) => `--- Fact research pass ${i + 1} ---\n${formatFactBriefForPrompt(b)}`)
    .join("\n\n");
}
