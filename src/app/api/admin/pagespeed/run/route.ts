import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  getPagespeedAuditStatus,
  runPagespeedAudit,
} from "@/lib/seo/run-pagespeed-audit";
import { isPagespeedConfigured } from "@/lib/seo/pagespeed-psi-client";

export const maxDuration = 900;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  if (!isPagespeedConfigured()) {
    return NextResponse.json(
      { error: "PAGESPEED_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const status = getPagespeedAuditStatus();
  if (status.inProgress) {
    return NextResponse.json(
      { error: "PageSpeed audit already in progress" },
      { status: 409 }
    );
  }

  try {
    const result = await runPagespeedAudit();
    return NextResponse.json({
      success: true,
      message: `Audit complete: ${result.pagesAudited} pages (${result.pagesFailed} failed)`,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/admin/pagespeed/run:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "PageSpeed audit failed",
      },
      { status: 500 }
    );
  }
}
