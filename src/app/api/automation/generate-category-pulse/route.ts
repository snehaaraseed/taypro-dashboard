import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { isAutomationAuthorized } from "@/lib/security";
import { isGscConfigured } from "@/lib/gsc/gsc-auth";
import {
  assembleCategoryPulseMetrics,
} from "@/lib/insights/category-pulse-data";
import {
  buildCategoryPulseDescription,
  generateCategoryPulseContent,
} from "@/lib/insights/category-pulse-generator";
import { validateCategoryPulseContent } from "@/lib/insights/category-pulse-validator";
import {
  createInsight,
  getInsightForPeriod,
  getLatestCategoryPulsePeriod,
} from "@/lib/cms/insightService";
import {
  currentPeriod,
  periodToSlugSuffix,
  periodToTitleLabel,
  writeGscSnapshot,
} from "@/lib/insights/gsc-snapshots";
import { evaluateCategoryPulseGate } from "@/lib/insights/category-pulse-gate";
import { INSIGHTS_HUB_PATH } from "@/lib/seo/insights-hub";
import { enqueueInsightTranslations } from "@/lib/translation/translation-queue";

function nextEligibleRun(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const next = new Date(Date.UTC(year, month + 1, 1, 10, 0, 0));
  return next.toISOString();
}

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const period = currentPeriod();

  try {
    if (!isGscConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "GSC API not configured. Connect Search Console in /admin/gsc or set GSC_SERVICE_ACCOUNT_PATH.",
        },
        { status: 503 }
      );
    }

    const existing = await getInsightForPeriod(period, "category_pulse");
    if (existing && !force) {
      return NextResponse.json({
        success: false,
        jobComplete: true,
        message: `Category pulse for ${period} already exists (slug: ${existing.slug}). Use ?force=true to regenerate.`,
        period,
        slug: existing.slug,
      });
    }

    if (existing && force) {
      return NextResponse.json(
        {
          success: false,
          message: `Pulse for ${period} exists. Delete via admin before force regenerating.`,
          slug: existing.slug,
        },
        { status: 409 }
      );
    }

    const { metrics, snapshot } = await assembleCategoryPulseMetrics(period);

    const gate = evaluateCategoryPulseGate(metrics.summary);
    if (!gate.publish) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: gate.reason,
        period,
        gate,
      });
    }

    const content = await generateCategoryPulseContent(metrics);
    const validation = validateCategoryPulseContent(content, metrics);

    if (!validation.ok) {
      console.error("[generate-category-pulse] validation failed:", validation.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Category pulse validation failed",
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    const slug = `category-pulse-${periodToSlugSuffix(period)}`;
    const title = `Category Pulse: ${periodToTitleLabel(period)}`;
    const description = buildCategoryPulseDescription(metrics);
    const now = new Date().toISOString();

    const created = await createInsight({
      slug,
      title,
      description,
      content,
      reportType: "category_pulse",
      period,
      metricsJson: JSON.stringify(metrics),
      published: true,
      publishDate: now,
    });

    if (!created.success) {
      return NextResponse.json(
        { success: false, message: created.error ?? "Failed to save insight" },
        { status: 500 }
      );
    }

    writeGscSnapshot(snapshot);

    await revalidatePublicContent(
      [INSIGHTS_HUB_PATH, `${INSIGHTS_HUB_PATH}/${slug}`],
      { sitemap: true }
    );

    const translationsEnqueued = await enqueueInsightTranslations(slug);

    return NextResponse.json({
      success: true,
      slug,
      period,
      title,
      published: true,
      publishDate: now,
      metricsSummary: metrics.summary,
      translationsEnqueued,
    });
  } catch (error) {
    console.error("generate-category-pulse:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate category pulse",
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
  const existing = await getInsightForPeriod(period, "category_pulse");
  const latestPeriod = await getLatestCategoryPulsePeriod();

  return NextResponse.json({
    gscConfigured: isGscConfigured(),
    currentPeriod: period,
    latestGeneratedPeriod: latestPeriod,
    currentMonthComplete: Boolean(existing),
    currentMonthSlug: existing?.slug ?? null,
    nextEligibleRun: nextEligibleRun(),
  });
}
