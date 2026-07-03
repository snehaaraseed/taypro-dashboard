import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  readPagespeedSummary,
  resolvePagespeedPagesDir,
  urlToReportFilename,
} from "@/lib/seo/pagespeed-paths";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const url = request.nextUrl.searchParams.get("url")?.trim();
  const runIdParam = request.nextUrl.searchParams.get("runId")?.trim();

  if (!url) {
    return NextResponse.json({ error: "url query parameter required" }, { status: 400 });
  }

  const summary = readPagespeedSummary();
  const runId = runIdParam || summary?.runId;
  if (!runId) {
    return NextResponse.json({ error: "No audit run found" }, { status: 404 });
  }

  const reportPath = path.join(
    resolvePagespeedPagesDir(runId),
    urlToReportFilename(url)
  );

  if (!fs.existsSync(reportPath)) {
    return NextResponse.json(
      { error: "Page report not found for this URL and run" },
      { status: 404 }
    );
  }

  try {
    const raw = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    return NextResponse.json({ runId, url, report: raw });
  } catch {
    return NextResponse.json({ error: "Failed to read page report" }, { status: 500 });
  }
}
