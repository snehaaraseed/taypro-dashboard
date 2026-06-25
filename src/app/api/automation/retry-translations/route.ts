import { NextRequest, NextResponse } from "next/server";
import { getNextGeminiQuotaSoftStartEpoch } from "@/lib/gemini/quota-schedule";
import { isAutomationAuthorized } from "@/lib/security";
import { getNextMidnightStopAtEpoch, isCmsTranslationDisabled } from "@/lib/translation/config";
import { processDailyTranslations } from "@/lib/translation/translation-queue";
import { appendTranslationRunLog } from "@/lib/translation/translation-run-logger";

/** Legacy sync path only; catch-up/daily cron use background mode (instant 202). */
export const maxDuration = 900;

type TranslationRequestBody = {
  catchup?: boolean;
  /** Full backlog until quota or midnight IST (same as post-writer worker). */
  postWriter?: boolean;
  stopAtEpoch?: number;
  /** When true, wait for completion (manual debugging). */
  sync?: boolean;
};

type TranslationRunGlobals = typeof globalThis & {
  __tayproTranslationRun?: Promise<unknown>;
};

function translationGlobals(): TranslationRunGlobals {
  return globalThis as TranslationRunGlobals;
}

function isRunInFlight(): boolean {
  return Boolean(translationGlobals().__tayproTranslationRun);
}

/**
 * POST — CMS translation (AUTOMATION_CRON_SECRET).
 * postWriter=true or catchup=true: full backlog until both Gemini keys hit quota
 * or stopAtEpoch (post-writer defaults to next 00:30 Pacific soft start ≈ 1:00 PM IST).
 * When translation backlog is empty, rewrites legacy English projects until quota/deadline.
 */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isCmsTranslationDisabled()) {
    return NextResponse.json(
      {
        started: false,
        skipped: true,
        reason: "CMS_TRANSLATION_DISABLED",
      },
      { status: 200 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as TranslationRequestBody;
  const postWriter = body.postWriter === true;
  const catchup = body.catchup === true || postWriter;
  const sync = body.sync === true;
  const stopAtEpoch =
    typeof body.stopAtEpoch === "number" && body.stopAtEpoch > 0
      ? body.stopAtEpoch
      : catchup
        ? postWriter
          ? getNextGeminiQuotaSoftStartEpoch()
          : getNextMidnightStopAtEpoch()
        : undefined;

  if (isRunInFlight()) {
    return NextResponse.json(
      { error: "Translation run already in progress" },
      { status: 409 }
    );
  }

  const logFile = catchup
    ? postWriter
      ? "blog-translation-post-writer.log"
      : "blog-translation-catchup.log"
    : "blog-translation-daily.log";
  const log = (event: string, detail?: Record<string, unknown>) =>
    appendTranslationRunLog(logFile, event, detail);

  const shouldStop = stopAtEpoch
    ? () => Math.floor(Date.now() / 1000) >= stopAtEpoch
    : undefined;

  const run = processDailyTranslations({
    catchup,
    shouldStop,
    log: (event, detail) => log(event, { pid: process.pid, ...detail }),
  })
    .then((result) => {
      log("worker_done", {
        catchup,
        quotaSkippedForDay: result.quotaSkippedForDay,
        deadlineStopped: result.deadlineStopped ?? false,
        processed: result.processed,
        completed: result.completed,
        partial: result.partial,
        skippedQuota: result.skippedQuota,
        projectImprove: result.projectImprove
          ? {
              backlog: result.projectImprove.backlog,
              processed: result.projectImprove.processed,
              completed: result.projectImprove.completed,
              failed: result.projectImprove.failed,
              quotaStopped: result.projectImprove.quotaStopped,
            }
          : null,
        summary: result.items.map((item) => ({
          type: item.contentType,
          slug: item.slug,
          status: item.status,
        })),
      });
      return result;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      log("worker_error", { catchup, error: message });
      throw error;
    })
    .finally(() => {
      translationGlobals().__tayproTranslationRun = undefined;
    });

  log("worker_start", {
    catchup,
    postWriter,
    stopAtEpoch: stopAtEpoch ?? null,
    sync,
  });

  translationGlobals().__tayproTranslationRun = run;

  if (sync) {
    try {
      const result = await run;
      return NextResponse.json({
        success: true,
      mode: postWriter ? "post-writer" : catchup ? "catchup" : "daily",
      quotaSkippedForDay: result.quotaSkippedForDay,
        deadlineStopped: result.deadlineStopped ?? false,
        result,
      });
    } catch (error) {
      console.error("POST /api/automation/retry-translations:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "CMS translation failed",
        },
        { status: 500 }
      );
    }
  }

  void run;

  return NextResponse.json(
    {
      started: true,
      mode: postWriter ? "post-writer" : catchup ? "catchup" : "daily",
      stopAtEpoch: stopAtEpoch ?? null,
      logFile: `logs/${logFile}`,
    },
    { status: 202 }
  );
}
