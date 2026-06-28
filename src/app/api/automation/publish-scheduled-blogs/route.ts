import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { publishDueScheduledBlogs } from "@/lib/cms/blogService";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { isAutomationAuthorized } from "@/lib/security";

/** Cron: publish English blogs whose scheduled_publish_at has passed. */
export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishDueScheduledBlogs();

    for (const slug of result.published) {
      revalidatePath(`/blog/${slug}`);
    }
    if (result.published.length > 0) {
      revalidatePath("/blog");
      revalidateSitemap();
    }

    return NextResponse.json({
      success: result.errors.length === 0,
      published: result.published,
      errors: result.errors,
    });
  } catch (error) {
    console.error("publish-scheduled-blogs:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to publish scheduled blogs",
      },
      { status: 500 }
    );
  }
}

/** GET: lightweight schedule status for ops / cron scripts. */
export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listDueScheduledBlogSlugs } = await import("@/lib/cms/blogService");
  const due = await listDueScheduledBlogSlugs();
  return NextResponse.json({ dueCount: due.length, dueSlugs: due });
}
