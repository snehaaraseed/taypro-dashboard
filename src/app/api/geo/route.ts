import { NextRequest, NextResponse } from "next/server";
import { getCountryCodeFromRequest } from "@/i18n/detect-locale-from-geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the visitor's ISO country from CDN geo headers (Cloudflare
 * `cf-ipcountry`, etc.). Consumed client-side by `VisitorGeoProvider` so that
 * marketing pages can stay static/edge-cacheable while the ROI calculator still
 * picks a market default. Per-visitor, so never shared-cached.
 */
export async function GET(request: NextRequest) {
  const country = getCountryCodeFromRequest(request);

  return NextResponse.json(
    { country },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
