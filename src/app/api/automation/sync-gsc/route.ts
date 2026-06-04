import { NextRequest, NextResponse } from "next/server";
import { getGscAuthMethod, isGscConfigured } from "@/lib/gsc/gsc-auth";
import { syncGscBoostFromSearchConsole } from "@/lib/seo/gsc-sync";
import { isAutomationAuthorized } from "@/lib/security";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGscBoostFromSearchConsole();
    return NextResponse.json({
      success: true,
      message: `GSC sync complete: ${result.keywords.length} boost keywords`,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/automation/sync-gsc:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "GSC sync failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    configured: isGscConfigured(),
    authMethod: getGscAuthMethod(),
    siteUrl: process.env.GSC_SITE_URL?.trim() || "sc-domain:taypro.in",
    hint: "POST to sync. Prefer OAuth via /admin/gsc; service account is fallback.",
  });
}
