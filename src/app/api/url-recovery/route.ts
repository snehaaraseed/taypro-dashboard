import { NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import {
  resolveNotFoundRecovery,
  shouldShowRecoveryNotFound,
} from "@/lib/url-recovery";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Did you mean" / similar-blog suggestions for a 404 path. Called client-side
 * by the (statically rendered) not-found page so that the not-found boundary
 * itself stays static and does not force the whole [locale] segment dynamic.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const path = searchParams.get("path")?.trim() ?? "";
  const localeParam = searchParams.get("locale")?.trim() ?? "";
  const locale = hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;

  if (!path) {
    return NextResponse.json(
      { show: false },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const context = await resolveNotFoundRecovery(path, locale);
  const show = shouldShowRecoveryNotFound(context);

  return NextResponse.json(
    { show, ...context },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
