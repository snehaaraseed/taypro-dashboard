import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { listAllPressReleases } from "@/lib/cms/pressReleaseService";
import { listAllSubmissions, countLiveSubmissions } from "@/lib/cms/pressSubmissionService";
import { countPendingQueueItems, loadPressReleaseQueue } from "@/lib/press/press-release-queue";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const [releases, submissions, liveBacklinks, pendingQueue, queue] = await Promise.all([
      listAllPressReleases(true),
      listAllSubmissions(),
      countLiveSubmissions(),
      Promise.resolve(countPendingQueueItems()),
      Promise.resolve(loadPressReleaseQueue()),
    ]);

    return NextResponse.json({
      releases,
      submissions,
      queue,
      stats: {
        liveBacklinks,
        pendingQueue,
        totalReleases: releases.length,
        publishedReleases: releases.filter((r) => r.published).length,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/press/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
