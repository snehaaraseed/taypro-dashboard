import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "@/app/utils/auth";
import {
  deleteInsight,
  getInsightBySlug,
  updateInsight,
} from "@/lib/cms/insightService";
import { INSIGHTS_HUB_PATH } from "@/lib/seo/insights-hub";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const insight = await getInsightBySlug(slug, { includeDraft: true });
    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...insight.metadata,
      content: insight.content,
      metricsJson: insight.metricsJson,
    });
  } catch (error) {
    console.error("GET /api/admin/insight/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const body = await request.json();
    const result = await updateInsight(slug, {
      title: body.title,
      description: body.description,
      content: body.content,
      published: body.published,
      publishDate: body.publishDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Update failed" },
        { status: result.error === "Insight not found" ? 404 : 500 }
      );
    }

    await revalidatePublicContent(
      [INSIGHTS_HUB_PATH, `${INSIGHTS_HUB_PATH}/${slug}`],
      { sitemap: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/insight/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const result = await deleteInsight(slug);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Delete failed" },
        { status: result.error === "Insight not found" ? 404 : 500 }
      );
    }

    await revalidatePublicContent(
      [INSIGHTS_HUB_PATH, `${INSIGHTS_HUB_PATH}/${slug}`],
      { sitemap: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/insight/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
