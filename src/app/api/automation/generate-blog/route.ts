import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import {
  generateBlogContent,
  planBlogContent,
  type GeneratedTopic,
} from "@/lib/aiService";
import {
  classifyGenerationFailure,
  getBlogPipelineMaxOuterAttempts,
} from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import { formatTopicCategory } from "@/lib/seo/keyword-stats";
import {
  assertBlogDraftUnique,
  assertPlanUnique,
  findKeywordCorpusConflict,
  findTitleConflict,
  loadBlogUniquenessContext,
} from "@/lib/seo/blog-plan-gates";
import {
  EditorialPreflightError,
  formatPreFlightFailure,
  preFlightUniquenessProbe,
} from "@/lib/seo/blog-preflight-gates";
import { findSimilarCorpusEntries } from "@/lib/seo/corpus-index";
import {
  buildContentFingerprint,
  extractH2Headings,
  stripHtmlToPlainText,
} from "@/lib/seo/blog-similarity";
import { formatWordCountPreview } from "@/lib/seo/blog-word-count-tier";
import type { ResolveBlogWordCountInput } from "@/lib/seo/blog-word-count-tier";
import {
  pickTopicTitleHybrid,
  planBlogAutomationHybrid,
} from "@/lib/seo/blog-automation-hybrid";
import { pickCategoryForSeoBrief } from "@/lib/cms/blog-author-expertise";
import { pickAuthorForBlogTopic } from "@/lib/cms/authorService";
import { resolveAuthorExpertiseTags } from "@/lib/cms/blog-author-expertise";
import {
  getBlogAutomationSchedule,
  addPublishedTopic,
  getBlogAutomationTimezone,
} from "@/lib/topicTracker";
import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { isAutomationAuthorized } from "@/lib/security";
import {
  GeminiDailyBudgetError,
  getBlogPipelineMaxCalls,
  getGeminiDailyBudget,
  getSerpMaxCallsPerBlog,
} from "@/lib/gemini/daily-budget";
import { runGroundedFactResearch } from "@/lib/gemini/grounded-fact-research";
import { runGroundedSerpResearch } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import {
  assertCheckpointB,
  buildForbiddenTitles,
  formatCoverageTopicCategory,
  isCoverageLedgerEnabled,
  loadCachedSerpBrief,
  markSlotFailed,
  markSlotFilled,
  pickNextEditorialContract,
  pickTitleFromSerpBrief,
  persistBlogResearchBriefs,
  saveCachedSerpBrief,
  type EditorialContract,
} from "@/lib/seo/coverage-ledger";
import {
  getCampaignPreview,
  getKeywordCampaignEntry,
  isKeywordCampaignEnabled,
  markCampaignPublished,
  pickFocusKeywordForToday,
} from "@/lib/seo/keyword-campaign";

/** Outer contract attempts; in-place expansion retries happen inside generateBlogContent. */
const MAX_PIPELINE_ATTEMPTS = getBlogPipelineMaxOuterAttempts();

/** Imagen + long Gemini runs; cron curl allows 900s — keep in sync. */
export const maxDuration = 900;

function buildWordCountInput(input: {
  primaryKeyword?: string;
  angleId?: string;
  searchIntent?: string;
  volumeBucket?: number;
  competitionIndex?: number;
}): ResolveBlogWordCountInput {
  return {
    primaryKeyword: input.primaryKeyword,
    angleId: input.angleId,
    searchIntent: input.searchIntent,
    volumeBucket: input.volumeBucket,
    competitionIndex: input.competitionIndex,
  };
}

async function pickAutomationTopic(
  editorialContext: string,
  rejectedTitles: string[],
  automationPlan: Awaited<ReturnType<typeof planBlogAutomationHybrid>>
): Promise<GeneratedTopic> {
  const { author, category, seoBrief } = automationPlan;

  if (!seoBrief?.primary) {
    throw new Error("No SEO keyword available for topic selection");
  }

  const picked = await pickTopicTitleHybrid({
    seoBrief,
    category,
    author,
    editorialContext,
    rejectedTitles,
  });

  return {
    title: picked.title,
    category: category.name,
    seoKeyword: seoBrief.primary,
    seoBrief,
    angleId: picked.angleId,
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

function trackRejectedKeyword(rejectedKeywords: string[], keyword: string): void {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return;
  if (!rejectedKeywords.some((k) => k.toLowerCase() === trimmed)) {
    rejectedKeywords.push(keyword.trim());
  }
}

function trackRejectedSlot(rejectedSlotKeys: string[], slotKey: string): void {
  const trimmed = slotKey.trim();
  if (!trimmed) return;
  if (!rejectedSlotKeys.includes(trimmed)) {
    rejectedSlotKeys.push(trimmed);
  }
}

/** Extract slug from similarity error tail: "... (slug-here)" */
function extractSimilaritySlug(msg: string): string | null {
  const match = msg.match(/\(([a-z0-9-]+)\)\s*$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function shouldRejectKeyword(msg: string): boolean {
  return msg.includes("already covered by existing post");
}

function trackExcludedCorpusSlug(excludeSlugs: string[], slug: string): void {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed) return;
  if (!excludeSlugs.includes(trimmed)) {
    excludeSlugs.push(trimmed);
  }
}

async function resolveTopicFromLedger(input: {
  editorialContext: string;
  rejectedTitles: string[];
  rejectedKeywords: string[];
  rejectedSlotKeys: string[];
  uniquenessCtx: Awaited<ReturnType<typeof loadBlogUniquenessContext>>;
  focusKeyword?: string | null;
}): Promise<{
  topic: GeneratedTopic;
  contract: EditorialContract;
  bylineAuthor: Awaited<ReturnType<typeof pickAuthorForBlogTopic>>;
  categoryName: string;
  serpBrief: SerpResearchBrief;
  factBrief: FactResearchBrief;
  serpCalls: number;
  lockedDescription: string;
  forbiddenAngles: Awaited<ReturnType<typeof findSimilarCorpusEntries>>;
  focusKeyword: string | null;
}> {
  const focusKeyword =
    input.focusKeyword?.toLowerCase().trim() ||
    (isKeywordCampaignEnabled()
      ? await pickFocusKeywordForToday({
          excludeKeywords: input.rejectedKeywords,
        })
      : null);

  let contract = await pickNextEditorialContract({
    excludeKeywords: input.rejectedKeywords,
    rejectedSlotKeys: input.rejectedSlotKeys,
    corpus: input.uniquenessCtx.corpus,
    uniquenessCtx: input.uniquenessCtx,
    focusKeyword: focusKeyword ?? undefined,
  });

  if (!contract && focusKeyword) {
    contract = await pickNextEditorialContract({
      excludeKeywords: input.rejectedKeywords,
      rejectedSlotKeys: input.rejectedSlotKeys,
      corpus: input.uniquenessCtx.corpus,
      uniquenessCtx: input.uniquenessCtx,
    });
  }

  if (!contract) {
    throw new Error("No editorial contract available for blog automation");
  }

  const category = pickCategoryForSeoBrief(contract.seoBrief);
  const bylineAuthor = await pickAuthorForBlogTopic({
    seoKeyword: contract.keyword,
    category,
    searchIntent: contract.seoBrief.searchIntent,
  });

  const forbiddenTitles = buildForbiddenTitles(
    input.uniquenessCtx.corpus,
    input.rejectedTitles
  );

  let serpCalls = 0;
  let serpBrief = loadCachedSerpBrief(contract.slotKey);
  if (!serpBrief) {
    serpBrief = await runGroundedSerpResearch({
      keyword: contract.keyword,
      angle: contract.angleLabel,
      audience: contract.audience,
      forbiddenTitles,
      forbiddenArchetypes: contract.forbiddenArchetypes,
      saturatedH2Themes: contract.forbiddenH2Themes,
      serpCallsSoFar: serpCalls,
    });
    serpCalls += 1;
    saveCachedSerpBrief(contract.slotKey, serpBrief);
  }

  let title = await pickTitleFromSerpBrief(
    serpBrief,
    contract,
    forbiddenTitles
  );

  if (!title) {
    const fallback = await pickTopicTitleHybrid({
      seoBrief: contract.seoBrief,
      category,
      author: bylineAuthor,
      editorialContext: input.editorialContext,
      rejectedTitles: input.rejectedTitles,
    });
    title = fallback.title;
  }

  if (!title) {
    title = contract.seedTitle;
  }

  const lockedDescription = contract.syntheticMetaDescription;
  await assertCheckpointB(
    contract,
    title,
    lockedDescription,
    input.uniquenessCtx,
    input.uniquenessCtx.corpus
  );

  const factBrief = await runGroundedFactResearch({
    keyword: contract.keyword,
    title,
    commonH2Themes: serpBrief.commonH2Themes,
    serpGaps: serpBrief.serpGaps,
    serpCallsSoFar: serpCalls,
  });
  serpCalls += 1;

  const forbiddenAngles = findSimilarCorpusEntries(
    { title, description: lockedDescription, keyword: contract.keyword },
    5
  );

  return {
    topic: {
      title,
      category: category.name,
      seoKeyword: contract.keyword,
      seoBrief: contract.seoBrief,
      angleId: contract.angleId,
    },
    contract,
    bylineAuthor,
    categoryName: category.name,
    serpBrief,
    factBrief,
    serpCalls,
    lockedDescription,
    forbiddenAngles,
    focusKeyword,
  };
}

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const ledgerEnabled = isCoverageLedgerEnabled();

  try {
    const schedule = await getBlogAutomationSchedule();
    if (!force && !schedule.canGenerate) {
      return NextResponse.json(
        {
          success: false,
          message: `Daily blog cap reached (already published today, ${getBlogAutomationTimezone()} calendar). Next eligible run: ${schedule.nextEligibleAt}. Use ?force=true to override.`,
          schedule,
        },
        { status: 200 }
      );
    }

    const editorialContext = await formatEditorialContextPrompt();
    const uniquenessCtx = await loadBlogUniquenessContext();
    let lastError: unknown;
    const rejectedTitles: string[] = [];
    const rejectedKeywords: string[] = [];
    const rejectedSlotKeys: string[] = [];
    const excludeKnowledgeSlugs: string[] = [];

    for (
      let pipelineAttempt = 0;
      pipelineAttempt < MAX_PIPELINE_ATTEMPTS;
      pipelineAttempt++
    ) {
      let attemptedTitle = "";
      let attemptedKeyword = "";
      let attemptedSlotKey = "";
      let serpCallsThisRun = 0;
      let editorialContract: EditorialContract | null = null;
      let serpBrief: SerpResearchBrief | undefined;
      let factBrief: FactResearchBrief | undefined;
      let lockedDescription = "";
      let forbiddenAngles: Awaited<ReturnType<typeof findSimilarCorpusEntries>> =
        [];
      let campaignFocusKeyword: string | null = null;

      try {
        let topic: GeneratedTopic;
        let bylineAuthor: Awaited<ReturnType<typeof pickAuthorForBlogTopic>>;
        let plannedCategoryName: string;

        if (ledgerEnabled) {
          const ledgerResult = await resolveTopicFromLedger({
            editorialContext,
            rejectedTitles,
            rejectedKeywords,
            rejectedSlotKeys,
            uniquenessCtx,
          });
          topic = ledgerResult.topic;
          bylineAuthor = ledgerResult.bylineAuthor;
          plannedCategoryName = ledgerResult.categoryName;
          editorialContract = ledgerResult.contract;
          attemptedSlotKey = ledgerResult.contract.slotKey;
          serpBrief = ledgerResult.serpBrief;
          factBrief = ledgerResult.factBrief;
          serpCallsThisRun = ledgerResult.serpCalls;
          lockedDescription = ledgerResult.lockedDescription;
          forbiddenAngles = ledgerResult.forbiddenAngles;
          campaignFocusKeyword = ledgerResult.focusKeyword;
          for (const entry of forbiddenAngles) {
            trackExcludedCorpusSlug(excludeKnowledgeSlugs, entry.slug);
          }
        } else {
          const automationPlan = await planBlogAutomationHybrid(
            editorialContext,
            pickAuthorForBlogTopic,
            {
              excludeKeywords: rejectedKeywords,
              corpus: uniquenessCtx.corpus,
            }
          );
          bylineAuthor = automationPlan.author;
          plannedCategoryName = automationPlan.category.name;

          if (!automationPlan.seoBrief?.primary) {
            throw new Error("No SEO keyword available for topic selection");
          }

          const keywordConflict = findKeywordCorpusConflict(
            automationPlan.seoBrief.primary,
            uniquenessCtx.corpus
          );
          if (keywordConflict) {
            trackRejectedKeyword(
              rejectedKeywords,
              automationPlan.seoBrief.primary
            );
            trackExcludedCorpusSlug(excludeKnowledgeSlugs, keywordConflict.slug);
            throw new Error(
              `Keyword "${automationPlan.seoBrief.primary}" already covered by existing post (${keywordConflict.reason}, score ${keywordConflict.score.toFixed(2)}): "${keywordConflict.title}" (${keywordConflict.slug})`
            );
          }

          topic = await pickAutomationTopic(
            editorialContext,
            rejectedTitles,
            automationPlan
          );
        }

        if (!topic.seoBrief?.primary) {
          throw new Error("No SEO keyword available for topic selection");
        }
        attemptedKeyword = topic.seoKeyword;
        attemptedTitle = topic.title;

        if (!topic.title) {
          throw new Error("Failed to generate a unique topic");
        }

        const slug = createSlug(topic.title);

        const titleConflict = await findTitleConflict(topic.title, slug);
        if (titleConflict) {
          trackRejectedTitle(rejectedTitles, topic.title);
          throw new Error(
            `Topic already published or too similar: "${topic.title}" (${titleConflict.slug})`
          );
        }

        const writerOptions = {
          author: bylineAuthor,
          preferQualityModel: pipelineAttempt >= 1,
          excludeTitles: rejectedTitles,
          serpBrief,
          factBrief,
          angleId: editorialContract?.angleId ?? topic.angleId,
          structuralPromise: editorialContract?.structuralPromise,
          requiredDifferentiator: editorialContract?.requiredDifferentiator,
          forbiddenH2Themes: editorialContract?.forbiddenH2Themes,
          forbiddenAngles,
          lockedDescription: lockedDescription || undefined,
        };

        const wordCountInput = buildWordCountInput({
          primaryKeyword: topic.seoBrief?.primary ?? topic.seoKeyword,
          angleId: writerOptions.angleId,
          searchIntent: topic.seoBrief?.searchIntent,
          volumeBucket: topic.seoBrief?.volumeBucket,
          competitionIndex: topic.seoBrief?.competitionIndex,
        });

        const contentPlan = await planBlogContent(
          topic.title,
          topic.category,
          topic.seoBrief,
          editorialContext,
          writerOptions
        );

        await assertPlanUnique(
          {
            title: topic.title,
            description: lockedDescription || contentPlan.description,
            h2Outline: contentPlan.h2Outline,
            slug,
          },
          uniquenessCtx
        );

        const checkpointC = await preFlightUniquenessProbe(
          {
            title: topic.title,
            description: lockedDescription || contentPlan.description,
            h2Outline: contentPlan.h2Outline,
            slug,
            excludeSlugs: excludeKnowledgeSlugs,
          },
          uniquenessCtx,
          uniquenessCtx.corpus
        );
        if (checkpointC) {
          throw new Error(formatPreFlightFailure(checkpointC));
        }

        const blogData = await generateBlogContent(
          topic.title,
          topic.category,
          topic.seoBrief,
          editorialContext,
          {
            ...writerOptions,
            useOutlinePass: false,
            preApprovedOutline: contentPlan.outlineJson,
            lockedTitle: topic.title,
            excludeKnowledgeSlugs,
            plannedFaqQuestions: contentPlan.faqQuestions,
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
            seoKeyword: topic.seoKeyword || topic.seoBrief?.primary,
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

        const categoryMeta =
          editorialContract && ledgerEnabled
            ? formatCoverageTopicCategory(plannedCategoryName, editorialContract)
            : topic.seoKeyword
              ? formatTopicCategory(topic.category, topic.seoKeyword)
              : topic.category;

        const actualWords = stripHtmlToPlainText(contentWithImages)
          .split(/\s+/)
          .filter(Boolean).length;
        const wordCount = formatWordCountPreview(wordCountInput, actualWords);

        await addPublishedTopic(blogData.title, result.slug, categoryMeta, {
          h2Outline: extractH2Headings(contentWithImages),
          contentFingerprint: buildContentFingerprint(
            blogData.title,
            blogData.description,
            contentWithImages
          ),
          wordCountTier: wordCount.wordCountTier,
        });

        if (editorialContract && ledgerEnabled) {
          markSlotFilled(editorialContract.slotKey, result.slug);
          if (serpBrief) {
            persistBlogResearchBriefs({
              slug: result.slug,
              slot: editorialContract,
              serpBrief,
              factBrief,
            });
          }
          const campaignKeyword =
            campaignFocusKeyword ?? editorialContract.keyword;
          const campaignEntry = getKeywordCampaignEntry(campaignKeyword);
          markCampaignPublished(campaignKeyword, {
            slug: result.slug,
            positionAtPublish: campaignEntry?.lastPosition ?? null,
          });
        }

        revalidatePath(`/blog/${result.slug}`);
        revalidatePath("/blog");
        revalidatePath("/admin/blogs");
        revalidateSitemap();

        return NextResponse.json({
          success: true,
          message: "Blog generated and published (English live)",
          wordCount,
          blog: {
            title: blogData.title,
            slug: result.slug,
            url: `/blog/${result.slug}`,
            adminUrl: `/admin/blogs`,
            status: "published",
            category: topic.category,
            seoKeyword: topic.seoKeyword || undefined,
            searchIntent: topic.seoBrief?.searchIntent,
            coverageSlot: editorialContract?.slotKey,
            editorialArchetype: editorialContract?.archetype,
            campaignFocusKeyword: campaignFocusKeyword ?? undefined,
            serpCalls: serpCallsThisRun,
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
            plannedCategory: plannedCategoryName,
            pipelineAttempt: pipelineAttempt + 1,
            geminiBudget: getGeminiDailyBudget(),
          },
          schedule: await getBlogAutomationSchedule(),
        });
      } catch (error) {
        lastError = error;
        if (error instanceof EditorialPreflightError) {
          attemptedSlotKey = error.slotKey;
          attemptedKeyword = error.keyword;
          attemptedTitle = error.title;
        }
        const msg = error instanceof Error ? error.message : String(error);
        const failureKind = classifyGenerationFailure(error);
        if (attemptedTitle) {
          trackRejectedTitle(rejectedTitles, attemptedTitle);
        }
        if (attemptedKeyword && shouldRejectKeyword(msg)) {
          trackRejectedKeyword(rejectedKeywords, attemptedKeyword);
        }
        if (attemptedSlotKey) {
          trackRejectedSlot(rejectedSlotKeys, attemptedSlotKey);
        }
        trackRejectedFromError(rejectedTitles, msg);
        const similarSlug = extractSimilaritySlug(msg);
        if (similarSlug) {
          trackExcludedCorpusSlug(excludeKnowledgeSlugs, similarSlug);
        }

        if (failureKind === "quota") {
          if (attemptedSlotKey && ledgerEnabled) {
            markSlotFailed(attemptedSlotKey, msg);
          }
          throw error;
        }

        if (
          (failureKind === "new_contract" || failureKind === "in_place") &&
          pipelineAttempt < MAX_PIPELINE_ATTEMPTS - 1
        ) {
          console.warn(
            `Blog pipeline attempt ${pipelineAttempt + 1} rejected (${failureKind}), picking new contract:`,
            msg
          );
          if (attemptedSlotKey && ledgerEnabled) {
            markSlotFailed(attemptedSlotKey, msg);
          }
          continue;
        }

        if (attemptedSlotKey && ledgerEnabled) {
          markSlotFailed(attemptedSlotKey, msg);
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
    const uniquenessCtx = await loadBlogUniquenessContext();
    const campaignEnabled = isKeywordCampaignEnabled();
    const focusKeyword = campaignEnabled
      ? await pickFocusKeywordForToday()
      : null;
    const focusEntry = focusKeyword
      ? getKeywordCampaignEntry(focusKeyword)
      : null;
    const nextContract = isCoverageLedgerEnabled()
      ? await pickNextEditorialContract({
          corpus: uniquenessCtx.corpus,
          uniquenessCtx,
          focusKeyword: focusKeyword ?? undefined,
        }).then(async (contract) => {
          if (contract || !focusKeyword) return contract;
          return pickNextEditorialContract({
            corpus: uniquenessCtx.corpus,
            uniquenessCtx,
          });
        })
      : null;

    return NextResponse.json({
      ...schedule,
      coverageLedgerEnabled: isCoverageLedgerEnabled(),
      keywordCampaignEnabled: campaignEnabled,
      focusKeyword,
      focusKeywordNextReviewAfter: focusEntry?.nextReviewAfter ?? null,
      focusKeywordGscPosition: focusEntry?.lastPosition ?? null,
      campaignPreview: campaignEnabled ? getCampaignPreview() : null,
      serpMaxCallsPerBlog: getSerpMaxCallsPerBlog(),
      blogPipelineMaxOuterAttempts: MAX_PIPELINE_ATTEMPTS,
      geminiBudget: getGeminiDailyBudget(),
      blogPipelineMaxCalls: getBlogPipelineMaxCalls(),
      nextEditorialContract: nextContract
        ? {
            slotKey: nextContract.slotKey,
            keyword: nextContract.keyword,
            angleId: nextContract.angleId,
            archetype: nextContract.archetype,
            seedTitle: nextContract.seedTitle,
            structuralPromise: nextContract.structuralPromise,
            wordCount: formatWordCountPreview(
              buildWordCountInput({
                primaryKeyword: nextContract.keyword,
                angleId: nextContract.angleId,
                searchIntent: nextContract.seoBrief.searchIntent,
                volumeBucket: nextContract.seoBrief.volumeBucket,
                competitionIndex: nextContract.seoBrief.competitionIndex,
              })
            ),
          }
        : null,
      message: schedule.canGenerate
        ? "Ready to generate and publish a new post"
        : `Already published today (${getBlogAutomationTimezone()} calendar). Next run: ${schedule.nextEligibleAt}. POST with ?force=true to override.`,
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
