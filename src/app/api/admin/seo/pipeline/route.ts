import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { buildPipelineAdminSnapshot } from "@/lib/seo/pipeline-admin-snapshot";
import {
  enqueueCuratedTopicsToBriefQueue,
  resolveCuratedTopicStatuses,
} from "@/lib/seo/curated-blog-topics";
import { runTopicDiscovery } from "@/lib/seo/run-topic-discovery";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  try {
    const curated = request.nextUrl.searchParams.get("curated") === "full";
    const snapshot = await buildPipelineAdminSnapshot();
    if (curated) {
      return NextResponse.json({
        ...snapshot,
        curatedTopicsFull: await resolveCuratedTopicStatuses(),
      });
    }
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("[admin/seo/pipeline] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load pipeline snapshot" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      limit?: number;
      topicIds?: string[];
      discoveryTarget?: number;
    };

    if (body.action === "enqueue-curated") {
      const result = await enqueueCuratedTopicsToBriefQueue({
        limit: body.limit ?? 50,
        topicIds: body.topicIds,
      });
      const snapshot = await buildPipelineAdminSnapshot();
      return NextResponse.json({ ok: true, result, snapshot });
    }

    if (body.action === "run-discovery") {
      const result = await runTopicDiscovery({
        target: body.discoveryTarget ?? 12,
        reason: "admin-manual",
      });
      const snapshot = await buildPipelineAdminSnapshot();
      return NextResponse.json({ ok: true, result, snapshot });
    }

    if (body.action === "enqueue-all-pending") {
      const pending = (await resolveCuratedTopicStatuses()).filter(
        (r) => r.status === "pending"
      );
      const result = await enqueueCuratedTopicsToBriefQueue({
        limit: pending.length,
        topicIds: pending.map((p) => p.id),
      });
      const snapshot = await buildPipelineAdminSnapshot();
      return NextResponse.json({ ok: true, result, snapshot });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[admin/seo/pipeline] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Pipeline action failed",
      },
      { status: 500 }
    );
  }
}
