import { NextRequest, NextResponse } from "next/server";
import { revalidateJobOpenings } from "@/lib/erpnext/revalidate-job-openings";
import { isAutomationAuthorized } from "@/lib/security";

/** Trigger after ERPNext Job Opening create/update/close to refresh sitemap + CDN. */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await revalidateJobOpenings();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("revalidate-careers:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to revalidate careers content",
      },
      { status: 500 }
    );
  }
}
