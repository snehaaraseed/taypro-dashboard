import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import {
  updateBlogFiles,
  deleteBlogFiles,
  readBlogMetadata,
  readBlogContent,
  createSlug,
} from "../../../../utils/blogFileUtils";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET - Read blog for editing
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { slug } = await params;
    const metadataResult = await readBlogMetadata(slug);
    const contentResult = await readBlogContent(slug);

    if (!metadataResult.success || !metadataResult.metadata) {
      return NextResponse.json(
        { error: metadataResult.error || "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...metadataResult.metadata,
      content: contentResult.content || "",
    });
  } catch (error) {
    console.error("Error in GET /api/admin/blog/[slug]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update blog
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { slug } = await params;
    const {
      title,
      description,
      featuredImage,
      author,
      content,
      publishDate,
      published,
      newSlug,
    } = await request.json();

    // Validation
    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Title, description, and content are required" },
        { status: 400 }
      );
    }

    // If newSlug is provided and different, use it
    const finalSlug = newSlug ? createSlug(newSlug) : slug;

    // Update blog files
    const result = await updateBlogFiles(
      slug,
      {
        title,
        description,
        featuredImage: featuredImage || "",
        author: author || "Taypro Team",
        content,
        publishDate,
        published: published !== undefined ? published : true,
      },
      finalSlug !== slug ? finalSlug : undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update blog" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      slug: result.slug,
      url: `/blog/${result.slug}`,
    });
  } catch (error) {
    console.error("Error in PUT /api/admin/blog/[slug]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { slug } = await params;
    const result = await deleteBlogFiles(slug);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete blog" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/blog/[slug]:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

