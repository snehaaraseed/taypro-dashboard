import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { generateBlogContent } from "@/lib/aiService";
import { isGenericContentError } from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import { formatTopicCategory } from "@/lib/seo/keyword-stats";
import { addPublishedTopic, isTopicPublished } from "@/lib/topicTracker";
import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { requireAuth } from "@/app/utils/auth";

const MAX_GENERATION_ATTEMPTS = 3;

/** Imagen + long Gemini runs can exceed default route timeout. */
export const maxDuration = 180;

function parseFocusedKeywords(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((k) => (typeof k === "string" ? k.trim() : ""))
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const brief =
      typeof body.brief === "string"
        ? body.brief.trim()
        : typeof body.description === "string"
          ? body.description.trim()
          : "";
    const saveAsDraft = body.saveAsDraft !== false;
    const focusedKeywords = parseFocusedKeywords(
      body.focusedKeywords ?? body.keywords
    );
    const seoKeyword = focusedKeywords[0] || topic;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    if (!brief) {
      return NextResponse.json(
        { error: "Description or brief is required" },
        { status: 400 }
      );
    }

    const editorialContext = await formatEditorialContextPrompt();
    const category = "Custom";
    let lastError: unknown;

    for (let genAttempt = 0; genAttempt < MAX_GENERATION_ATTEMPTS; genAttempt++) {
      try {
        const blogData = await generateBlogContent(
          topic,
          category,
          null,
          editorialContext,
          { userBrief: brief, focusedKeywords }
        );

        if (!blogData.title || !blogData.description || !blogData.content) {
          throw new Error("Failed to generate complete blog content");
        }

        const slug = createSlug(blogData.title);
        if (await isTopicPublished(blogData.title, slug)) {
          throw new Error(
            "Generated title overlaps an existing blog. Adjust the topic or brief and try again."
          );
        }

        const featured = await pickBlogFeaturedImage({
          title: blogData.title,
          description: blogData.description,
          seoKeyword,
          category,
        });

        const { content: contentWithImages, inlineImage } =
          await enrichBlogContentWithInlineImages({
            content: blogData.content,
            title: blogData.title,
            description: blogData.description,
            seoKeyword,
            category,
            featured,
          });

        const generated = {
          title: blogData.title,
          description: blogData.description,
          content: contentWithImages,
          faqs: blogData.faqs,
          featuredImage: featured.url,
          featuredImageAlt: featured.alt,
          slug,
          imageSource: featured.source,
          imageMode: featured.mode,
          inlineImage: inlineImage?.url,
          inlineImageSource: inlineImage?.source,
        };

        if (!saveAsDraft) {
          return NextResponse.json({
            success: true,
            message: "Blog content generated",
            blog: generated,
          });
        }

        const result = await createBlogFiles(
          {
            title: blogData.title,
            description: blogData.description,
            featuredImage: featured.url,
            featuredImageAlt: featured.alt,
            author: "Taypro Team",
            content: contentWithImages,
            faqs: blogData.faqs,
            publishDate: new Date().toISOString(),
            published: false,
          },
          slug
        );

        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: result.error || "Failed to save generated blog",
            },
            { status: 500 }
          );
        }

        await addPublishedTopic(
          blogData.title,
          result.slug,
          formatTopicCategory(category, topic)
        );

        revalidatePath(`/blog/${result.slug}`);
        revalidatePath("/blog");
        revalidatePath("/admin/blogs");
        revalidateSitemap();

        return NextResponse.json({
          success: true,
          message: "Blog generated and saved as draft",
          blog: {
            ...generated,
            slug: result.slug,
            adminUrl: `/admin/blogs/${result.slug}/edit`,
            status: "draft",
          },
        });
      } catch (error) {
        lastError = error;
        if (isGenericContentError(error) && genAttempt < MAX_GENERATION_ATTEMPTS - 1) {
          console.warn(
            `Admin blog generation attempt ${genAttempt + 1} too generic, retrying...`
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
    console.error("Error in POST /api/admin/blog/generate:", error);
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
