import { NextRequest } from "next/server";
import { routing } from "./routing";
import {
  EXPANSION_MARKETS,
  isActiveLocale,
  type TayproLocale,
} from "./markets";
import { stripLocalePrefix } from "@/lib/seo/locale-alternates";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/** ISO 3166-1 alpha-2 → primary site locale (Tier 1 + Japan markets). */
const COUNTRY_TO_LOCALE: Readonly<Record<string, TayproLocale>> =
  Object.fromEntries(
    EXPANSION_MARKETS.map((market) => [
      market.regionCode.toUpperCase(),
      market.locale,
    ])
  ) as Record<string, TayproLocale>;

const ACCEPT_LANGUAGE_BY_LOCALE: Record<TayproLocale, string> = {
  en: "en,en-US;q=0.9",
  hi: "hi-IN,hi;q=0.9,en;q=0.8",
  ar: "ar,ar-SA;q=0.9,en;q=0.8",
  ja: "ja,ja-JP;q=0.9,en;q=0.8",
  bn: "bn-BD,bn;q=0.9,en;q=0.8",
};

/**
 * Country code from CDN / platform geo headers (no client geolocation API).
 * Works on Vercel, Cloudflare, CloudFront, and common reverse proxies.
 */
export function getCountryCodeFromRequest(
  request: NextRequest
): string | null {
  const headers = request.headers;
  const candidates = [
    headers.get("x-vercel-ip-country"),
    headers.get("cf-ipcountry"),
    headers.get("cloudfront-viewer-country"),
    headers.get("x-country-code"),
    headers.get("x-geo-country"),
    headers.get("x-appengine-country"),
  ];

  for (const raw of candidates) {
    const code = raw?.trim().toUpperCase();
    if (code && /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1") {
      return code;
    }
  }

  return null;
}

export function getLocaleForCountryCode(
  countryCode: string
): TayproLocale | null {
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? null;
}

export function pathnameHasExplicitLocalePrefix(pathname: string): boolean {
  const internal = stripLocalePrefix(pathname);
  if (internal === pathname) return false;
  if (pathname === "/" || pathname === "") return false;
  return true;
}

function hasLocalePreferenceCookie(request: NextRequest): boolean {
  const value = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  return Boolean(value && isActiveLocale(value));
}

/**
 * Infer locale from visitor country (IP geo headers). Returns null when
 * country is unknown or detection should defer to Accept-Language.
 */
export function detectLocaleFromGeo(
  request: NextRequest
): TayproLocale | null {
  const country = getCountryCodeFromRequest(request);
  if (!country) return null;
  return getLocaleForCountryCode(country);
}

/**
 * Clone the request with Accept-Language biased to the geo-inferred locale so
 * next-intl's negotiator picks it on first visit (before a locale cookie exists).
 */
export function withGeoLocaleDetection(request: NextRequest): NextRequest {
  if (!routing.localeDetection) return request;
  if (pathnameHasExplicitLocalePrefix(request.nextUrl.pathname)) {
    return request;
  }
  if (hasLocalePreferenceCookie(request)) return request;

  const geoLocale = detectLocaleFromGeo(request);
  if (!geoLocale) return request;

  const headers = new Headers(request.headers);
  headers.set("accept-language", ACCEPT_LANGUAGE_BY_LOCALE[geoLocale]);

  return new NextRequest(request.url, {
    headers,
    method: request.method,
  });
}
