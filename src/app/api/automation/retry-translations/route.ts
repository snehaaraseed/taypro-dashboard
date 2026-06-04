import { NextRequest, NextResponse } from "next/server";
import { isAutomationAuthorized } from "@/lib/security";
import { processDailyBlogTranslations } from "@/lib/translation/translation-queue";

/** Up to BLOG_TRANSLATION_MAX_PER_DAY blogs × 4 locales — can take 1–2+ hours with delays. */
export const maxDuration = 900;

/**
 * POST — daily blog translation cron (AUTOMATION_CRON_SECRET).
 * Translates up to BLOG_TRANSLATION_MAX_PER_DAY published EN blogs.
 * Stops for the rest of the run when Gemini quota is exceeded (retries next day).
 */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dailyResult = await processDailyBlogTranslations();

    return NextResponse.json({
      success: true,
      mode: "daily",
      quotaSkippedForDay: dailyResult.quotaSkippedForDay,
      daily: dailyResult,
    });
  } catch (error) {
    console.error("POST /api/automation/retry-translations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Daily blog translation failed",
      },
      { status: 500 }
    );
  }
}
