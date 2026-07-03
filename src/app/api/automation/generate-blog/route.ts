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
  isGeminiQuotaErrorMessage,
} from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import {
  buildSeoKeywordBrief,
  findSeoKeywordRow,
  formatTopicCategory,
  inferSearchIntent,
  loadSeoKeywordRows,
} from "@/lib/seo/keyword-stats";
import {
  assertBlogDraftUnique,
  assertPlanUnique,
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
import { pickTopicTitleHybrid, pickSeoKeywordBriefHybrid } from "@/lib/seo/blog-automation-hybrid";
import {
  formatKeywordIntentClusterPrompt,
  formatIntentCategorySuffix,
  recordKeywordIntentWritten,
  recommendIntentForContract,
  resolveStoredIntentCluster,
  syncKeywordIntentRegistryFromPublishedTopics,
} from "@/lib/seo/keyword-intent-registry";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import { pickCategoryForSeoBrief } from "@/lib/cms/blog-author-expertise";
import { pickAuthorForBlogTopic } from "@/lib/cms/authorService";
import { resolveAuthorExpertiseTags } from "@/lib/cms/blog-author-expertise";
import {
  getBlogAutomationSchedule,
  addPublishedTopic,
  getBlogAutomationTimezone,
  rotateCadenceAfterSuccessfulWrite,
} from "@/lib/topicTracker";
import {
  pickBlogContentFormat,
  type BlogContentFormat,
} from "@/lib/seo/blog-content-format";
import { pickAutomationPublishAt } from "@/lib/cms/blog-automation-calendar";
import {
  competitorPrimaryKeywordReason,
  isCompetitorLedTitle,
  isCompetitorPrimaryKeyword,
} from "@/lib/seo/competitor-keyword-guard";
import {
  formatBlogWriterStartInIst,
  formatNextBlogWriterStartInIst,
  formatNextGeminiQuotaResetInIst,
  isPastBlogWriterStartIst,
} from "@/lib/gemini/quota-schedule";
import {
  buildEmptyFactBrief,
  buildFallbackSerpBrief,
  GroundingCallBudgetExceededError,
  GroundingQuotaExceededError,
  getGeminiGroundingMaxCallsPerBlog,
  isGroundingCallBudgetError,
  isGroundingQuotaError,
} from "@/lib/gemini/grounding-config";

import { createBlogFiles, createSlug } from "@/app/utils/blogFileUtils";
import { isAutomationAuthorized } from "@/lib/security";
import { runGroundedFactResearch } from "@/lib/gemini/grounded-fact-research";
import { runGroundedSerpResearch } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import {
  buildSyntheticMetaDescription,
  getAngleContractMeta,
} from "@/lib/seo/blog-angle-contracts";
import {
  assertCheckpointB,
  buildForbiddenTitles,
  buildSlotCatalog,
  formatCoverageTopicCategory,
  isCoverageLedgerEnabled,
  loadCachedSerpBrief,
  markSlotFailed,
  markSlotFilled,
  parseSlotKey,
  pickNextEditorialContract,
  pickNextEditorialContractForCron,
  pickNextEditorialContractAlways,
  prunePreflightFailedSlots,
  persistBlogResearchBriefs,
  resolveTitleForEditorialContract,
  saveCachedSerpBrief,
  SlotTitleExhaustedError,
  type EditorialContract,
} from "@/lib/seo/coverage-ledger";
import {
  getPermanentRejectedSlotKeys,
  incrementEditorialAttemptsToday,
  recordEditorialRejection,
  loadEditorialState,
} from "@/lib/seo/editorial-state";
import {
  evergreenToPlanInput,
  loadEvergreenFallbackCatalog,
  pickNextEvergreenFallback,
  type EvergreenFallbackEntry,
} from "@/lib/seo/evergreen-fallback";
import {
  buildEditorialContractFromBrief,
  buildSerpBriefFromBrief,
  pickCalendarBrief,
} from "@/lib/seo/discovered-editorial-contract";
import {
  countBriefStats,
  markBriefFilled,
  pickNextBrief,
  type DiscoveredBrief,
} from "@/lib/seo/discovered-brief-queue";
import { ensureBriefQueueForAutomation, runTopicDiscovery, getDiscoveryWeeklyTarget } from "@/lib/seo/run-topic-discovery";
import { isCuratedBriefId } from "@/lib/seo/curated-blog-topics";
import {
  evaluateRankReadiness,
  rankReadinessFailureMessage,
} from "@/lib/seo/rank-readiness";
import {
  judgeBlocksPublish,
  judgeRankReadiness,
  rankJudgeFailureMessage,
} from "@/lib/seo/rank-readiness-judge";
import { enrichWithInlineCitations } from "@/lib/seo/inline-citations";
import { getGeminiKeyPoolSize } from "@/lib/gemini/api-keys";
import {
  DEFAULT_GEMMA_TEXT_MODEL,
  resolveAutomationTextModel,
} from "@/lib/gemini/free-tier-models";
import { groundingModelCandidates } from "@/lib/gemini/model-routing";
import { getQuotaBudgetSummary } from "@/lib/gemini/quota-budget";
import {
  getCampaignPreview,
  getKeywordCampaignEntry,
  isKeywordCampaignEnabled,
  markCampaignPublished,
  pickFocusKeywordForToday,
} from "@/lib/seo/keyword-campaign";

/** Per cron POST: outer attempt cap from env (optional floor via BLOG_AUTOMATION_MIN_OUTER_ATTEMPTS). */
function getAutomationOuterAttemptCap(): number | null {
  const envCap = getBlogPipelineMaxOuterAttempts();
  if (envCap === null) return null;
  const minRaw = process.env.BLOG_AUTOMATION_MIN_OUTER_ATTEMPTS?.trim();
  if (!minRaw) return envCap;
  const parsedMin = Number.parseInt(minRaw, 10);
  if (!Number.isFinite(parsedMin) || parsedMin <= 0) return envCap;
  return Math.max(envCap, parsedMin);
}

const PIPELINE_ATTEMPT_CAP = getAutomationOuterAttemptCap();

function getHybridFallbackAttemptCount(): number {
  const raw = process.env.BLOG_HYBRID_FALLBACK_ATTEMPTS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 8;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 8;
}

const HYBRID_FALLBACK_ATTEMPTS = getHybridFallbackAttemptCount();

function getEvergreenAttemptAllowance(): number {
  const raw = process.env.BLOG_EVERGREEN_FALLBACK_ATTEMPTS?.trim();
  if (raw === "0") return 0;
  const catalogLen = loadEvergreenFallbackCatalog().length;
  if (catalogLen === 0) return 0;
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  const cap = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  return Math.min(catalogLen, cap);
}

/** Always try brief queue + coverage ledger before evergreen/hybrid fallbacks. */
function resolveLedgerAttemptCap(): number {
  return PIPELINE_ATTEMPT_CAP ?? 30;
}

function getPipelineAttemptLimit(): number | null {
  if (PIPELINE_ATTEMPT_CAP === null) return null;
  return (
    resolveLedgerAttemptCap() +
    HYBRID_FALLBACK_ATTEMPTS +
    getEvergreenAttemptAllowance()
  );
}

/** Imagen + long Gemini runs; allow up to ~30 min for multi-slot pipeline on self-hosted PM2. */
export const maxDuration = 1800;

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

/** When every angle for a keyword is rejected, skip the whole keyword cluster. */
function maybeRejectKeywordWhenAnglesExhausted(
  rejectedSlotKeys: string[],
  rejectedKeywords: string[],
  slotKey: string
): void {
  const parsed = parseSlotKey(slotKey);
  if (!parsed) return;
  const keyword = parsed.keyword.toLowerCase();
  const anglesForKeyword = buildSlotCatalog().filter(
    (s) => s.keyword.toLowerCase() === keyword
  );
  if (anglesForKeyword.length === 0) return;
  const rejectedForKeyword = rejectedSlotKeys.filter((sk) => {
    const p = parseSlotKey(sk);
    return p?.keyword.toLowerCase() === keyword;
  });
  if (rejectedForKeyword.length >= anglesForKeyword.length) {
    trackRejectedKeyword(rejectedKeywords, keyword);
  }
}

/** Extract slug from similarity error tail: ", ... (slug-here)" */
function extractSimilaritySlug(msg: string): string | null {
  const match = msg.match(/\(([a-z0-9-]+)\)\s*$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

/**
 * Hybrid title exhaustion errors name the keyword whose angles are all used up.
 * Extract it so the next hybrid attempt rotates to a different keyword instead of
 * retrying the same dead-end keyword until the fallback budget is burned.
 */
function extractExhaustedHybridKeyword(msg: string): string | null {
  const match = msg.match(
    /(?:No unique topic title available for keyword|Hybrid fallback: no unique title for keyword) "([^"]+)"/i
  );
  return match?.[1]?.trim() ?? null;
}

function shouldRejectKeyword(msg: string): boolean {
  return (
    msg.includes("already covered by existing post") ||
    msg.includes("Outline too similar") ||
    msg.includes("Blog too similar") ||
    msg.includes("Topic already published") ||
    msg.includes("Keyword corpus conflict")
  );
}

function trackExcludedCorpusSlug(excludeSlugs: string[], slug: string): void {
  const trimmed = slug.trim().toLowerCase();
  if (!trimmed) return;
  if (!excludeSlugs.includes(trimmed)) {
    excludeSlugs.push(trimmed);
  }
}

function isHybridFallbackSlot(slotKey: string): boolean {
  return slotKey.startsWith("hybrid-fallback::");
}

function isBriefSlot(slotKey: string): boolean {
  return slotKey.startsWith("brief::");
}

function isEvergreenFallbackSlot(slotKey: string): boolean {
  return slotKey.startsWith("evergreen-fallback::");
}

function buildEvergreenOutlineJson(entry: EvergreenFallbackEntry): string {
  return JSON.stringify(
    {
      description: entry.description,
      intentFamily: entry.intentFamily,
      subAngle: entry.subAngle,
      h2Outline: entry.h2Outline,
      faqQuestions: [],
      quickAnswerBullets: [],
      mustCover: [],
      avoidTopics: [],
    },
    null,
    2
  );
}

function buildHybridFallbackContract(input: {
  seoBrief: NonNullable<EditorialContract["seoBrief"]>;
  angleId: string;
  title: string;
}): EditorialContract {
  const angleMeta = getAngleContractMeta(input.angleId);
  const keyword = input.seoBrief.primary;
  return {
    slotKey: `hybrid-fallback::${input.angleId}::${createSlug(input.title).slice(0, 48)}`,
    keyword,
    angleId: input.angleId,
    angleLabel: input.angleId.replace(/-/g, " "),
    seedTitle: input.title,
    audience: "om_lead",
    plantContext: "utility_india",
    seoBrief: input.seoBrief, ...angleMeta,
    syntheticMetaDescription: buildSyntheticMetaDescription(keyword, angleMeta),
    forbiddenArchetypes: [],
    forbiddenH2Themes: [],
  };
}

async function resolveTopicHybridFallback(input: {
  editorialContext: string;
  rejectedTitles: string[];
  rejectedKeywords: string[];
  uniquenessCtx: Awaited<ReturnType<typeof loadBlogUniquenessContext>>;
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
  focusKeyword: null;
}> {
  const seoBrief = await pickSeoKeywordBriefHybrid(input.editorialContext, {
    excludeKeywords: input.rejectedKeywords,
    corpus: input.uniquenessCtx.corpus,
  });
  if (!seoBrief) {
    throw new Error("Hybrid fallback: no keyword available outside coverage ledger");
  }

  const category = pickCategoryForSeoBrief(seoBrief);
  const bylineAuthor = await pickAuthorForBlogTopic({
    seoKeyword: seoBrief.primary,
    category,
    searchIntent: seoBrief.searchIntent,
  });

  const hybridRejected = [...input.rejectedTitles];
  let title = "";
  let angleId = "default-guide";
  let topicIntentFamily: SearchIntentFamily | undefined;
  let topicSubAngle: string | undefined;
  for (let i = 0; i < 10; i++) {
    const picked = await pickTopicTitleHybrid({
      seoBrief,
      category,
      author: bylineAuthor,
      editorialContext: input.editorialContext,
      rejectedTitles: hybridRejected,
    });
    const slug = createSlug(picked.title);
    const conflict = await findTitleConflict(picked.title, slug);
    if (conflict) {
      hybridRejected.push(picked.title);
      continue;
    }
    const draftContract = buildHybridFallbackContract({
      seoBrief,
      angleId: picked.angleId ?? angleId,
      title: picked.title,
    });
    const preflight = await preFlightUniquenessProbe(
      {
        title: picked.title,
        description: draftContract.syntheticMetaDescription,
        h2Outline: [],
        slug,
      },
      input.uniquenessCtx,
      input.uniquenessCtx.corpus
    );
    if (preflight) {
      hybridRejected.push(picked.title);
      continue;
    }
    title = picked.title;
    angleId = picked.angleId ?? angleId;
    topicIntentFamily = picked.intentFamily;
    topicSubAngle = picked.subAngle;
    break;
  }
  if (!title) {
    throw new Error(
      `Hybrid fallback: no unique title for keyword "${seoBrief.primary}"`
    );
  }

  const contract = buildHybridFallbackContract({ seoBrief, angleId, title });
  const lockedDescription = contract.syntheticMetaDescription;
  const forbiddenTitles = buildForbiddenTitles(
    input.uniquenessCtx.corpus,
    input.rejectedTitles
  );
  let serpCalls = 0;
  const serpResearchInput = {
    keyword: contract.keyword,
    angle: contract.angleLabel,
    audience: contract.audience,
    forbiddenTitles,
    forbiddenArchetypes: contract.forbiddenArchetypes,
    saturatedH2Themes: contract.forbiddenH2Themes,
    serpCallsSoFar: serpCalls,
  };
  let serpBrief: SerpResearchBrief;
  try {
    serpBrief = await runGroundedSerpResearch(serpResearchInput);
    serpCalls += 1;
  } catch (error) {
    if (isGroundingQuotaError(error) || isGroundingCallBudgetError(error)) {
      serpBrief = buildFallbackSerpBrief(serpResearchInput);
    } else {
      throw error;
    }
  }

  let factBrief: FactResearchBrief;
  try {
    factBrief = await runGroundedFactResearch({
      keyword: contract.keyword,
      title,
      commonH2Themes: serpBrief.commonH2Themes,
      serpGaps: serpBrief.serpGaps,
      serpCallsSoFar: serpCalls,
    });
    serpCalls += 1;
  } catch (error) {
    if (isGroundingQuotaError(error) || isGroundingCallBudgetError(error)) {
      factBrief = buildEmptyFactBrief(contract.keyword, title);
    } else {
      throw error;
    }
  }

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
      intentFamily: topicIntentFamily,
      subAngle: topicSubAngle,
    },
    contract,
    bylineAuthor,
    categoryName: category.name,
    serpBrief,
    factBrief,
    serpCalls,
    lockedDescription,
    forbiddenAngles,
    focusKeyword: null,
  };
}

async function resolveTopicFromEvergreenFallback(input: {
  rejectedTitles: string[];
  rejectedSlotKeys: string[];
  uniquenessCtx: Awaited<ReturnType<typeof loadBlogUniquenessContext>>;
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
  focusKeyword: null;
  evergreenEntry: EvergreenFallbackEntry;
}> {
  const entry = await pickNextEvergreenFallback({
    rejectedSlotKeys: input.rejectedSlotKeys,
    rejectedTitles: input.rejectedTitles,
    uniquenessCtx: input.uniquenessCtx,
  });
  if (!entry) {
    throw new Error("Evergreen fallback catalog exhausted");
  }

  const plan = evergreenToPlanInput(entry);

  const slug = createSlug(entry.title);
  const conflict = await findTitleConflict(entry.title, slug);
  if (conflict) {
    throw new Error(
      `Topic already published or too similar: "${entry.title}" (${conflict.slug})`
    );
  }

  const rows = loadSeoKeywordRows();
  const row = findSeoKeywordRow(entry.primaryKeyword);
  const seoBrief = row
    ? buildSeoKeywordBrief(row, rows)
    : {
        primary: entry.primaryKeyword,
        volumeBucket: 30,
        competition: "LOW",
        competitionIndex: 25,
        searchIntent: inferSearchIntent(entry.primaryKeyword),
        related: [],
      };

  const angleMeta = getAngleContractMeta(entry.angleId);
  const contract: EditorialContract = {
    slotKey: plan.slotKey,
    keyword: entry.primaryKeyword,
    angleId: entry.angleId,
    angleLabel: entry.subAngle.replace(/_/g, " "),
    seedTitle: entry.title,
    audience: "om_lead",
    plantContext: "utility_india",
    seoBrief, ...angleMeta,
    syntheticMetaDescription: entry.description,
    forbiddenArchetypes: [],
    forbiddenH2Themes: [],
  };

  const category = pickCategoryForSeoBrief(seoBrief);
  const bylineAuthor = await pickAuthorForBlogTopic({
    seoKeyword: entry.primaryKeyword,
    category,
    searchIntent: seoBrief.searchIntent,
  });

  const serpBrief = buildFallbackSerpBrief({
    keyword: entry.primaryKeyword,
    angle: contract.angleLabel,
    audience: contract.audience,
    forbiddenTitles: input.rejectedTitles,
  });
  const factBrief = buildEmptyFactBrief(entry.primaryKeyword, entry.title);
  const forbiddenAngles = findSimilarCorpusEntries(
    {
      title: entry.title,
      description: entry.description,
      keyword: entry.primaryKeyword,
    },
    5
  );

  console.warn(
    `[generate-blog] Evergreen fallback: ${entry.id} → "${entry.title}"`
  );

  return {
    topic: {
      title: entry.title,
      category: category.name,
      seoKeyword: entry.primaryKeyword,
      seoBrief,
      angleId: entry.angleId,
      intentFamily: entry.intentFamily,
      subAngle: entry.subAngle,
    },
    contract,
    bylineAuthor,
    categoryName: category.name,
    serpBrief,
    factBrief,
    serpCalls: 0,
    lockedDescription: entry.description,
    forbiddenAngles,
    focusKeyword: null,
    evergreenEntry: entry,
  };
}

async function resolveTopicFromLedger(input: {
  editorialContext: string;
  rejectedTitles: string[];
  rejectedKeywords: string[];
  rejectedSlotKeys: string[];
  uniquenessCtx: Awaited<ReturnType<typeof loadBlogUniquenessContext>>;
  focusKeyword?: string | null;
  useCalendarBackup?: boolean;
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
  brief?: DiscoveredBrief | null;
}> {
  const focusKeyword =
    input.focusKeyword?.toLowerCase().trim() ||
    (isKeywordCampaignEnabled()
      ? await pickFocusKeywordForToday({
          excludeKeywords: input.rejectedKeywords,
        })
      : null);

  const permanentRejected = [...getPermanentRejectedSlotKeys()];
  const allRejectedSlots = [
    ...new Set([...input.rejectedSlotKeys, ...permanentRejected]),
  ];

  let brief: DiscoveredBrief | null = null;
  let contract: EditorialContract | null = null;

  brief = pickCalendarBrief({
    useCalendarBackup: input.useCalendarBackup,
    rejectedSlotKeys: allRejectedSlots,
  });
  if (brief) {
    contract = buildEditorialContractFromBrief(brief);
    console.info(
      `[generate-blog] Brief calendar ${input.useCalendarBackup ? "backup" : "primary"} → ${brief.id}`
    );
  }

  if (!contract) {
    brief = await pickNextBrief({
      rejectedSlotKeys: allRejectedSlots,
    });
    if (brief) {
      contract = buildEditorialContractFromBrief(brief);
      console.info(`[generate-blog] Brief queue → ${brief.id}`);
    }
  }

  if (!contract) {
    contract = await pickNextEditorialContractForCron({
      excludeKeywords: input.rejectedKeywords,
      rejectedSlotKeys: allRejectedSlots,
      corpus: input.uniquenessCtx.corpus,
      uniquenessCtx: input.uniquenessCtx,
      focusKeyword: focusKeyword ?? undefined,
    });
    if (contract) {
      console.info(
        `[generate-blog] Legacy ledger fallback → ${contract.slotKey}`
      );
    }
  }

  if (!contract) {
    const { enqueueCuratedTopicsToBriefQueue } = await import(
      "@/lib/seo/curated-blog-topics"
    );
    const curated = await enqueueCuratedTopicsToBriefQueue({
      limit: getDiscoveryWeeklyTarget(),
    });
    if (curated.added > 0) {
      console.info(
        `[generate-blog] Curated backlog fallback enqueued +${curated.added} briefs (${curated.skipped} skipped)`
      );
      brief = await pickNextBrief({
        rejectedSlotKeys: allRejectedSlots,
      });
      if (brief) {
        contract = buildEditorialContractFromBrief(brief);
        console.info(`[generate-blog] Curated backlog brief → ${brief.id}`);
      }
    }
  }

  if (!contract) {
    throw new Error("Topic queue exhausted: no open brief or ledger slot remains");
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
  const serpResearchInput = {
    keyword: contract.keyword,
    angle: contract.angleLabel,
    audience: contract.audience,
    forbiddenTitles,
    forbiddenArchetypes: contract.forbiddenArchetypes,
    saturatedH2Themes: contract.forbiddenH2Themes,
    serpCallsSoFar: serpCalls,
  };
  let serpBrief = loadCachedSerpBrief(contract.slotKey);
  if (!serpBrief && brief) {
    serpBrief = buildSerpBriefFromBrief(brief);
    saveCachedSerpBrief(contract.slotKey, serpBrief);
    console.info(
      `[generate-blog] Reusing discovery grounding for brief ${brief.id} (0 extra SERP calls)`
    );
  }
  if (!serpBrief) {
    try {
      serpBrief = await runGroundedSerpResearch(serpResearchInput);
      serpCalls += 1;
      saveCachedSerpBrief(contract.slotKey, serpBrief);
    } catch (error) {
      if (
        isGroundingQuotaError(error) ||
        isGroundingCallBudgetError(error)
      ) {
        console.warn(
          "[generate-blog] SERP grounding skipped:",
          error instanceof Error ? error.message : error
        );
        serpBrief = buildFallbackSerpBrief(serpResearchInput);
      } else {
        throw error;
      }
    }
  }

  const lockedDescription = contract.syntheticMetaDescription;
  const titleCheckpoint = {
    contract,
    description: lockedDescription,
    ctx: input.uniquenessCtx,
    corpus: input.uniquenessCtx.corpus,
  };

  if (
    !brief &&
    serpCalls < getGeminiGroundingMaxCallsPerBlog() &&
    serpBrief.model !== "fallback-no-grounding"
  ) {
    try {
      const refreshed = await runGroundedSerpResearch({
        ...serpResearchInput,
        serpCallsSoFar: serpCalls,
      });
      serpCalls += 1;
      serpBrief = refreshed;
      saveCachedSerpBrief(contract.slotKey, serpBrief);
    } catch (error) {
      if (
        !isGroundingQuotaError(error) &&
        !isGroundingCallBudgetError(error)
      ) {
        throw error;
      }
      console.warn(
        "[generate-blog] SERP refresh skipped:",
        error instanceof Error ? error.message : error
      );
    }
  }

  let title = "";
  let skipCheckpointB = false;
  const resolvedTitle = await resolveTitleForEditorialContract({
    serpBrief,
    contract,
    forbiddenTitles,
    rejectedTitles: input.rejectedTitles,
    titleCheckpoint,
    category,
    bylineAuthor,
    editorialContext: input.editorialContext,
  });
  title = resolvedTitle.title;
  skipCheckpointB = resolvedTitle.skipCheckpointB;
  const titleIntentFamily = resolvedTitle.intentFamily;
  const titleSubAngle = resolvedTitle.subAngle;

  if (!skipCheckpointB) {
    await assertCheckpointB(
      contract,
      title,
      lockedDescription,
      input.uniquenessCtx,
      input.uniquenessCtx.corpus
    );
  }

  let factBrief: FactResearchBrief;
  try {
    factBrief = await runGroundedFactResearch({
      keyword: contract.keyword,
      title,
      commonH2Themes: serpBrief.commonH2Themes,
      serpGaps: serpBrief.serpGaps,
      serpCallsSoFar: serpCalls,
    });
    serpCalls += 1;
  } catch (error) {
    console.warn(
      "[generate-blog] Fact grounding skipped:",
      error instanceof Error ? error.message : error
    );
    factBrief = buildEmptyFactBrief(contract.keyword, title);
  }

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
      intentFamily: titleIntentFamily,
      subAngle: titleSubAngle,
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
    brief,
  };
}

export async function POST(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const ledgerEnabled = isCoverageLedgerEnabled();

  try {
    const intentBackfill = await syncKeywordIntentRegistryFromPublishedTopics();
    if (intentBackfill.added > 0) {
      console.info(
        `[generate-blog] Backfilled ${intentBackfill.added} keyword intent record(s)`
      );
    }

    const schedule = await getBlogAutomationSchedule();
    if (!force && schedule.blackoutToday) {
      return NextResponse.json(
        {
          success: false,
          blackoutDay: true,
          message: `Blog automation skipped today (${schedule.blackoutReason ?? "blackout"}). Next eligible run: ${schedule.nextEligibleAt}.`,
          schedule,
        },
        { status: 200 }
      );
    }
    if (!force && !isPastBlogWriterStartIst()) {
      return NextResponse.json(
        {
          success: false,
          outsideWriterWindow: true,
          message: `Blog writer window opens at ${formatBlogWriterStartInIst()} (configure with BLOG_WRITER_START_IST).`,
          nextBlogWriterStartIst: formatNextBlogWriterStartInIst(),
          schedule,
        },
        { status: 200 }
      );
    }
    if (!force && !schedule.canGenerate) {
      return NextResponse.json(
        {
          success: false,
          jobComplete: true,
          message: `Blog write not due yet (need ${schedule.requiredGapDays} day gap; ${schedule.daysSinceLastRun ?? 0} since last write). Next eligible run: ${schedule.nextEligibleAt}. Use ?force=true to override.`,
          schedule,
        },
        { status: 200 }
      );
    }

    console.info(`Gemini key pool: ${getGeminiKeyPoolSize()} keys configured`);

    let discoveryRefill = await ensureBriefQueueForAutomation();
    if (discoveryRefill) {
      console.info(
        `[generate-blog] Grounded discovery refill: +${discoveryRefill.added} briefs (${discoveryRefill.openBriefs} open), focus="${discoveryRefill.searchFocus.slice(0, 50)}…"`
      );
    }
    if (countBriefStats().open === 0) {
      console.warn(
        "[generate-blog] Brief queue still empty after refill; running full grounded discovery pass"
      );
      discoveryRefill = await runTopicDiscovery({
        target: getDiscoveryWeeklyTarget(),
        reason: "automation-emergency",
      });
      console.info(
        `[generate-blog] Emergency discovery: +${discoveryRefill.added} briefs (${discoveryRefill.openBriefs} open)`
      );
    }

    const editorialContext = await formatEditorialContextPrompt();
    const uniquenessCtx = await loadBlogUniquenessContext();
    if (ledgerEnabled) {
      const pruned = prunePreflightFailedSlots();
      if (pruned > 0) {
        console.info(
          `Pruned ${pruned} stale preflight failed slot(s) from coverage ledger`
        );
      }
    }
    let lastError: unknown;
    const rejectedTitles: string[] = [];
    const rejectedKeywords: string[] = [];
    const rejectedSlotKeys: string[] = [];
    const excludeKnowledgeSlugs: string[] = [];

    for (let pipelineAttempt = 0; ; pipelineAttempt++) {
      const ledgerCap = resolveLedgerAttemptCap();
      const evergreenAllowance = getEvergreenAttemptAllowance();
      const isHybridFallback =
        PIPELINE_ATTEMPT_CAP !== null &&
        pipelineAttempt >= ledgerCap &&
        pipelineAttempt < ledgerCap + HYBRID_FALLBACK_ATTEMPTS;
      const isEvergreenAttempt =
        PIPELINE_ATTEMPT_CAP !== null &&
        evergreenAllowance > 0 &&
        pipelineAttempt >= ledgerCap + HYBRID_FALLBACK_ATTEMPTS &&
        pipelineAttempt <
          ledgerCap + HYBRID_FALLBACK_ATTEMPTS + evergreenAllowance;
      const attemptLimit = getPipelineAttemptLimit();
      if (attemptLimit !== null && pipelineAttempt >= attemptLimit) {
        break;
      }
      let attemptedTitle = "";
      let attemptedKeyword = "";
      let attemptedSlotKey = "";
      let serpCallsThisRun = 0;
      let editorialContract: EditorialContract | null = null;
      let serpBrief: SerpResearchBrief | undefined;
      let factBrief: FactResearchBrief | undefined;
      let forbiddenAngles: Awaited<ReturnType<typeof findSimilarCorpusEntries>> =
        [];
      let campaignFocusKeyword: string | null = null;
      let evergreenEntry: EvergreenFallbackEntry | null = null;
      let brief: DiscoveredBrief | null = null;

      try {
        let topic: GeneratedTopic;
        let bylineAuthor: Awaited<ReturnType<typeof pickAuthorForBlogTopic>>;
        let plannedCategoryName: string;

        if (!ledgerEnabled) {
          console.warn(
            "COVERAGE_LEDGER_ENABLED=false, blog automation still uses the coverage ledger pipeline"
          );
        }

        const ledgerResult = isEvergreenAttempt
          ? await resolveTopicFromEvergreenFallback({
              rejectedTitles,
              rejectedSlotKeys,
              uniquenessCtx,
            })
          : isHybridFallback
          ? await resolveTopicHybridFallback({
              editorialContext,
              rejectedTitles,
              rejectedKeywords,
              uniquenessCtx,
            })
          : await resolveTopicFromLedger({
              editorialContext,
              rejectedTitles,
              rejectedKeywords,
              rejectedSlotKeys,
              uniquenessCtx,
              useCalendarBackup: pipelineAttempt >= 1,
            });

        if (isEvergreenAttempt) {
          console.warn("Primary+backup failed, attempting evergreen fallback");
        } else if (isHybridFallback) {
          console.warn(
            `Brief queue + ledger exhausted, hybrid fallback ${pipelineAttempt - ledgerCap + 1}/${HYBRID_FALLBACK_ATTEMPTS}`
          );
        }

        topic = ledgerResult.topic;
        bylineAuthor = ledgerResult.bylineAuthor;
        plannedCategoryName = ledgerResult.categoryName;
        editorialContract = ledgerResult.contract;
        attemptedSlotKey = ledgerResult.contract.slotKey;
        serpBrief = ledgerResult.serpBrief;
        factBrief = ledgerResult.factBrief;
        serpCallsThisRun = ledgerResult.serpCalls;
        forbiddenAngles = ledgerResult.forbiddenAngles;
        campaignFocusKeyword = ledgerResult.focusKeyword;
        evergreenEntry =
          isEvergreenAttempt
            ? (ledgerResult as Awaited<
                ReturnType<typeof resolveTopicFromEvergreenFallback>
              >).evergreenEntry
            : null;
        brief =
          !isEvergreenAttempt &&
          !isHybridFallback &&
          "brief" in ledgerResult
            ? (ledgerResult.brief ?? null)
            : null;
        for (const entry of forbiddenAngles) {
          trackExcludedCorpusSlug(excludeKnowledgeSlugs, entry.slug);
        }

        if (!topic.seoBrief?.primary) {
          throw new Error("No SEO keyword available for topic selection");
        }
        attemptedKeyword = topic.seoKeyword;
        attemptedTitle = topic.title;

        if (!topic.title) {
          throw new Error("Failed to generate a unique topic");
        }

        if (
          isCompetitorPrimaryKeyword(topic.seoKeyword || topic.seoBrief?.primary || "") ||
          isCompetitorLedTitle(topic.title)
        ) {
          const blockedKeyword =
            topic.seoKeyword || topic.seoBrief?.primary || topic.title;
          trackRejectedKeyword(rejectedKeywords, blockedKeyword);
          if (attemptedSlotKey) {
            trackRejectedSlot(rejectedSlotKeys, attemptedSlotKey);
          }
          throw new Error(competitorPrimaryKeywordReason(blockedKeyword));
        }

        const slug = createSlug(topic.title);

        const titleConflict = await findTitleConflict(topic.title, slug);
        if (titleConflict) {
          trackRejectedTitle(rejectedTitles, topic.title);
          throw new Error(
            `Topic already published or too similar: "${topic.title}" (${titleConflict.slug})`
          );
        }

        const clusterKeyword =
          topic.seoBrief?.primary ??
          topic.seoKeyword ??
          editorialContract?.keyword;
        const keywordIntentClusterPrompt = clusterKeyword
          ? formatKeywordIntentClusterPrompt({
              keyword: clusterKeyword,
              recommendedIntent: editorialContract
                ? recommendIntentForContract(editorialContract)
                : undefined,
              title: topic.title,
              angleId: editorialContract?.angleId ?? topic.angleId,
            })
          : undefined;

        let explicitContentFormat: BlogContentFormat | undefined;
        if (brief?.id) {
          const briefId = brief.id;
          const { loadCuratedBlogTopics } = await import(
            "@/lib/seo/curated-blog-topics"
          );
          const curatedMatch = loadCuratedBlogTopics().find(
            (row) =>
              briefId === row.id ||
              briefId === `brief-${row.id}` ||
              briefId.endsWith(row.id)
          );
          explicitContentFormat = curatedMatch?.contentFormat;
        }
        const contentFormat = pickBlogContentFormat(explicitContentFormat);

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
          keywordIntentClusterPrompt,
          contentFormat,
        };

        const wordCountInput = buildWordCountInput({
          primaryKeyword: topic.seoBrief?.primary ?? topic.seoKeyword,
          angleId: writerOptions.angleId,
          searchIntent: topic.seoBrief?.searchIntent,
          volumeBucket: topic.seoBrief?.volumeBucket,
          competitionIndex: topic.seoBrief?.competitionIndex,
        });

        const contentPlan = evergreenEntry
          ? {
              description: evergreenEntry.description,
              h2Outline: evergreenEntry.h2Outline,
              quickAnswerBullets: [] as string[],
              faqQuestions: [] as string[],
              outlineJson: buildEvergreenOutlineJson(evergreenEntry),
              readerQuestion: undefined,
              mustCover: [] as string[],
              avoidTopics: [] as string[],
              intentFamily: evergreenEntry.intentFamily,
              intentReason: "evergreen-fallback",
              subAngle: evergreenEntry.subAngle,
            }
          : await planBlogContent(
              topic.title,
              topic.category,
              topic.seoBrief,
              editorialContext,
              writerOptions
            );

        const planDescription = contentPlan.description.trim();
        if (!planDescription) {
          throw new Error("Plan phase returned empty meta description");
        }

        // Evergreen entries are the guaranteed daily safety net: they already
        // clear exact-dedup at pick time, so skip the semantic uniqueness gates
        // that would otherwise let a whole day pass with no blog published.
        const skipUniquenessGates =
          Boolean(evergreenEntry) ||
          Boolean(brief && isCuratedBriefId(brief.id));

        if (!skipUniquenessGates) {
          await assertPlanUnique(
            {
              title: topic.title,
              description: planDescription,
              h2Outline: contentPlan.h2Outline,
              slug,
            },
            uniquenessCtx
          );

          const checkpointC = await preFlightUniquenessProbe(
            {
              title: topic.title,
              description: planDescription,
              h2Outline: contentPlan.h2Outline,
              slug,
              excludeSlugs: excludeKnowledgeSlugs,
            },
            uniquenessCtx,
            uniquenessCtx.corpus
          );
          if (checkpointC) {
            throw new EditorialPreflightError(
              checkpointC,
              editorialContract?.slotKey ?? attemptedSlotKey,
              attemptedKeyword,
              topic.title
            );
          }
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
            lockedDescription: planDescription,
            excludeKnowledgeSlugs,
            plannedFaqQuestions: contentPlan.faqQuestions,
          }
        );

        if (!blogData.title || !blogData.description || !blogData.content) {
          throw new Error("Failed to generate complete blog content");
        }
        attemptedTitle = blogData.title;

        if (!skipUniquenessGates) {
          await assertBlogDraftUnique(
            {
              title: blogData.title,
              description: blogData.description,
              content: blogData.content,
              slug,
            },
            uniquenessCtx
          );
        }

        if (!skipUniquenessGates) {
          const rankReadiness = evaluateRankReadiness({
            title: blogData.title,
            description: blogData.description,
            content: blogData.content,
            primaryKeyword:
              topic.seoBrief?.primary || topic.seoKeyword || blogData.title,
            peopleAlsoAsk: serpBrief?.peopleAlsoAsk,
            serpGaps: serpBrief?.serpGaps,
            contentFormat,
          });
          if (!rankReadiness.pass) {
            console.warn(
              `[generate-blog] Rank-readiness ${rankReadiness.score}/100 for "${blogData.title}":`,
              rankReadiness.reasons.join("; ")
            );
            throw new Error(rankReadinessFailureMessage(rankReadiness));
          }
          console.info(
            `[generate-blog] Rank-readiness ${rankReadiness.score}/100 PASS for "${blogData.title}"`
          );

          const judged = await judgeRankReadiness({
            title: blogData.title,
            primaryKeyword:
              topic.seoBrief?.primary || topic.seoKeyword || blogData.title,
            content: blogData.content,
            serpBrief,
            factBrief,
          });
          if (judgeBlocksPublish(judged)) {
            console.warn(
              `[generate-blog] Rank-judge ${judged.score}/100 (${judged.verdict}) for "${blogData.title}":`,
              [...judged.reasons, ...judged.differentiationGaps].join("; ")
            );
            throw new Error(rankJudgeFailureMessage(judged));
          }
          if (judged.ran) {
            console.info(
              `[generate-blog] Rank-judge ${judged.score}/100 ${judged.verdict} for "${blogData.title}"`
            );
          }
        }

        const citations = await enrichWithInlineCitations({
          content: blogData.content,
          primaryKeyword:
            topic.seoBrief?.primary || topic.seoKeyword || blogData.title,
          serpBrief,
          factBrief,
        });
        blogData.content = citations.content;
        if (citations.mode !== "skip") {
          console.info(
            `[generate-blog] Citations: ${citations.citationCount} inline + ${citations.sourceCount} sources (${citations.mode})`
          );
        }

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

        const scheduledPublishAt = pickAutomationPublishAt();

        const result = await createBlogFiles(
          {
            title: blogData.title,
            description: blogData.description,
            featuredImage: featured.url,
            featuredImageAlt: featured.alt,
            author: bylineAuthor.name,
            content: contentWithImages,
            faqs: blogData.faqs,
            publishDate: scheduledPublishAt,
            published: false,
            scheduledPublishAt,
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

        const resolvedCluster = clusterKeyword
          ? resolveStoredIntentCluster({
              keyword: clusterKeyword,
              aiIntent: contentPlan.intentFamily ?? topic.intentFamily,
              aiSubAngle: contentPlan.subAngle ?? topic.subAngle,
              angleId: editorialContract?.angleId ?? topic.angleId,
              archetype: editorialContract?.archetype,
              title: blogData.title,
            })
          : null;

        const categoryMeta =
          editorialContract && ledgerEnabled
            ? formatCoverageTopicCategory(
                plannedCategoryName,
                editorialContract,
                resolvedCluster
                  ? {
                      intentFamily: resolvedCluster.intentFamily,
                      subAngle: resolvedCluster.subAngle,
                    }
                  : undefined
              )
            : topic.seoKeyword
              ? `${formatTopicCategory(topic.category, topic.seoKeyword)}${
                  resolvedCluster
                    ? `|${formatIntentCategorySuffix(
                        resolvedCluster.intentFamily,
                        resolvedCluster.subAngle
                      )}`
                    : ""
                }`
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

        rotateCadenceAfterSuccessfulWrite();

        if (clusterKeyword && resolvedCluster) {
          recordKeywordIntentWritten({
            keyword: clusterKeyword,
            title: blogData.title,
            slug: result.slug,
            angleId: editorialContract?.angleId ?? topic.angleId,
            archetype: editorialContract?.archetype,
            slotKey: editorialContract?.slotKey,
            intentFamily: resolvedCluster.intentFamily,
            subAngle: resolvedCluster.subAngle,
            source: "automation",
          });
        }

        if (editorialContract && ledgerEnabled) {
          if (
            !isHybridFallbackSlot(editorialContract.slotKey) &&
            !isBriefSlot(editorialContract.slotKey)
          ) {
            markSlotFilled(editorialContract.slotKey, result.slug);
          }
          if (brief) {
            markBriefFilled(brief.id, result.slug);
          }
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

        revalidatePath("/admin/blogs");

        return NextResponse.json({
          success: true,
          message: `Blog generated and scheduled for publish at ${scheduledPublishAt}`,
          wordCount,
          blog: {
            title: blogData.title,
            slug: result.slug,
            url: `/blog/${result.slug}`,
            adminUrl: `/admin/blogs`,
            status: "scheduled",
            scheduledPublishAt,
            category: topic.category,
            seoKeyword: topic.seoKeyword || undefined,
            searchIntent: topic.seoBrief?.searchIntent,
            coverageSlot: editorialContract?.slotKey,
            briefId: brief?.id,
            editorialArchetype: editorialContract?.archetype,
            campaignFocusKeyword: campaignFocusKeyword ?? undefined,
            serpCalls: serpCallsThisRun,
            inlineCitations: citations.citationCount,
            citationSources: citations.sourceCount,
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
            evergreenFallback: isEvergreenFallbackSlot(
              editorialContract?.slotKey ?? ""
            ),
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
        if (error instanceof SlotTitleExhaustedError) {
          attemptedSlotKey = error.slotKey;
          attemptedKeyword = error.keyword;
        }
        const msg = error instanceof Error ? error.message : String(error);
        const noTitleSlot = msg.match(/^No unique title for coverage slot (.+)$/);
        if (noTitleSlot?.[1]) {
          attemptedSlotKey = noTitleSlot[1];
        }
        const failureKind = classifyGenerationFailure(error);
        if (attemptedTitle) {
          trackRejectedTitle(rejectedTitles, attemptedTitle);
        }
        if (attemptedKeyword && (shouldRejectKeyword(msg) || isHybridFallback)) {
          trackRejectedKeyword(rejectedKeywords, attemptedKeyword);
        }
        // Hybrid title exhaustion throws before attemptedKeyword is set, so parse
        // the keyword from the message and reject it to force keyword rotation.
        const exhaustedKeyword = extractExhaustedHybridKeyword(msg);
        if (exhaustedKeyword) {
          trackRejectedKeyword(rejectedKeywords, exhaustedKeyword);
        }
        if (isHybridFallback && attemptedTitle) {
          trackRejectedTitle(rejectedTitles, attemptedTitle);
        }
        trackRejectedFromError(rejectedTitles, msg);
        const similarSlug = extractSimilaritySlug(msg);
        if (attemptedSlotKey) {
          trackRejectedSlot(rejectedSlotKeys, attemptedSlotKey);
          recordEditorialRejection({
            slotKey: attemptedSlotKey,
            reason: msg,
            similarToSlug: similarSlug,
          });
          maybeRejectKeywordWhenAnglesExhausted(
            rejectedSlotKeys,
            rejectedKeywords,
            attemptedSlotKey
          );
        }
        if (similarSlug) {
          trackExcludedCorpusSlug(excludeKnowledgeSlugs, similarSlug);
        }

        if (failureKind === "quota") {
          if (isGroundingQuotaError(error)) {
            console.warn(
              "Grounding quota hit mid-pipeline; continuing with next contract:",
              msg
            );
            continue;
          }
          if (attemptedSlotKey && ledgerEnabled) {
            markSlotFailed(attemptedSlotKey, msg);
          }
          throw error;
        }

        console.warn(
          `Blog pipeline attempt ${pipelineAttempt + 1} failed (${failureKind}), picking new topic:`,
          msg
        );
        if (
          attemptedSlotKey &&
          ledgerEnabled &&
          !(error instanceof EditorialPreflightError) &&
          !isHybridFallbackSlot(attemptedSlotKey) &&
          !isEvergreenFallbackSlot(attemptedSlotKey)
        ) {
          markSlotFailed(attemptedSlotKey, msg);
        }
        continue;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Blog generation failed");
  } catch (error) {
    console.error("Error in POST /api/automation/generate-blog:", error);
    const quotaExhausted =
      isGeminiQuotaErrorMessage(error) && !isGroundingQuotaError(error);
    return NextResponse.json(
      {
        success: false,
        quotaExhausted,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        schedule: await getBlogAutomationSchedule(),
        nextGeminiQuotaResetIst: quotaExhausted
          ? formatNextGeminiQuotaResetInIst()
          : undefined,
      },
      { status: quotaExhausted ? 200 : 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const intentBackfill = await syncKeywordIntentRegistryFromPublishedTopics();
    const schedule = await getBlogAutomationSchedule();
    const previewContract =
      request.nextUrl.searchParams.get("preview") === "contract";
    const uniquenessCtx = previewContract
      ? await loadBlogUniquenessContext()
      : null;
    const campaignEnabled = isKeywordCampaignEnabled();
    const focusKeyword =
      previewContract && campaignEnabled
        ? await pickFocusKeywordForToday()
        : null;
    const focusEntry = focusKeyword
      ? getKeywordCampaignEntry(focusKeyword)
      : null;
    const nextContract =
      previewContract && uniquenessCtx
        ? await pickNextEditorialContract({
            corpus: uniquenessCtx.corpus,
            uniquenessCtx,
            focusKeyword: focusKeyword ?? undefined,
          })
        : null;

    return NextResponse.json({
      ...schedule,
      keyPoolSize: getGeminiKeyPoolSize(),
      quotaBudget: getQuotaBudgetSummary(),
      editorialState: loadEditorialState(),
      discoveredBriefs: countBriefStats(),
      geminiBlogModel: resolveAutomationTextModel(
        process.env.GEMINI_BLOG_MODEL?.trim(),
        DEFAULT_GEMMA_TEXT_MODEL
      ),
      geminiGroundingModels: groundingModelCandidates(),
      intentRegistry: {
        keywordCount: intentBackfill.totalKeywords,
        lastSyncAdded: intentBackfill.added,
      },
      coverageLedgerEnabled: isCoverageLedgerEnabled(),
      keywordCampaignEnabled: campaignEnabled,
      focusKeyword: previewContract ? focusKeyword : undefined,
      focusKeywordNextReviewAfter: previewContract
        ? (focusEntry?.nextReviewAfter ?? null)
        : undefined,
      focusKeywordGscPosition: previewContract
        ? (focusEntry?.lastPosition ?? null)
        : undefined,
      campaignPreview:
        previewContract && campaignEnabled ? getCampaignPreview() : undefined,
      blogPipelineMaxOuterAttempts: PIPELINE_ATTEMPT_CAP,
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
      hint: previewContract
        ? undefined
        : "Add ?preview=contract for next slot scan (slower).",
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
