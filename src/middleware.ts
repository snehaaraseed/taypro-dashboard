import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { verifyToken } from "./app/utils/jwt";

const COOKIE_NAME = "admin-auth";
const handleI18nRouting = createIntlMiddleware(routing);

function applySecurityAndCacheHeaders(
  response: NextResponse,
  pathname: string
): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/tayproasset/") ||
    pathname.startsWith("/tayproclients/") ||
    pathname.startsWith("/tayprosolar") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".avif") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".woff") ||
    pathname.endsWith(".woff2") ||
    pathname.endsWith(".ttf") ||
    pathname.endsWith(".eot")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (pathname.endsWith(".css") || pathname.endsWith(".js")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (
    pathname.includes("/fonts/") ||
    pathname === "/favicon.ico" ||
    pathname.includes("favicon")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  } else if (
    pathname.endsWith(".html") ||
    (!pathname.includes(".") && !pathname.startsWith("/api"))
  ) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  }

  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    response.headers.set("x-pathname", pathname);
  }

  return response;
}

async function handleAdminAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  }

  const authCookie = request.cookies.get(COOKIE_NAME);
  if (!authCookie?.value) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const isValid = await verifyToken(authCookie.value);
  if (!isValid) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  const hostname = request.headers.get("host") || "";
  if (hostname.startsWith("www.")) {
    const newHost = hostname.replace(/^www\./, "").split(":")[0];
    url.host = newHost;
    url.protocol = request.nextUrl.protocol;
    url.pathname = pathname;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request);
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const intlResponse = handleI18nRouting(request);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  return applySecurityAndCacheHeaders(intlResponse, pathname);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads/).*)",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
