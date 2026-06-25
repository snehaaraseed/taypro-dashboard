import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { applyProjectImprove } from "@/lib/cms/apply-project-improve";
import { readProjectFull } from "@/lib/cms/projectService";

export const maxDuration = 600;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      sectionIds?: string[];
      improvementBrief?: string;
      retranslate?: boolean;
    };

    const project = await readProjectFull(slug);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const improved = await applyProjectImprove(slug, {
      sectionIds: body.sectionIds,
      improvementBrief: body.improvementBrief,
      retranslate: body.retranslate !== false,
    });

    return NextResponse.json({
      success: true,
      slug: improved.slug,
      updatedAt: improved.updatedAt,
      editorialStatus: improved.editorialStatus,
    });
  } catch (error) {
    console.error("POST improve project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Project improve failed",
      },
      { status: 500 }
    );
  }
}
