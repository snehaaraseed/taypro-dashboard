import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  GSC_OAUTH_STATE_COOKIE,
  requireAdminSessionOrOAuthState,
} from "@/lib/gsc/admin-auth";
import {
  exchangeCodeForTokens,
  fetchOAuthUserEmail,
  saveGscOAuthTokens,
} from "@/lib/gsc/oauth-tokens";

export async function GET(request: NextRequest) {
  const denied = await requireAdminSessionOrOAuthState(request);
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/admin/gsc?error=${encodeURIComponent(error)}`,
        request.url
      )
    );
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GSC_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GSC_OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      new URL("/admin/gsc?error=invalid_oauth_state", request.url)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (tokens.access_token) {
      const email = await fetchOAuthUserEmail(tokens.access_token);
      if (email) tokens.email = email;
    }
    saveGscOAuthTokens(tokens);

    return NextResponse.redirect(
      new URL("/admin/gsc?connected=1", request.url)
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "oauth_exchange_failed";
    return NextResponse.redirect(
      new URL(
        `/admin/gsc?error=${encodeURIComponent(message.slice(0, 120))}`,
        request.url
      )
    );
  }
}
