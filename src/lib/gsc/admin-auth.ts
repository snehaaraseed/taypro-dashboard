import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/app/utils/auth";

export const GSC_OAUTH_STATE_COOKIE = "gsc-oauth-state";

function redirectToAdminLogin(request: NextRequest): NextResponse {
  const login = new URL("/admin", request.url);
  login.searchParams.set("next", "/admin/gsc");
  return NextResponse.redirect(login);
}

/** True when OAuth callback carries the same state as our httpOnly cookie (Google redirect). */
export async function hasValidGscOAuthState(
  request: NextRequest
): Promise<boolean> {
  const state = request.nextUrl.searchParams.get("state")?.trim();
  if (!state) return false;
  const cookieStore = await cookies();
  const expected = cookieStore.get(GSC_OAUTH_STATE_COOKIE)?.value;
  return Boolean(expected && state === expected);
}

export async function requireAdminSession(
  request: NextRequest
): Promise<NextResponse | null> {
  if (await verifyAdminAuth()) return null;

  const acceptsHtml =
    request.headers.get("accept")?.includes("text/html") ||
    request.method === "GET";

  if (acceptsHtml) {
    return redirectToAdminLogin(request);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** OAuth callback: admin session OR matching state cookie (set before Google redirect). */
export async function requireAdminSessionOrOAuthState(
  request: NextRequest
): Promise<NextResponse | null> {
  if (await verifyAdminAuth()) return null;
  if (await hasValidGscOAuthState(request)) return null;
  return redirectToAdminLogin(request);
}
