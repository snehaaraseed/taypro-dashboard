import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import {
  getBlogTranslationAllSyncedBatch,
  listAllBlogs,
} from "@/lib/cms/blogService";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const sortedBlogs = await listAllBlogs(true);
    const publishedSlugs = sortedBlogs
      .filter((b) => b.published !== false)
      .map((b) => b.slug);
    const syncMap = await getBlogTranslationAllSyncedBatch(publishedSlugs);

    const blogs = sortedBlogs.map((b) => ({
      ...b,
      translationsSynced:
        b.published === false ? false : (syncMap[b.slug] ?? false),
    }));

    return NextResponse.json({ blogs });
  } catch (error) {
    console.error("Error in GET /api/admin/blog/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
