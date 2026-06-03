import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { generateUniqueTopic, generateBlogContent } from "@/lib/aiService";
import { isRetryableGenerationError } from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import { formatTopicCategory } from "@/lib/seo/keyword-stats";
import {
  buildContentFingerprint,
  extractH2Headings,
} from "@/lib/seo/blog-similarity";
import { assertBlogNotTooSimilar } from "@/lib/seo/blog-uniqueness";
import { pickRandomBlogAuthor } from "@/lib/cms/authorService";
import { getBlogAutomationSchedule, addPublishedTopic } from "@/lib/topicTracker";
import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { isAutomationAuthorized } from "@/lib/security";

const MAX_GENERATION_ATTEMPTS = 3;

/** Imagen + long Gemini runs can exceed default route timeout. */
export const maxDuration = 180;

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
          message: `Daily blog cap reached (1 post per ${schedule.minDaysBetween} day(s)). Next eligible run: ${schedule.nextEligibleAt}. Use ?force=true to override.`,
          schedule,
        },
        { status: 200 }
      );
    }

    const editorialContext = await formatEditorialContextPrompt();
    const bylineAuthor = await pickRandomBlogAuthor();
    let lastError: unknown;

    for (let genAttempt = 0; genAttempt < MAX_GENERATION_ATTEMPTS; genAttempt++) {
      try {
        const topic = await generateUniqueTopic(
          3,
          editorialContext,
          bylineAuthor
        );

        if (!topic.title) {
          throw new Error("Failed to generate a unique topic");
        }

        const blogData = await generateBlogContent(
          topic.title,
          topic.category,
          topic.seoBrief,
          editorialContext,
          { author: bylineAuthor }
        );

        if (!blogData.title || !blogData.description || !blogData.content) {
          throw new Error("Failed to generate complete blog content");
        }

        const slug = createSlug(blogData.title);

        await assertBlogNotTooSimilar({
          title: blogData.title,
          description: blogData.description,
          content: blogData.content,
          slug,
        });

        const featured = await pickBlogFeaturedImage({
          title: blogData.title,
          description: blogData.description,
          seoKeyword: topic.seoKeyword,
          category: topic.category,
        });

        const { content: contentWithImages, inlineImage } =
          await enrichBlogContentWithInlineImages({
            content: blogData.content,
            title: blogData.title,
            description: blogData.description,
            seoKeyword: topic.seoKeyword,
            category: topic.category,
            featured,
          });

        const result = await createBlogFiles(
          {
            title: blogData.title,
            description: blogData.description,
            featuredImage: featured.url,
            featuredImageAlt: featured.alt,
            author: bylineAuthor.name,
            content: contentWithImages,
            faqs: blogData.faqs,
            publishDate: new Date().toISOString(),
            published: true,
            scheduleTranslations: false,
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
        await addPublishedTopic(blogData.title, result.slug, categoryMeta, {
          h2Outline: extractH2Headings(contentWithImages),
          contentFingerprint: buildContentFingerprint(
            blogData.title,
            blogData.description,
            contentWithImages
          ),
        });

        revalidatePath(`/blog/${result.slug}`);
        revalidatePath("/blog");
        revalidatePath("/admin/blogs");
        revalidateSitemap();

        return NextResponse.json({
          success: true,
          message: "Blog generated and published (English live)",
          blog: {
            title: blogData.title,
            slug: result.slug,
            url: `/blog/${result.slug}`,
            adminUrl: `/admin/blogs`,
            status: "published",
            category: topic.category,
            seoKeyword: topic.seoKeyword || undefined,
            searchIntent: topic.seoBrief?.searchIntent,
            featuredImage: featured.url,
            featuredImageAlt: featured.alt,
            imageSource: featured.source,
            imageMode: featured.mode,
            inlineImage: inlineImage?.url,
            inlineImageSource: inlineImage?.source,
            faqCount: blogData.faqs.length,
            author: bylineAuthor.name,
            authorRole: bylineAuthor.role,
          },
          schedule: await getBlogAutomationSchedule(),
        });
      } catch (error) {
        lastError = error;
        if (
          isRetryableGenerationError(error) &&
          genAttempt < MAX_GENERATION_ATTEMPTS - 1
        ) {
          console.warn(
            `Blog generation attempt ${genAttempt + 1} rejected, retrying:`,
            error instanceof Error ? error.message : error
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
        ? "Ready to generate and publish a new post"
        : `Wait until ${schedule.nextEligibleAt} (max 1 post/day). POST with ?force=true to override.`,
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
