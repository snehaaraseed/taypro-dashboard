import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/app/utils/auth";

export async function requireAdminSession(
  request: NextRequest
): Promise<NextResponse | null> {
  const ok = await verifyAdminAuth();
  if (ok) return null;

  const acceptsHtml = request.headers
    .get("accept")
    ?.includes("text/html");

  if (acceptsHtml) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
