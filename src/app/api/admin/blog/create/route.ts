import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { createBlogFiles } from "../../../../utils/blogFileUtils";

export async function POST(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { title, description, featuredImage, author, content, publishDate } =
      await request.json();

    // Validation
    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Title, description, and content are required" },
        { status: 400 }
      );
    }

    // Create blog files
    const result = await createBlogFiles({
      title,
      description,
      featuredImage: featuredImage || "",
      author: author || "Taypro Team",
      content,
      publishDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create blog" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog created successfully",
      slug: result.slug,
      url: `/blog/${result.slug}`,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/blog/create:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

