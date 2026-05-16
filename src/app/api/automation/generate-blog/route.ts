import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { generateUniqueTopic, generateBlogContent } from "@/lib/aiService";
import { isBlogCreatedToday, addPublishedTopic } from "@/lib/topicTracker";
import { createBlogFiles } from "@/app/utils/blogFileUtils";
import { createSlug } from "@/app/utils/blogFileUtils";
import { isAutomationAuthorized } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alreadyCreated = await isBlogCreatedToday();
    if (alreadyCreated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Blog has already been created today. Only one blog per day is allowed.",
        },
        { status: 200 }
      );
    }

    const { title: topicTitle, category } = await generateUniqueTopic(5);

    if (!topicTitle) {
      return NextResponse.json(
        { success: false, error: "Failed to generate a unique topic" },
        { status: 500 }
      );
    }

    const blogData = await generateBlogContent(topicTitle, category);

    if (!blogData.title || !blogData.description || !blogData.content) {
      return NextResponse.json(
        { success: false, error: "Failed to generate complete blog content" },
        { status: 500 }
      );
    }

    const slug = createSlug(blogData.title);

    const result = await createBlogFiles(
      {
        title: blogData.title,
        description: blogData.description,
        featuredImage: "",
        author: "Taypro Team",
        content: blogData.content,
        publishDate: new Date().toISOString(),
        published: false,
      },
      slug
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to create blog files",
        },
        { status: 500 }
      );
    }

    await addPublishedTopic(blogData.title, result.slug, category);

    revalidatePath(`/blog/${result.slug}`);
    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    revalidateSitemap();

    return NextResponse.json({
      success: true,
      message: "Blog generated successfully and saved as draft",
      blog: {
        title: blogData.title,
        slug: result.slug,
        url: `/blog/${result.slug}`,
        adminUrl: `/admin/blogs`,
        status: "draft",
        category,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/automation/generate-blog:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alreadyCreated = await isBlogCreatedToday();
    return NextResponse.json({
      blogCreatedToday: alreadyCreated,
      message: alreadyCreated
        ? "A blog has already been created today"
        : "No blog created today yet",
    });
  } catch (error) {
    console.error("Error in GET /api/automation/generate-blog:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
