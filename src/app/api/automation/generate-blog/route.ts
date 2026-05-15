import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { generateUniqueTopic, generateBlogContent } from "@/lib/aiService";
import { isBlogCreatedToday, addPublishedTopic } from "@/lib/topicTracker";
import { createBlogFiles } from "@/app/utils/blogFileUtils";
import { createSlug } from "@/app/utils/blogFileUtils";

/**
 * POST /api/automation/generate-blog
 * 
 * Automated blog generation endpoint that:
 * 1. Checks if blog already created today
 * 2. Generates unique topic
 * 3. Generates blog content using Gemini AI
 * 4. Creates blog as draft
 * 5. Saves topic to tracking file
 * 
 * Can be called by:
 * - Cron job (daily)
 * - Manual trigger
 * - External scheduling service
 */
export async function POST(request: NextRequest) {
  try {
    // Check if blog already created today
    const alreadyCreated = await isBlogCreatedToday();
    if (alreadyCreated) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog has already been created today. Only one blog per day is allowed.",
        },
        { status: 200 } // 200 because this is expected behavior, not an error
      );
    }

    // Generate unique topic (with retry logic built-in)
    console.log("Generating unique topic...");
    const { title: topicTitle, category } = await generateUniqueTopic(5);

    if (!topicTitle) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate a unique topic",
        },
        { status: 500 }
      );
    }

    console.log(`Generated topic: "${topicTitle}" (Category: ${category})`);

    // Generate blog content using Gemini AI
    console.log("Generating blog content...");
    const blogData = await generateBlogContent(topicTitle, category);

    if (!blogData.title || !blogData.description || !blogData.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate complete blog content",
        },
        { status: 500 }
      );
    }

    console.log(`Generated blog: "${blogData.title}"`);

    // Create slug from title
    const slug = createSlug(blogData.title);

    // Create blog files as DRAFT (published: false)
    console.log("Creating blog files as draft...");
    const result = await createBlogFiles(
      {
        title: blogData.title,
        description: blogData.description,
        featuredImage: "", // No featured image for now
        author: "Taypro Team",
        content: blogData.content,
        publishDate: new Date().toISOString(),
        published: false, // Save as draft for review
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

    // Save topic to published-topics.json
    console.log("Saving topic to tracking file...");
    await addPublishedTopic(blogData.title, result.slug, category);

    // Revalidate paths
    revalidatePath(`/blog/${result.slug}`);
    revalidatePath("/blog");
    revalidatePath("/admin/blogs");
    revalidateSitemap();

    console.log(`Blog created successfully as draft: ${result.slug}`);

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

/**
 * GET /api/automation/generate-blog
 * 
 * Check status endpoint - returns whether a blog has been created today
 */
export async function GET() {
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
