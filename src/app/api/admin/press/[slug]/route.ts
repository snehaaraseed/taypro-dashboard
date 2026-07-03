import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "@/app/utils/auth";
import {
  deletePressRelease,
  getPressReleaseBySlug,
  updatePressRelease,
} from "@/lib/cms/pressReleaseService";
import { deleteSubmissionsForRelease } from "@/lib/cms/pressSubmissionService";
import { PRESS_RELEASES_PATH } from "@/lib/press/press-export";
import { PRESS_PAGE_PATH } from "@/lib/seo/press-coverage";

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
    return NextResponse.json(release);
  } catch (error) {
    console.error("GET /api/admin/press/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const body = await request.json();
    const published = body.published === true;
    const result = await updatePressRelease(slug, {
      title: body.title,
      subhead: body.subhead,
      dateline: body.dateline,
      content: body.content,
      boilerplate: body.boilerplate,
      contact: body.contact,
      quotes: body.quotes,
      featuredImage: body.featuredImage,
      published,
      status: published ? "published" : body.status,
      publishDate: body.publishDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Update failed" },
        { status: result.error === "Press release not found" ? 404 : 500 }
      );
    }

    await revalidatePublicContent(
      [PRESS_PAGE_PATH, `${PRESS_RELEASES_PATH}/${slug}`],
      { sitemap: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/press/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    await deleteSubmissionsForRelease(slug);
    const result = await deletePressRelease(slug);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Delete failed" },
        { status: result.error === "Press release not found" ? 404 : 500 }
      );
    }

    await revalidatePublicContent(
      [PRESS_PAGE_PATH, `${PRESS_RELEASES_PATH}/${slug}`],
      { sitemap: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/press/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
