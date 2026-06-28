import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  listEnglishBlogSlugs,
  listEnglishProjectSlugs,
  listEnglishInsightSlugs,
  translatePublishedBlog,
  translatePublishedProject,
  translatePublishedInsight,
} from "@/lib/translation/translate-cms";

/**
 * POST, translate all published English blogs and/or projects.
 * Body: {
 *   blogs?: boolean,
 *   projects?: boolean,
 *   insights?: boolean,
 *   force?: boolean,
 *   limit?: number,
 *   slugs?: string[], only these blog slugs (must be published English)
 *   insightSlugs?: string[]
 * }
 */
export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      blogs?: boolean;
      projects?: boolean;
      insights?: boolean;
      force?: boolean;
      limit?: number;
      slugs?: string[];
      insightSlugs?: string[];
    };

    const doBlogs = body.blogs === true;
    const doProjects = body.projects === true;
    const doInsights = body.insights === true;
    const anyType = doBlogs || doProjects || doInsights;
    const runBlogs = anyType ? doBlogs : true;
    const runProjects = anyType ? doProjects : true;
    const runInsights = anyType ? doInsights : false;
    const force = Boolean(body.force);
    const limit =
      typeof body.limit === "number" && body.limit > 0 ? body.limit : undefined;
    const slugFilter = Array.isArray(body.slugs)
      ? body.slugs.filter((s): s is string => typeof s === "string" && s.length > 0)
      : undefined;

    const insightSlugFilter = Array.isArray(body.insightSlugs)
      ? body.insightSlugs.filter(
          (s): s is string => typeof s === "string" && s.length > 0
        )
      : undefined;

    const summary: {
      blogs: Awaited<ReturnType<typeof translatePublishedBlog>>[];
      projects: Awaited<ReturnType<typeof translatePublishedProject>>[];
      insights: Awaited<ReturnType<typeof translatePublishedInsight>>[];
    } = { blogs: [], projects: [], insights: [] };

    if (runBlogs) {
      let slugs =
        slugFilter?.length ? slugFilter : await listEnglishBlogSlugs();
      if (limit) slugs = slugs.slice(0, limit);
      for (const slug of slugs) {
        summary.blogs.push(await translatePublishedBlog(slug, { force }));
      }
    }

    if (runProjects) {
      let slugs = await listEnglishProjectSlugs();
      if (limit) slugs = slugs.slice(0, limit);
      for (const slug of slugs) {
        summary.projects.push(
          await translatePublishedProject(slug, { force })
        );
      }
    }

    if (runInsights) {
      let slugs =
        insightSlugFilter?.length ? insightSlugFilter : await listEnglishInsightSlugs();
      if (limit) slugs = slugs.slice(0, limit);
      for (const slug of slugs) {
        summary.insights.push(await translatePublishedInsight(slug, { force }));
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
