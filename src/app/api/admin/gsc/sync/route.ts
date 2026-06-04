import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { syncGscBoostFromSearchConsole } from "@/lib/seo/gsc-sync";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  try {
    const result = await syncGscBoostFromSearchConsole();
    return NextResponse.json({
      success: true,
      message: `Synced ${result.keywords.length} boost keywords via ${result.authMethod}`,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/admin/gsc/sync:", error);
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
