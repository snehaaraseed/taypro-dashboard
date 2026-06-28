import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { listAllInsights } from "@/lib/cms/insightService";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const insights = await listAllInsights(true);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("GET /api/admin/insight/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
