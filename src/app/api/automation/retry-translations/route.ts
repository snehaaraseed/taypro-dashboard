import { NextRequest, NextResponse } from "next/server";
import { isAutomationAuthorized } from "@/lib/security";
import { processDailyTranslations } from "@/lib/translation/translation-queue";

/** Up to CMS_TRANSLATION_MAX_PER_DAY items × 4 locales — can take 1–2+ hours with delays. */
export const maxDuration = 900;

/**
 * POST — daily CMS translation cron (AUTOMATION_CRON_SECRET).
 * Translates blogs and projects dynamically (default 5+5 when both have backlog, up to 10/day).
 * One item at a time; clears the retry queue when Gemini quota is exceeded (resumes next evening).
 */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dailyResult = await processDailyTranslations();

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
            : "Daily CMS translation failed",
      },
      { status: 500 }
    );
  }
}
