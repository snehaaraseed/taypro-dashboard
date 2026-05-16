import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { translatePublishedProject } from "@/lib/translation/translate-cms";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** POST — generate or refresh translations for a published project. */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const force = Boolean((body as { force?: boolean }).force);

    const result = await translatePublishedProject(slug, { force });

    return NextResponse.json({
      success: result.results.every((r) => r.success),
      ...result,
    });
  } catch (error) {
    console.error("POST /api/admin/translate/project/[slug]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Translation failed",
      },
      { status: 500 }
    );
  }
}
