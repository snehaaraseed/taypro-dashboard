import { NextRequest, NextResponse } from "next/server";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { requireAuth } from "../../../../utils/auth";
import { createBlogFiles } from "../../../../utils/blogFileUtils";
import { normalizeBlogFaqsInput } from "@/lib/cms/blog-faqs";
import { resolveBlogPublishFields } from "@/lib/cms/blog-schedule";

export async function POST(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const {
      title,
      description,
      featuredImage,
      featuredImageAlt,
      author,
      content,
      publishDate,
      published,
      scheduledPublishAt,
      faqs,
    } = await request.json();

    // Validation
    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Title, description, and content are required" },
        { status: 400 }
      );
    }

    const resolved = resolveBlogPublishFields({
      published,
      scheduledPublishAt:
        scheduledPublishAt === undefined
          ? undefined
          : scheduledPublishAt || null,
      publishDate,
    });
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    // Create blog files
    const result = await createBlogFiles({
      title,
      description,
      featuredImage: featuredImage || "",
      featuredImageAlt:
        typeof featuredImageAlt === "string" ? featuredImageAlt : "",
      author: author || "Taypro Team",
      content,
      publishDate: resolved.value.publishDate,
      published: resolved.value.published,
      scheduledPublishAt: resolved.value.scheduledPublishAt,
      faqs: normalizeBlogFaqsInput(faqs),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create blog" },
        { status: 400 }
      );
    }

    if (result.success && resolved.value.published) {
      await revalidatePublicContent([`/blog/${result.slug}`, "/blog"], {
        sitemap: true,
      });
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

