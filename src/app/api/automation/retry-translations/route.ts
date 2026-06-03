import { NextRequest, NextResponse } from "next/server";
import { isAutomationAuthorized } from "@/lib/security";
import {
  getTranslationQueueStats,
  processTranslationQueue,
} from "@/lib/translation/translation-queue";

/** Gemini translation runs can be slow when draining the queue. */
export const maxDuration = 300;

/**
 * POST, process pending CMS translation jobs (quota auto-resume).
 * Secured with AUTOMATION_CRON_SECRET (same as generate-blog).
 *
 * Query: ?reconcile=true, also enqueue any published posts missing translations.
 */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reconcile = request.nextUrl.searchParams.get("reconcile") === "true";
    const before = await getTranslationQueueStats();
    const result = await processTranslationQueue({ reconcile });
    const after = await getTranslationQueueStats();

    return NextResponse.json({
      success: true,
      queue: { before, after },
      ...result,
    });
  } catch (error) {
    console.error("POST /api/automation/retry-translations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Translation queue failed",
      },
      { status: 500 }
    );
  }
}
