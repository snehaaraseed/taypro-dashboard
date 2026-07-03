import { NextRequest, NextResponse } from "next/server";
import { isAutomationAuthorized } from "@/lib/security";
import {
  getPagespeedAuditStatus,
  runPagespeedAudit,
} from "@/lib/seo/run-pagespeed-audit";
import { isPagespeedConfigured } from "@/lib/seo/pagespeed-psi-client";

export const maxDuration = 900;

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPagespeedConfigured()) {
    return NextResponse.json(
      { error: "PAGESPEED_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const result = await runPagespeedAudit();
    return NextResponse.json({
      success: true,
      message: `PageSpeed audit complete: ${result.pagesAudited} pages`,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/automation/pagespeed-audit:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "PageSpeed audit failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(getPagespeedAuditStatus());
}
