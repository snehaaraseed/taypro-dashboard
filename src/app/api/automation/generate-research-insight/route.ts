import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAutomationAuthorized } from "@/lib/security";
import {
  createInsight,
  getInsightForPeriod,
  getPriorTopicEditions,
} from "@/lib/cms/insightService";
import {
  generateResearchInsightContent,
  buildResearchInsightMetricsJson,
  type ResearchInsightArtifacts,
} from "@/lib/insights/research-insight-generator";
import { runDeepResearchBundle } from "@/lib/insights/research-deep-bundle";
import {
  mergeResearchSources,
  validateResearchInsightContent,
} from "@/lib/insights/research-insight-validator";
import {
  checkEditionUniqueness,
  priorEditionH2Themes,
} from "@/lib/insights/research-edition-uniqueness";
import {
  judgeResearchInsight,
  researchJudgeBlocksPublish,
  researchJudgeFailureMessage,
} from "@/lib/insights/research-insight-judge";
import { sanitizeResearchReportHtml } from "@/lib/insights/research-html-sanitize";
import {
  pickResearchTopicForMonth,
  getResearchTopicById,
  buildMonthlyResearchSlug,
  type ResearchTopicId,
} from "@/lib/insights/research-topics-config";
import { currentPeriod } from "@/lib/insights/gsc-snapshots";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { INSIGHTS_HUB_PATH } from "@/lib/seo/insights-hub";
import { enqueueInsightTranslations } from "@/lib/translation/translation-queue";

const MAX_RESEARCH_ATTEMPTS = 2;

function monthIndexFromPeriod(period: string): number {
  const [year, month] = period.split("-").map(Number);
  return (year ?? 2026) * 12 + ((month ?? 1) - 1);
}

function resolveTopicForRun(topicParam: string | null, period: string) {
  if (topicParam) {
    const byId = getResearchTopicById(topicParam as ResearchTopicId);
    if (byId) return byId;
  }
  return pickResearchTopicForMonth(monthIndexFromPeriod(period));
}

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const topicParam = request.nextUrl.searchParams.get("topic");
  const period = currentPeriod();
  const slug = buildMonthlyResearchSlug(period);

  try {
    const existing = await getInsightForPeriod(period, "mini_study");
    if (existing && !force) {
      return NextResponse.json({
        success: false,
        jobComplete: true,
        message: `Research report for ${period} already published (${existing.slug}).`,
        period,
        slug: existing.slug,
      });
    }

    if (existing && force) {
      return NextResponse.json(
        {
          success: false,
          message: `Report for ${period} exists. Delete via /admin/insights before force regenerating.`,
          slug: existing.slug,
        },
        { status: 409 }
      );
    }

    const topic = resolveTopicForRun(topicParam, period);

    // Prior editions of this same topic (queue rotates annually), used to steer
    // the planner to a fresh angle and to block near-duplicate reports.
    const priorEditions = await getPriorTopicEditions(topic.id, slug);
    const priorThemes = priorEditionH2Themes(priorEditions);

    // Ground once; retries below reuse it (re-plan + re-write only).
    const bundle = await runDeepResearchBundle(topic);

    let artifacts: ResearchInsightArtifacts | null = null;
    let sourceUris: string[] = [];
    const gateFailures: string[] = [];

    for (let attempt = 1; attempt <= MAX_RESEARCH_ATTEMPTS; attempt++) {
      const candidate = await generateResearchInsightContent(topic, period, {
        bundle,
        priorEditionThemes: priorThemes,
      });
      candidate.slug = slug;
      candidate.content = sanitizeResearchReportHtml(candidate.content);

      const uris = mergeResearchSources(candidate.serpBrief, ...candidate.factBriefs)
        .map((s) => s.uri)
        .filter((u): u is string => Boolean(u));

      const validation = validateResearchInsightContent(candidate.content, {
        plan: candidate.plan,
        expectedSourceUris: uris,
      });
      if (!validation.ok) {
        gateFailures.push(`attempt ${attempt} structural: ${validation.errors.join("; ")}`);
        continue;
      }

      const uniqueness = checkEditionUniqueness(
        candidate.content,
        priorEditions
      );
      if (!uniqueness.unique) {
        gateFailures.push(
          `attempt ${attempt} duplicate of ${uniqueness.conflictSlug} ` +
            `(body ${uniqueness.maxBodySimilarity.toFixed(2)}, h2 ${uniqueness.maxH2Overlap.toFixed(2)})`
        );
        continue;
      }

      const judged = await judgeResearchInsight({
        title: candidate.title,
        audience: topic.audience,
        primaryKeyword: topic.keyword,
        content: candidate.content,
        readerQuestions: candidate.plan.readerQuestions,
        serpBrief: candidate.serpBrief,
        factBriefs: candidate.factBriefs,
      });
      if (researchJudgeBlocksPublish(judged)) {
        gateFailures.push(`attempt ${attempt} ${researchJudgeFailureMessage(judged)}`);
        continue;
      }

      artifacts = candidate;
      sourceUris = uris;
      break;
    }

    if (!artifacts) {
      console.error(
        "[generate-research-insight] all attempts failed quality gates:",
        gateFailures
      );
      return NextResponse.json(
        {
          success: false,
          message: "Research report failed quality gates, not published",
          errors: gateFailures,
        },
        { status: 422 }
      );
    }

    const now = new Date().toISOString();
    const created = await createInsight({
      slug,
      title: artifacts.title,
      description: artifacts.description,
      content: artifacts.content,
      reportType: "mini_study",
      period,
      metricsJson: buildResearchInsightMetricsJson(artifacts),
      published: true,
      publishDate: now,
    });

    if (!created.success) {
      return NextResponse.json(
        { success: false, message: created.error ?? "Failed to save insight" },
        { status: 500 }
      );
    }

    revalidatePath(INSIGHTS_HUB_PATH);
    revalidatePath(`${INSIGHTS_HUB_PATH}/${slug}`);
    revalidateSitemap();

    const translationsEnqueued = await enqueueInsightTranslations(slug);

    return NextResponse.json({
      success: true,
      slug,
      topicId: topic.id,
      period,
      wordCount: artifacts.wordCount,
      h2Sections: artifacts.plan.h2Outline.length,
      sourceCount: sourceUris.length,
      translationsEnqueued,
      message: "Monthly research report published",
    });
  } catch (error) {
    console.error("[generate-research-insight]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Research generation failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = currentPeriod();
  const topic = resolveTopicForRun(
    request.nextUrl.searchParams.get("topic"),
    period
  );
  const slug = buildMonthlyResearchSlug(period);
  const existing = await getInsightForPeriod(period, "mini_study");

  return NextResponse.json({
    period,
    slug,
    nextTopic: { id: topic.id, titleStem: topic.titleStem },
    existing: existing
      ? { slug: existing.slug, published: existing.published }
      : null,
    pipeline:
      "4× Google Search grounding → 10–12 section plan (avoids prior-edition angles) → section writes (Gemma 4) → ROI table → structural validator → cross-edition uniqueness → LLM quality judge (≤2 attempts)",
    minWords: 3500,
  });
}
