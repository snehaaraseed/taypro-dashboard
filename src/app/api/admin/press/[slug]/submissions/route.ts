import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { getPressReleaseBySlug } from "@/lib/cms/pressReleaseService";
import {
  listSubmissionsForRelease,
  upsertSubmission,
} from "@/lib/cms/pressSubmissionService";
import type { BacklinkType, SubmissionStatus } from "@/lib/cms/pressSubmissionService";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const release = await getPressReleaseBySlug(slug, { includeDraft: true });
    if (!release) {
      return NextResponse.json({ error: "Press release not found" }, { status: 404 });
    }
    const submissions = await listSubmissionsForRelease(slug);
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("GET /api/admin/press/[slug]/submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const body = await request.json();
    const release = await getPressReleaseBySlug(slug, { includeDraft: true });
    if (!release) {
      return NextResponse.json({ error: "Press release not found" }, { status: 404 });
    }

    const result = await upsertSubmission({
      releaseSlug: slug,
      targetId: body.targetId,
      status: body.status as SubmissionStatus | undefined,
      externalUrl: body.externalUrl ?? null,
      backlinkType: body.backlinkType as BacklinkType | undefined,
      submittedAt: body.submittedAt ?? new Date().toISOString(),
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/press/[slug]/submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
