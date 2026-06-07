import { NextRequest, NextResponse } from "next/server";
import { isAutomationAuthorized } from "@/lib/security";
import { processDailyTranslations } from "@/lib/translation/translation-queue";

/** Legacy HTTP trigger — prefer `npm run cms:translate-blogs-daily` (background worker). */
export const maxDuration = 900;

/**
 * POST — manual CMS translation trigger (AUTOMATION_CRON_SECRET).
 * Production cron uses `scripts/run-daily-cms-translations.ts` via fire-and-forget shell worker.
 * Translates up to CMS_TRANSLATION_MAX_PER_DAY items; stops early only on Gemini quota.
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
