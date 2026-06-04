import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  GSC_OAUTH_STATE_COOKIE,
  requireAdminSession,
} from "@/lib/gsc/admin-auth";
import {
  buildGscOAuthAuthorizeUrl,
  isGscOAuthClientConfigured,
} from "@/lib/gsc/oauth-config";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const denied = await requireAdminSession(request);
  if (denied) return denied;

  if (!isGscOAuthClientConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/gsc?error=oauth_not_configured", request.url)
    );
  }

  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(GSC_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = buildGscOAuthAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
