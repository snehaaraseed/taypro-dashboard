import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import {
  getCountryCodeFromRequest,
  withGeoLocaleDetection,
} from "./i18n/detect-locale-from-geo";
import { pathnameWithoutLocale } from "./i18n/pathname-without-locale";
import { routing } from "./i18n/routing";
import { LOCALE_LABELS, isActiveLocale, type TayproLocale } from "./i18n/markets";
import { verifyToken } from "./app/utils/jwt";
import { resolveMiddlewareAliasRedirect } from "./lib/url-recovery/middleware-redirect";

const COOKIE_NAME = "admin-auth";
const handleI18nRouting = createIntlMiddleware(routing);

/** Paths served from /public, must not be locale-prefixed by next-intl. */
const PUBLIC_ASSET_ROOTS = [
  "360-degree-images",
  "tayproasset",
  "tayprobglayout",
  "tayproclients",
  "tayproenergyresource",
  "tayprofounders",
  "tayprokeymetrics",
  "tayprorobots",
  "tayprosolarfirm",
  "tayprosolarpanel",
  "tayprosolar",
  "blogs",
  "uploads",
] as const;

function isPublicAssetPath(pathname: string): boolean {
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return PUBLIC_ASSET_ROOTS.some(
    (root) => pathname === `/${root}` || pathname.startsWith(`/${root}/`)
  );
}

function localeFromPathname(pathname: string): TayproLocale {
  const segment = pathname.split("/")[1];
  return segment && isActiveLocale(segment)
    ? segment
    : (routing.defaultLocale as TayproLocale);
}

function withLogicalPathname(request: NextRequest, pathname: string): NextRequest {
  const headers = new Headers(request.headers);
  headers.set("x-logical-pathname", pathnameWithoutLocale(pathname));
  return new NextRequest(request.url, {
    headers,
    method: request.method,
  });
}

function withHtmlLocaleHeaders(request: NextRequest): NextRequest {
  const locale = localeFromPathname(request.nextUrl.pathname);
  const headers = new Headers(request.headers);
  headers.set("x-taypro-locale", locale);
  headers.set("x-taypro-dir", LOCALE_LABELS[locale]?.dir ?? "ltr");

  return new NextRequest(request.url, {
    headers,
    method: request.method,
  });
}

const HSTS_VALUE = "max-age=31536000; includeSubDomains";

function isHttpsRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

function applyHstsIfHttps(
  request: NextRequest,
  response: NextResponse
): void {
  if (process.env.NODE_ENV === "production" && isHttpsRequest(request)) {
    response.headers.set("Strict-Transport-Security", HSTS_VALUE);
  }
}

function applySecurityAndCacheHeaders(
  request: NextRequest,
  response: NextResponse,
  pathname: string
): NextResponse {
  applyHstsIfHttps(request, response);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // GTM, GA4, Microsoft Clarity (ClarityLoader), LinkedIn Insight (via GTM), Cloudflare Web Analytics
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://scripts.clarity.ms https://snap.licdn.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://console.taypro.in https://*.clarity.ms https://px.ads.linkedin.com https://cloudflareinsights.com",
      "frame-src 'self' https://app.taypro.in https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

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
    pathname.includes("favicon") ||
    pathname.includes("apple-touch-icon")
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
    response.headers.set("x-logical-pathname", pathnameWithoutLocale(pathname));
  }

  // Geo is resolved client-side (/api/geo); do not attach x-visitor-country to HTML
  // responses — it signals per-visitor variance and can block edge caching.

  return response;
}

async function handleAdminAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const withAdminHeaders = (response: NextResponse): NextResponse => {
    applyHstsIfHttps(request, response);
    response.headers.set("x-pathname", pathname);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  };

  if (
    pathname === "/admin" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth/")
  ) {
    return withAdminHeaders(NextResponse.next());
  }

  const authCookie = request.cookies.get(COOKIE_NAME);
  if (!authCookie?.value) {
    return withAdminHeaders(
      NextResponse.redirect(new URL("/admin", request.url))
    );
  }

  const isValid = await verifyToken(authCookie.value);
  if (!isValid) {
    return withAdminHeaders(
      NextResponse.redirect(new URL("/admin", request.url))
    );
  }

  return withAdminHeaders(NextResponse.next());
}

/** SEO crawl files: skip i18n/geo/cookies; www→apex redirect still applies below. */
function isSeoCrawlFile(pathname: string): boolean {
  return pathname === "/robots.txt" || pathname === "/sitemap.xml";
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
    const wwwRedirect = NextResponse.redirect(url, 301);
    applyHstsIfHttps(request, wwwRedirect);
    return wwwRedirect;
  }

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request);
  }

  if (isSeoCrawlFile(pathname)) {
    return applySecurityAndCacheHeaders(
      request,
      NextResponse.next(),
      pathname
    );
  }

  if (pathname.startsWith("/api")) {
    if (
      pathname.startsWith("/api/admin/") &&
      !pathname.startsWith("/api/admin/auth/")
    ) {
      const isGscOAuthCallback =
        pathname === "/api/admin/gsc/oauth/callback";
      const oauthState = request.cookies.get("gsc-oauth-state")?.value;
      const callbackState = request.nextUrl.searchParams.get("state");
      const oauthStateValid =
        isGscOAuthCallback &&
        Boolean(
          oauthState &&
            callbackState &&
            oauthState === callbackState
        );

      const authCookie = request.cookies.get(COOKIE_NAME);
      const isValid =
        authCookie?.value && (await verifyToken(authCookie.value));

      if (!isValid && !oauthStateValid) {
        const isBrowserGet =
          request.method === "GET" &&
          (request.headers.get("accept")?.includes("text/html") ||
            pathname.includes("/oauth/"));

        if (isBrowserGet) {
          const login = new URL("/admin", request.url);
          login.searchParams.set("next", "/admin/gsc");
          return applySecurityAndCacheHeaders(
            request,
            NextResponse.redirect(login),
            pathname
          );
        }

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (pathname === "/api/blog/create") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return applySecurityAndCacheHeaders(
      request,
      NextResponse.next(),
      pathname
    );
  }

  if (/\/blog\/add\/?$/.test(pathname)) {
    const blogUrl = new URL("/blog", request.url);
    const blogRedirect = NextResponse.redirect(blogUrl);
    applyHstsIfHttps(request, blogRedirect);
    return blogRedirect;
  }

  const aliasDestination = resolveMiddlewareAliasRedirect(pathname);
  if (aliasDestination) {
    const aliasRedirect = NextResponse.redirect(
      new URL(aliasDestination, request.url),
      301
    );
    applyHstsIfHttps(request, aliasRedirect);
    return aliasRedirect;
  }

  // Static files in /public (360° frames, brand assets, etc.)
  if (isPublicAssetPath(pathname)) {
    return applySecurityAndCacheHeaders(
      request,
      NextResponse.next(),
      pathname
    );
  }

  const intlRequest = withLogicalPathname(
    withHtmlLocaleHeaders(withGeoLocaleDetection(request)),
    pathname
  );
  const intlResponse = handleI18nRouting(intlRequest);
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    applyHstsIfHttps(request, intlResponse);
    return intlResponse;
  }

  const response = NextResponse.next({
    request: { headers: intlRequest.headers },
  });
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      response.headers.append(key, value);
    } else {
      response.headers.set(key, value);
    }
  });

  return applySecurityAndCacheHeaders(request, response, pathname);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|favicon.ico|apple-touch-icon|uploads/).*)",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
