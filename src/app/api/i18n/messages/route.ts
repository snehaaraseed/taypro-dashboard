import { NextRequest, NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { isAllowedClientNamespace } from "@/i18n/client-message-namespaces";
import { buildSpaClientMessages } from "@/i18n/pick-messages";
import { loadMessagesForClient } from "@/i18n/load-messages";
import { routing } from "@/i18n/routing";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locale = searchParams.get("locale")?.trim() ?? "";
  const nsParam = searchParams.get("ns")?.trim() ?? "";

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const namespaces = nsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (namespaces.length === 0) {
    return NextResponse.json({ error: "Missing ns" }, { status: 400 });
  }

  if (namespaces.some((ns) => !isAllowedClientNamespace(ns))) {
    return NextResponse.json({ error: "Invalid namespace" }, { status: 400 });
  }

  const catalog = buildSpaClientMessages(await loadMessagesForClient(locale));
  const messages: Record<string, unknown> = {};
  for (const ns of namespaces) {
    if (ns in catalog) {
      messages[ns] = catalog[ns];
    }
  }

  return NextResponse.json(
    { messages },
    {
      headers: {
        "Cache-Control":
          "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
