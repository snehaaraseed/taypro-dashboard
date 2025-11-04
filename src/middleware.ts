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
    // Set pathname header for layout to use
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
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

    // Set pathname header for layout to use
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  return NextResponse.next();
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

