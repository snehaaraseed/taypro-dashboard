import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { generateBlogContent, planBlogContent } from "@/lib/aiService";
import { isRetryableGenerationError } from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import {
  buildSeoKeywordBrief,
  findSeoKeywordRow,
  formatTopicCategory,
  inferSearchIntent,
  listAvailableKeywordRows,
} from "@/lib/seo/keyword-stats";
import {
  buildContentFingerprint,
  extractH2Headings,
} from "@/lib/seo/blog-similarity";
import { inferAngleIdFromTitle } from "@/lib/seo/blog-topic-angles";
import { formatWordCountPreview } from "@/lib/seo/blog-word-count-tier";
import { loadBlogUniquenessContext } from "@/lib/seo/blog-plan-gates";
import {
  assertAdminBlogDraftGates,
  assertAdminBlogPlanGates,
  assertAdminBlogTopicGates,
} from "@/lib/seo/admin-generate-gates";
import { pickAuthorForBlogTopic } from "@/lib/cms/authorService";
import { rankCategoriesForKeyword } from "@/lib/cms/blog-author-expertise";
import type { TopicCategory } from "@/lib/topicCategories";
import { addPublishedTopic } from "@/lib/topicTracker";
import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { requireAuth } from "@/app/utils/auth";
import {
  formatIntentCategorySuffix,
  formatKeywordIntentClusterPrompt,
  recordKeywordIntentWritten,
  resolveStoredIntentCluster,
} from "@/lib/seo/keyword-intent-registry";

const MAX_GENERATION_ATTEMPTS = 3;

/** Plan + full write + validation (matches automation depth). */
export const maxDuration = 600;

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
    const uniquenessCtx = await loadBlogUniquenessContext();
    const category: TopicCategory = rankCategoriesForKeyword(seoKeyword)[0] ?? {
      name: "Custom",
      description: "Admin-authored post",
      keywords: [],
    };
    const bylineAuthor = await pickAuthorForBlogTopic({
      seoKeyword,
      category,
    });
    const categoryName = category.name;
    const keywordRow = findSeoKeywordRow(seoKeyword);
    const availableRows = keywordRow ? await listAvailableKeywordRows() : [];
    const seoBrief = keywordRow
      ? buildSeoKeywordBrief(keywordRow, availableRows)
      : null;
    const searchIntent =
      seoBrief?.searchIntent ?? inferSearchIntent(seoKeyword);
    const angleId = inferAngleIdFromTitle(seoKeyword, topic);
    const keywordIntentClusterPrompt = formatKeywordIntentClusterPrompt({
      keyword: seoKeyword,
      title: topic,
      angleId,
    });
    let lastError: unknown;

    for (let genAttempt = 0; genAttempt < MAX_GENERATION_ATTEMPTS; genAttempt++) {
      try {
        const slug = await assertAdminBlogTopicGates({
          title: topic,
          seoKeyword,
          ctx: uniquenessCtx,
        });

        const writerOptions = {
          author: bylineAuthor,
          preferQualityModel: genAttempt >= 1,
          focusedKeywords,
          searchIntent,
          angleId,
          volumeBucket: seoBrief?.volumeBucket,
          competitionIndex: seoBrief?.competitionIndex,
          keywordIntentClusterPrompt,
        };

        const contentPlan = await planBlogContent(
          topic,
          categoryName,
          seoBrief,
          editorialContext,
          writerOptions
        );

        await assertAdminBlogPlanGates(
          {
            title: topic,
            description: contentPlan.description,
            h2Outline: contentPlan.h2Outline,
            slug,
          },
          uniquenessCtx
        );

        const blogData = await generateBlogContent(
          topic,
          categoryName,
          seoBrief,
          editorialContext,
          {
            userBrief: brief,
            ...writerOptions,
            preApprovedOutline: contentPlan.outlineJson,
            lockedTitle: topic,
            lockedDescription: contentPlan.description,
            plannedFaqQuestions: contentPlan.faqQuestions,
            slug,
          }
        );

        if (!blogData.title || !blogData.description || !blogData.content) {
          throw new Error("Failed to generate complete blog content");
        }

        await assertAdminBlogDraftGates(
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
          seoKeyword,
          category: categoryName,
        });

        const { content: contentWithImages, inlineImage } =
          await enrichBlogContentWithInlineImages({
            content: blogData.content,
            title: blogData.title,
            description: blogData.description,
            seoKeyword,
            category: categoryName,
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
            author: bylineAuthor.name,
            content: contentWithImages,
            faqs: blogData.faqs,
            publishDate: new Date().toISOString(),
            published: false,
            seoKeyword,
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

        const manualCluster = seoKeyword
          ? resolveStoredIntentCluster({
              keyword: seoKeyword,
              aiIntent: contentPlan.intentFamily,
              aiSubAngle: contentPlan.subAngle,
              angleId,
              title: blogData.title,
            })
          : null;

        await addPublishedTopic(
          blogData.title,
          result.slug,
          seoKeyword && manualCluster
            ? `${formatTopicCategory(categoryName, seoKeyword)}|${formatIntentCategorySuffix(
                manualCluster.intentFamily,
                manualCluster.subAngle
              )}`
            : formatTopicCategory(categoryName, seoKeyword),
          {
            h2Outline: extractH2Headings(contentWithImages),
            contentFingerprint: buildContentFingerprint(
              blogData.title,
              blogData.description,
              contentWithImages
            ),
            wordCountTier: formatWordCountPreview({
              primaryKeyword: seoKeyword,
              angleId,
              searchIntent,
              volumeBucket: seoBrief?.volumeBucket,
              competitionIndex: seoBrief?.competitionIndex,
            }).wordCountTier,
          }
        );

        if (seoKeyword && manualCluster) {
          recordKeywordIntentWritten({
            keyword: seoKeyword,
            title: blogData.title,
            slug: result.slug,
            angleId,
            intentFamily: manualCluster.intentFamily,
            subAngle: manualCluster.subAngle,
            source: "manual",
          });
        }

        revalidatePath("/admin/blogs");
        await revalidatePublicContent([`/blog/${result.slug}`, "/blog"], {
          sitemap: true,
        });

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
        if (
          isRetryableGenerationError(error) &&
          genAttempt < MAX_GENERATION_ATTEMPTS - 1
        ) {
          console.warn(
            `Admin blog generation attempt ${genAttempt + 1} rejected, retrying:`,
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
