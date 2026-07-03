import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "@/app/utils/auth";
import {
  createPressRelease,
  getPressReleaseByQueueKey,
} from "@/lib/cms/pressReleaseService";
import { ensurePendingSubmissionsForRelease } from "@/lib/cms/pressSubmissionService";
import {
  generatePressReleaseContent,
  buildPressReleaseSlug,
} from "@/lib/press/press-release-generator";
import { validatePressReleaseContent } from "@/lib/press/press-release-validator";
import {
  getNextPendingQueueItem,
  getQueueItemById,
  markQueueItemDone,
} from "@/lib/press/press-release-queue";
import { loadPressTargets } from "@/lib/press/press-targets";
import { PRESS_RELEASES_PATH } from "@/lib/press/press-export";
import { PRESS_PAGE_PATH } from "@/lib/seo/press-coverage";

const MAX_ATTEMPTS = 2;

/** Admin-authenticated press release generation (same logic as automation cron). */
export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;
    const queueId =
      typeof body.queueId === "string" ? body.queueId : undefined;

    const item = queueId
      ? getQueueItemById(queueId)
      : getNextPendingQueueItem();

    if (!item) {
      return NextResponse.json({
        success: false,
        message: "No pending items in press release queue.",
      });
    }

    if (item.status !== "pending" && !force) {
      return NextResponse.json({
        success: false,
        message: `Queue item "${item.id}" is already ${item.status}.`,
        queueId: item.id,
      });
    }

    const existing = await getPressReleaseByQueueKey(item.id);
    if (existing && !force) {
      return NextResponse.json({
        success: false,
        message: `Press release already exists for queue item "${item.id}" (${existing.slug}).`,
        slug: existing.slug,
        queueId: item.id,
      });
    }

    const gateFailures: string[] = [];
    let generated: Awaited<ReturnType<typeof generatePressReleaseContent>> | null =
      null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const candidate = await generatePressReleaseContent(item);
      const validation = validatePressReleaseContent(candidate);
      if (!validation.ok) {
        gateFailures.push(`attempt ${attempt}: ${validation.errors.join("; ")}`);
        continue;
      }
      generated = candidate;
      break;
    }

    if (!generated) {
      return NextResponse.json(
        {
          success: false,
          message: "Press release validation failed",
          gateFailures,
          queueId: item.id,
        },
        { status: 422 }
      );
    }

    const slug = buildPressReleaseSlug(item, generated.title);
    const result = await createPressRelease({
      slug,
      title: generated.title,
      subhead: generated.subhead,
      dateline: generated.dateline,
      content: generated.content,
      boilerplate: generated.boilerplate,
      contact: generated.contact,
      quotes: generated.quotes,
      status: "ready",
      source: "queue",
      queueKey: item.id,
      published: false,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error ?? "Failed to save press release",
          queueId: item.id,
        },
        { status: 409 }
      );
    }

    const targets = loadPressTargets();
    await ensurePendingSubmissionsForRelease(
      slug,
      targets.map((t) => t.id)
    );
    markQueueItemDone(item.id);

    await revalidatePublicContent(
      [PRESS_PAGE_PATH, `${PRESS_RELEASES_PATH}/${slug}`],
      { sitemap: true }
    );

    return NextResponse.json({
      success: true,
      slug,
      url: `${PRESS_RELEASES_PATH}/${slug}`,
      queueId: item.id,
      message: `Draft created (${slug}). Review before publishing.`,
    });
  } catch (error) {
    console.error("POST /api/admin/press/generate:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
