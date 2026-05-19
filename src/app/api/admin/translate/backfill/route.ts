import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  listEnglishBlogSlugs,
  listEnglishProjectSlugs,
  translatePublishedBlog,
  translatePublishedProject,
} from "@/lib/translation/translate-cms";

/**
 * POST — translate all published English blogs and/or projects.
 * Body: {
 *   blogs?: boolean,
 *   projects?: boolean,
 *   force?: boolean,
 *   limit?: number,
 *   slugs?: string[] — only these blog slugs (must be published English)
 * }
 */
export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      blogs?: boolean;
      projects?: boolean;
      force?: boolean;
      limit?: number;
      slugs?: string[];
    };

    const doBlogs = body.blogs !== false;
    const doProjects = body.projects !== false;
    const force = Boolean(body.force);
    const limit =
      typeof body.limit === "number" && body.limit > 0 ? body.limit : undefined;
    const slugFilter = Array.isArray(body.slugs)
      ? body.slugs.filter((s): s is string => typeof s === "string" && s.length > 0)
      : undefined;

    const summary: {
      blogs: Awaited<ReturnType<typeof translatePublishedBlog>>[];
      projects: Awaited<ReturnType<typeof translatePublishedProject>>[];
    } = { blogs: [], projects: [] };

    if (doBlogs) {
      let slugs =
        slugFilter?.length ? slugFilter : await listEnglishBlogSlugs();
      if (limit) slugs = slugs.slice(0, limit);
      for (const slug of slugs) {
        summary.blogs.push(await translatePublishedBlog(slug, { force }));
      }
    }

    if (doProjects) {
      let slugs = await listEnglishProjectSlugs();
      if (limit) slugs = slugs.slice(0, limit);
      for (const slug of slugs) {
        summary.projects.push(
          await translatePublishedProject(slug, { force })
        );
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("POST /api/admin/translate/backfill:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Backfill failed",
      },
      { status: 500 }
    );
  }
}
