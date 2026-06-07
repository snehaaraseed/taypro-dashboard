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
import { normalizeBlogFaqsInput } from "@/lib/cms/blog-faqs";
import { getBlogBySlug } from "@/lib/cms/blogService";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import { getBlogTranslationSyncInfo } from "@/lib/cms/blogService";
import { resolveBlogPublishFields } from "@/lib/cms/blog-schedule";

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

    const translationSync = await getBlogTranslationSyncInfo(slug);
    const post = await getBlogBySlug(slug, {
      includeDraft: true,
      locale: SOURCE_LOCALE,
    });

    return NextResponse.json({
      ...metadataResult.metadata,
      content: contentResult.content || "",
      faqs: post?.metadata.faqs ?? [],
      translationSync,
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
      featuredImageAlt,
      author,
      content,
      publishDate,
      published,
      scheduledPublishAt,
      newSlug,
      faqs,
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

    // Update blog files
    const result = await updateBlogFiles(
      slug,
      {
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
      },
      finalSlug !== slug ? finalSlug : undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update blog" },
        { status: 400 }
      );
    }

    if (finalSlug !== slug) {
      revalidatePath(`/blog/${slug}`);
    }
    if (resolved.value.published) {
      revalidatePath(`/blog/${result.slug}`);
      revalidatePath("/blog");
      revalidateSitemap();
    }

    const translationSync = await getBlogTranslationSyncInfo(result.slug);

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      slug: result.slug,
      url: `/blog/${result.slug}`,
      updatedAt: result.updatedAt,
      translationSync,
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

