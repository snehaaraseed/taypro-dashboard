import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { getPressReleaseBySlug } from "@/lib/cms/pressReleaseService";
import { loadPressTargets } from "@/lib/press/press-targets";
import {
  exportReleaseForAllTargets,
  exportReleaseForTarget,
  buildExportBundleText,
} from "@/lib/press/press-export";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const targetId = request.nextUrl.searchParams.get("targetId");
    const release = await getPressReleaseBySlug(slug, { includeDraft: true });
    if (!release) {
      return NextResponse.json({ error: "Press release not found" }, { status: 404 });
    }

    const targets = loadPressTargets();

    if (targetId) {
      const target = targets.find((t) => t.id === targetId);
      if (!target) {
        return NextResponse.json({ error: "Target not found" }, { status: 404 });
      }
      const exported = exportReleaseForTarget(release, target);
      return NextResponse.json({ export: exported });
    }

    const exports = exportReleaseForAllTargets(release, targets);
    const bundleText = buildExportBundleText(release, exports);

    return NextResponse.json({
      exports,
      bundleText,
      canonicalUrl: exports[0]
        ? exports[0].fields.body?.match(/https:\/\/[^\s]+/)?.[0]
        : undefined,
    });
  } catch (error) {
    console.error("GET /api/admin/press/[slug]/export:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
