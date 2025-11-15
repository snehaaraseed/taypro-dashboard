import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Handle www/non-www redirect - prefer non-www (taypro.in)
  const hostname = request.headers.get("host") || "";
  if (hostname.startsWith("www.")) {
    // Remove www. prefix and port (force standard HTTPS port 443 or HTTP port 80)
    const newHost = hostname.replace(/^www\./, "").split(":")[0];
    url.host = newHost;
    // Use HTTPS if the original request was HTTPS, otherwise HTTP
    url.protocol = request.nextUrl.protocol;
    // Preserve pathname and search params
    url.pathname = pathname;
    // Remove port to use default (443 for HTTPS, 80 for HTTP)
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  // Allow access to main admin page (shows login if not authenticated), login page, and API auth endpoints
  if (
    pathname === "/admin" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    // Don't cache admin pages
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  }

  // Check authentication for all other admin routes
  if (pathname.startsWith("/admin")) {
    const authCookie = request.cookies.get(COOKIE_NAME);

    if (!authCookie || authCookie.value !== ADMIN_PASSWORD) {
      // Redirect to admin page (which will show login) if not authenticated
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    // Don't cache admin pages
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  }

  // Set cache headers for static assets to improve first-time visitor experience
  const response = NextResponse.next();

  // Add security headers for all routes
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cache static assets aggressively (1 year for immutable assets)
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
  }

  // Cache CSS and JS files (except in _next/static which is already handled above)
  else if (pathname.endsWith(".css") || pathname.endsWith(".js")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // Cache fonts and favicons
  else if (
    pathname.includes("/fonts/") ||
    pathname === "/favicon.ico" ||
    pathname.includes("favicon")
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // Cache HTML pages with shorter TTL (1 hour) for better balance
  // Allow browsers/CDNs to cache but revalidate
  else if (
    pathname.endsWith(".html") ||
    (!pathname.includes(".") && !pathname.startsWith("/api"))
  ) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  }

  // Set pathname header for other routes
  if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    response.headers.set("x-pathname", pathname);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
