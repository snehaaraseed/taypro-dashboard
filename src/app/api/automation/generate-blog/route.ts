import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { generateUniqueTopic, generateBlogContent } from "@/lib/aiService";
import { isGenericContentError } from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { formatTopicCategory } from "@/lib/seo/keyword-stats";
import {
  getBlogAutomationSchedule,
  addPublishedTopic,
  isTopicPublished,
} from "@/lib/topicTracker";
import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { isAutomationAuthorized } from "@/lib/security";

const MAX_GENERATION_ATTEMPTS = 3;

/** Imagen + long Gemini runs can exceed default route timeout. */
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";

  try {
    const schedule = await getBlogAutomationSchedule();
    if (!force && !schedule.canGenerate) {
      return NextResponse.json(
        {
          success: false,
          message: `Blog automation is on a ${schedule.minDaysBetween}-day cadence. Next eligible run: ${schedule.nextEligibleAt}. Use ?force=true to override.`,
          schedule,
        },
        { status: 200 }
      );
    }

    const editorialContext = await formatEditorialContextPrompt();
    let lastError: unknown;

    for (let genAttempt = 0; genAttempt < MAX_GENERATION_ATTEMPTS; genAttempt++) {
      try {
        const topic = await generateUniqueTopic(3, editorialContext);

        if (!topic.title) {
          throw new Error("Failed to generate a unique topic");
        }

        const blogData = await generateBlogContent(
          topic.title,
          topic.category,
          topic.seoBrief,
          editorialContext
        );

        if (!blogData.title || !blogData.description || !blogData.content) {
          throw new Error("Failed to generate complete blog content");
        }

        const slug = createSlug(blogData.title);
        if (await isTopicPublished(blogData.title, slug)) {
          throw new Error(
            "Generated title/slug overlaps an existing blog. Retry later or adjust prompts."
          );
        }

        const featured = await pickBlogFeaturedImage({
          title: blogData.title,
          description: blogData.description,
          seoKeyword: topic.seoKeyword,
          category: topic.category,
        });

        const result = await createBlogFiles(
          {
            title: blogData.title,
            description: blogData.description,
            featuredImage: featured.url,
            featuredImageAlt: featured.alt,
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

        const categoryMeta = topic.seoKeyword
          ? formatTopicCategory(topic.category, topic.seoKeyword)
          : topic.category;
        await addPublishedTopic(blogData.title, result.slug, categoryMeta);

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
            category: topic.category,
        seoKeyword: topic.seoKeyword || undefined,
        searchIntent: topic.seoBrief?.searchIntent,
        featuredImage: featured.url,
        featuredImageAlt: featured.alt,
        imageSource: featured.source,
        imageMode: featured.mode,
      },
          schedule: await getBlogAutomationSchedule(),
        });
      } catch (error) {
        lastError = error;
        if (isGenericContentError(error) && genAttempt < MAX_GENERATION_ATTEMPTS - 1) {
          console.warn(
            `Blog generation attempt ${genAttempt + 1} too generic, retrying...`
          );
          continue;
        }
        throw error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Blog generation failed");
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
    const schedule = await getBlogAutomationSchedule();
    return NextResponse.json({
      ...schedule,
      message: schedule.canGenerate
        ? "Ready to generate a new draft"
        : `Wait until ${schedule.nextEligibleAt} (${schedule.minDaysBetween}-day cadence). POST with ?force=true to override.`,
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
