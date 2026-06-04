import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { clearGscOAuthTokens } from "@/lib/gsc/oauth-tokens";
import { invalidateGscBoostCache } from "@/lib/seo/gsc-keyword-boost";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  clearGscOAuthTokens();
  invalidateGscBoostCache();

  return NextResponse.json({ success: true, message: "GSC OAuth disconnected" });
}
