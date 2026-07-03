import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { readPagespeedSummary } from "@/lib/seo/pagespeed-paths";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const summary = readPagespeedSummary();
  if (!summary) {
    return NextResponse.json(
      { error: "No PageSpeed audit report yet. Run an audit first." },
      { status: 404 }
    );
  }

  return NextResponse.json(summary);
}
