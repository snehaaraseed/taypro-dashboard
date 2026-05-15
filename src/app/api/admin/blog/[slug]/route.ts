import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
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

    const rawNewSlug =
      typeof newSlug === "string" ? newSlug.trim() : "";
    let finalSlug = slug;
    if (rawNewSlug) {
      const cleaned = createSlug(rawNewSlug);
      if (!cleaned) {
        return NextResponse.json(
          { error: "Invalid URL slug. Use letters, numbers, or hyphens." },
          { status: 400 }
        );
      }
      finalSlug = cleaned;
    }

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

    // Revalidate the updated blog page and blog list page immediately
    // If slug changed, revalidate both old and new paths
    if (finalSlug !== slug) {
      revalidatePath(`/blog/${slug}`);
    }
    revalidatePath(`/blog/${result.slug}`);
    revalidatePath("/blog");
    revalidateSitemap();

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      slug: result.slug,
      url: `/blog/${result.slug}`,
      updatedAt: result.updatedAt,
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

    // Revalidate the deleted blog page and blog list page immediately
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog");
    revalidateSitemap();

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

