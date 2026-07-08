import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { readPagespeedAlerts } from "@/lib/seo/pagespeed-alerts";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const alerts = readPagespeedAlerts();
  if (!alerts) {
    return NextResponse.json(
      { error: "No PageSpeed alerts yet. Run an audit first." },
      { status: 404 }
    );
  }

  return NextResponse.json(alerts);
}
