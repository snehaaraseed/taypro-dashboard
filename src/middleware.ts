import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};

