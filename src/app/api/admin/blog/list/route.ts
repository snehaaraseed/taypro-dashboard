import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { listAllBlogs } from "@/lib/cms/blogService";

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const sortedBlogs = await listAllBlogs(true);
    return NextResponse.json({ blogs: sortedBlogs });
  } catch (error) {
    console.error("Error in GET /api/admin/blog/list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
