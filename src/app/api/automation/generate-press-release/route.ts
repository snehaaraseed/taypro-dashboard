import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { isAutomationAuthorized } from "@/lib/security";
import {
  createPressRelease,
  getPressReleaseByQueueKey,
  getLatestPressRelease,
} from "@/lib/cms/pressReleaseService";
import { ensurePendingSubmissionsForRelease } from "@/lib/cms/pressSubmissionService";
import {
  generatePressReleaseContent,
  buildPressReleaseSlug,
} from "@/lib/press/press-release-generator";
import { validatePressReleaseContent } from "@/lib/press/press-release-validator";
import {
  countPendingQueueItems,
  getNextPendingQueueItem,
  getQueueItemById,
  markQueueItemDone,
} from "@/lib/press/press-release-queue";
import { loadPressTargets } from "@/lib/press/press-targets";
import { PRESS_RELEASES_PATH } from "@/lib/press/press-export";
import { PRESS_PAGE_PATH } from "@/lib/seo/press-coverage";

export const maxDuration = 300;

const MAX_ATTEMPTS = 3;

export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = countPendingQueueItems();
  const next = getNextPendingQueueItem();
  const latest = await getLatestPressRelease();

  return NextResponse.json({
    pendingQueueItems: pending,
    nextQueueItem: next
      ? { id: next.id, titleHint: next.titleHint, angle: next.angle }
      : null,
    latestRelease: latest
      ? {
          slug: latest.slug,
          title: latest.title,
          status: latest.status,
          published: latest.published,
          createdAt: latest.createdAt,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const queueId = request.nextUrl.searchParams.get("queueId");

  try {
    const item = queueId
      ? getQueueItemById(queueId)
      : getNextPendingQueueItem();

    if (!item) {
      return NextResponse.json({
        success: false,
        jobComplete: true,
        message: "No pending items in press release queue.",
        pendingQueueItems: 0,
      });
    }

    if (item.status !== "pending" && !force) {
      return NextResponse.json({
        success: false,
        message: `Queue item "${item.id}" is already ${item.status}. Use ?force=true to regenerate.`,
        queueId: item.id,
      });
    }

    const existing = await getPressReleaseByQueueKey(item.id);
    if (existing && !force) {
      return NextResponse.json({
        success: false,
        jobComplete: true,
        message: `Press release for queue item "${item.id}" already exists (${existing.slug}).`,
        slug: existing.slug,
        queueId: item.id,
      });
    }

    const gateFailures: string[] = [];
    let generated: Awaited<ReturnType<typeof generatePressReleaseContent>> | null =
      null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const candidate = await generatePressReleaseContent(item, {
        previousErrors: gateFailures.flatMap((line) =>
          line.replace(/^attempt \d+:\s*/, "").split("; ")
        ),
      });
      const validation = validatePressReleaseContent(candidate, {
        productFocus: item.productFocus,
      });
      if (!validation.ok) {
        gateFailures.push(
          `attempt ${attempt}: ${validation.errors.join("; ")}`
        );
        continue;
      }
      generated = candidate;
      break;
    }

    if (!generated) {
      console.error(
        "[generate-press-release] validation failed:",
        gateFailures.join(" | ")
      );
      return NextResponse.json(
        {
          success: false,
          message: "Press release validation failed after retries",
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
      message: `Draft press release created (${slug}). Review in /admin/press before publishing.`,
      pendingQueueItems: countPendingQueueItems(),
    });
  } catch (error) {
    console.error("[generate-press-release]", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 }
    );
  }
}
