import "server-only";

import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import {
  runDeepResearchBundle,
  type DeepResearchBundle,
} from "@/lib/insights/research-deep-bundle";
import { planResearchReport } from "@/lib/insights/research-report-planner";
import { writeResearchReportBody } from "@/lib/insights/research-report-section-writer";
import {
  buildDeterministicSourcesSection,
  mergeResearchSources,
} from "@/lib/insights/research-insight-validator";
import { buildResearchRoiReferenceTable } from "@/lib/insights/research-roi-reference";
import { sanitizeResearchReportHtml } from "@/lib/insights/research-html-sanitize";
import type { ResearchTopicConfig } from "@/lib/insights/research-topics-config";
import {
  buildMonthlyReportDescription,
  buildMonthlyReportTitle,
} from "@/lib/insights/research-topics-config";
import type { ResearchReportPlan } from "@/lib/insights/research-report-planner";

export type ResearchInsightArtifacts = {
  topic: ResearchTopicConfig;
  period: string;
  slug: string;
  title: string;
  description: string;
  plan: ResearchReportPlan;
  generatedAt: string;
  serpBrief: SerpResearchBrief;
  factBriefs: FactResearchBrief[];
  content: string;
  wordCount: number;
};

export async function generateResearchInsightContent(
  topic: ResearchTopicConfig,
  period: string,
  options?: {
    /** Reuse an already-run grounding bundle (avoids re-grounding on retries). */
    bundle?: DeepResearchBundle;
    /** Prior-edition section themes the planner must avoid reusing. */
    priorEditionThemes?: string[];
  }
): Promise<ResearchInsightArtifacts> {
  const generatedAt = new Date().toISOString();
  const title = buildMonthlyReportTitle(topic, period);
  const description = buildMonthlyReportDescription(topic, period);

  let bundle = options?.bundle;
  if (!bundle) {
    console.info(`[research-insight] Deep research: ${topic.id} (${period})`);
    bundle = await runDeepResearchBundle(topic);
  }
  const { serpBrief, factBriefs } = bundle;

  console.info("[research-insight] Planning report outline…");
  const plan = await planResearchReport(
    topic,
    period,
    serpBrief,
    factBriefs,
    options?.priorEditionThemes ?? []
  );

  console.info(
    `[research-insight] Writing ${plan.h2Outline.length} sections…`
  );
  const bodyHtml = await writeResearchReportBody(
    topic,
    plan,
    serpBrief,
    factBriefs
  );

  const roiTable = buildResearchRoiReferenceTable();
  const allSources = mergeResearchSources(serpBrief, ...factBriefs);
  const sourcesSection = buildDeterministicSourcesSection(
    allSources,
    generatedAt
  );

  const content = sanitizeResearchReportHtml(
    [
      `<p class="insights-lede"><strong>Monthly research report</strong>, ${topic.angle}. This ${period} edition is written for ${topic.audience} and grounded in live web research plus Taypro&apos;s ROI models.</p>`,
      bodyHtml,
      roiTable,
      sourcesSection,
    ].join("\n\n")
  );

  const wordCount = content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    topic,
    period,
    slug: "", // filled by caller
    title: plan.title || title,
    description: plan.description || description,
    plan,
    generatedAt,
    serpBrief,
    factBriefs,
    content,
    wordCount,
  };
}

export function buildResearchInsightMetricsJson(
  artifacts: ResearchInsightArtifacts
): string {
  return JSON.stringify({
    type: "monthly_research_report",
    pipeline:
      "4× grounded search → plan (10–12 H2) → section writer (6+ chunks) → ROI table → validator",
    topicId: artifacts.topic.id,
    keyword: artifacts.topic.keyword,
    period: artifacts.period,
    generatedAt: artifacts.generatedAt,
    wordCount: artifacts.wordCount,
    h2Count: artifacts.plan.h2Outline.length,
    serpModel: artifacts.serpBrief.model,
    factModels: artifacts.factBriefs.map((f) => f.model),
    webSearchQueries: [
      ...artifacts.serpBrief.webSearchQueries, ...artifacts.factBriefs.flatMap((f) => f.webSearchQueries),
    ],
    sourceCount: mergeResearchSources(
      artifacts.serpBrief, ...artifacts.factBriefs
    ).length,
    readerQuestions: artifacts.plan.readerQuestions,
  });
}
