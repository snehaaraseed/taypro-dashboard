import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import {
  generateBlogContent,
  planBlogContent,
  type GeneratedTopic,
} from "@/lib/aiService";
import { isRetryableGenerationError } from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import { formatTopicCategory } from "@/lib/seo/keyword-stats";
import {
  assertBlogDraftUnique,
  assertPlanUnique,
  findTitleConflict,
  loadBlogUniquenessContext,
} from "@/lib/seo/blog-plan-gates";
import {
  buildContentFingerprint,
  extractH2Headings,
} from "@/lib/seo/blog-similarity";
import {
  pickTopicTitleHybrid,
  planBlogAutomationHybrid,
} from "@/lib/seo/blog-automation-hybrid";
import { pickAuthorForBlogTopic } from "@/lib/cms/authorService";
import { resolveAuthorExpertiseTags } from "@/lib/cms/blog-author-expertise";
import { getBlogAutomationSchedule, addPublishedTopic } from "@/lib/topicTracker";
import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { isAutomationAuthorized } from "@/lib/security";
import {
  GeminiDailyBudgetError,
  getBlogPipelineMaxCalls,
  getGeminiDailyBudget,
} from "@/lib/gemini/daily-budget";

/** One outer attempt ≈ topic + outline + body (not 5× full pipelines). */
const MAX_PIPELINE_ATTEMPTS = 3;

/** Imagen + long Gemini runs; cron curl allows 900s — keep in sync. */
export const maxDuration = 900;

async function pickAutomationTopic(
  editorialContext: string,
  rejectedTitles: string[],
  automationPlan: Awaited<ReturnType<typeof planBlogAutomationHybrid>>
): Promise<GeneratedTopic> {
  const { author, category, seoBrief } = automationPlan;

  if (!seoBrief?.primary) {
    throw new Error("No SEO keyword available for topic selection");
  }

  const title = await pickTopicTitleHybrid({
    seoBrief,
    category,
    author,
    editorialContext,
    rejectedTitles,
  });

  return {
    title,
    category: category.name,
    seoKeyword: seoBrief.primary,
    seoBrief,
  };
}

function trackRejectedTitle(rejectedTitles: string[], title: string): void {
  const trimmed = title.trim();
  if (!trimmed) return;
  if (!rejectedTitles.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
    rejectedTitles.push(trimmed);
  }
}

function trackRejectedFromError(rejectedTitles: string[], msg: string): void {
  const match = msg.match(/"([^"]+)"/g);
  if (!match) return;
  for (const quoted of match) {
    trackRejectedTitle(rejectedTitles, quoted.replace(/^"|"$/g, ""));
  }
}

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
    const automationPlan = await planBlogAutomationHybrid(
      editorialContext,
      pickAuthorForBlogTopic
    );
    const { author: bylineAuthor } = automationPlan;
    const uniquenessCtx = await loadBlogUniquenessContext();
    let lastError: unknown;
    const rejectedTitles: string[] = [];

    for (
      let pipelineAttempt = 0;
      pipelineAttempt < MAX_PIPELINE_ATTEMPTS;
      pipelineAttempt++
    ) {
      let attemptedTitle = "";
      try {
        const topic = await pickAutomationTopic(
          editorialContext,
          rejectedTitles,
          automationPlan
        );

        if (!topic.title) {
          throw new Error("Failed to generate a unique topic");
        }
        attemptedTitle = topic.title;
        const slug = createSlug(topic.title);

        const titleConflict = await findTitleConflict(topic.title, slug);
        if (titleConflict) {
          trackRejectedTitle(rejectedTitles, topic.title);
          throw new Error(
            `Topic already published or too similar: "${topic.title}" (${titleConflict.slug})`
          );
        }

        const contentPlan = await planBlogContent(
          topic.title,
          topic.category,
          topic.seoBrief,
          editorialContext,
          {
            author: bylineAuthor,
            preferQualityModel: pipelineAttempt >= 1,
            excludeTitles: rejectedTitles,
          }
        );

        await assertPlanUnique(
          {
            title: topic.title,
            description: contentPlan.description,
            h2Outline: contentPlan.h2Outline,
            slug,
          },
          uniquenessCtx
        );

        const blogData = await generateBlogContent(
          topic.title,
          topic.category,
          topic.seoBrief,
          editorialContext,
          {
            author: bylineAuthor,
            useOutlinePass: false,
            preApprovedOutline: contentPlan.outlineJson,
            preferQualityModel: pipelineAttempt >= 1,
            excludeTitles: rejectedTitles,
            lockedTitle: topic.title,
          }
        );

        if (!blogData.title || !blogData.description || !blogData.content) {
          throw new Error("Failed to generate complete blog content");
        }
        attemptedTitle = blogData.title;

        await assertBlogDraftUnique(
          {
            title: blogData.title,
            description: blogData.description,
            content: blogData.content,
            slug,
          },
          uniquenessCtx
        );

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
            authorExpertise: resolveAuthorExpertiseTags(bylineAuthor),
            plannedCategory: automationPlan.category.name,
            pipelineAttempt: pipelineAttempt + 1,
          geminiBudget: getGeminiDailyBudget(),
          },
          schedule: await getBlogAutomationSchedule(),
        });
      } catch (error) {
        lastError = error;
        const msg = error instanceof Error ? error.message : String(error);
        if (attemptedTitle) {
          trackRejectedTitle(rejectedTitles, attemptedTitle);
        }
        trackRejectedFromError(rejectedTitles, msg);

        if (
          isRetryableGenerationError(error) &&
          pipelineAttempt < MAX_PIPELINE_ATTEMPTS - 1
        ) {
          console.warn(
            `Blog pipeline attempt ${pipelineAttempt + 1} rejected, retrying with new angle:`,
            msg
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
    if (error instanceof GeminiDailyBudgetError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          geminiBudget: error.snapshot,
        },
        { status: 429 }
      );
    }
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
      geminiBudget: getGeminiDailyBudget(),
      blogPipelineMaxCalls: getBlogPipelineMaxCalls(),
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
