import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { readPublishedTopics } from "@/lib/cms/topicService";
import {
  countBriefStats,
  loadDiscoveredBriefs,
  loadDiscoveredBriefsState,
  sortedBriefQueue,
} from "@/lib/seo/discovered-brief-queue";
import {
  countCuratedTopicStats,
  loadCuratedBlogTopics,
  resolveCuratedTopicStatuses,
} from "@/lib/seo/curated-blog-topics";
import { loadEditorialCalendar } from "@/lib/seo/editorial-calendar";
import { loadSeoBlogQueueKeywords } from "@/lib/seo/seo-blog-queue";
import { loadDiscoveryRunState } from "@/lib/seo/discovery-run-state";
import { isGscConfigured } from "@/lib/gsc/gsc-auth";
import { getBlogAutomationSchedule } from "@/lib/cms/topicService";
import {
  getBlogTranslationStaggerSchedule,
  isBlogTranslationStaggerEnabled,
} from "@/lib/translation/config";
import { loadCadenceState } from "@/lib/cms/blog-automation-calendar";
import { getBlogNarrativeFormatShare } from "@/lib/seo/blog-content-format";

type JsonFile = Record<string, unknown>;

function readJsonSafe(filePath: string): JsonFile | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as JsonFile;
  } catch {
    return null;
  }
}

function dataPath(name: string): string {
  return path.join(getDeploymentRoot(), "data", name);
}

export type PipelineAdminSnapshot = {
  generatedAt: string;
  briefQueue: {
    stats: ReturnType<typeof countBriefStats>;
    open: ReturnType<typeof sortedBriefQueue>;
    filled: ReturnType<typeof loadDiscoveredBriefsState>["filled"];
    rejected: ReturnType<typeof loadDiscoveredBriefsState>["rejected"];
  };
  curatedTopics: {
    total: number;
    stats: Record<string, number>;
    pending: { id: string; title: string; category: string; primaryKeyword: string }[];
    sample: { id: string; title: string; status: string; category: string }[];
  };
  gsc: {
    configured: boolean;
    updatedAt: string | null;
    keywordCount: number;
    topOpportunities: {
      query: string;
      impressions: number;
      position: number;
      score: number;
      reason: string;
    }[];
  };
  seoBlogQueue: string[];
  keywordCampaigns: {
    updatedAt: string | null;
    eligible: number;
    cooldown: number;
    saturated: number;
    topEligible: { keyword: string; gscScore: number; status: string }[];
  };
  editorialCalendar: {
    generatedAt: string | null;
    daysScheduled: number;
    nextDays: { date: string; primaryBriefId: string | null; backupBriefId: string | null }[];
  };
  discovery: ReturnType<typeof loadDiscoveryRunState>;
  publishedBlogCount: number;
  blogAutomation: {
    canGenerate: boolean;
    requiredGapDays: number;
    daysSinceLastRun: number | null;
    daysUntilEligible: number | null;
    nextEligibleAt: string | null;
    blackoutToday: boolean;
    blackoutReason: string | null;
    writerStartIst: string;
    narrativeFormatShare: number;
    translationStagger: { locale: string; dayOffset: number }[];
  };
  dataFiles: { name: string; exists: boolean; updatedAt: string | null; sizeKb: number }[];
};

export async function buildPipelineAdminSnapshot(): Promise<PipelineAdminSnapshot> {
  const briefStats = countBriefStats();
  const briefState = loadDiscoveredBriefsState();
  const filledIds = new Set(briefState.filled.map((f) => f.briefId));
  const rejectedIds = new Set(briefState.rejected.map((r) => r.briefId));
  const openBriefs = sortedBriefQueue().filter(
    (b) => !filledIds.has(b.id) && !rejectedIds.has(b.id)
  );

  const curatedRows = await resolveCuratedTopicStatuses();
  const curatedStats = countCuratedTopicStats(curatedRows);
  const pendingCurated = curatedRows
    .filter((r) => r.status === "pending")
    .slice(0, 30)
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      primaryKeyword: r.primaryKeyword,
    }));

  const gscRaw = readJsonSafe(dataPath("seo-gsc-boost.json"));
  const opportunities = Array.isArray(gscRaw?.opportunities)
    ? (gscRaw.opportunities as PipelineAdminSnapshot["gsc"]["topOpportunities"])
    : [];

  const campaignRaw = readJsonSafe(dataPath("seo-keyword-campaigns.json"));
  const campaignEntries = Array.isArray(campaignRaw?.entries)
    ? (campaignRaw.entries as {
        keyword: string;
        gscScore: number;
        status: string;
      }[])
    : [];
  const eligible = campaignEntries.filter((e) => e.status === "eligible");
  const cooldown = campaignEntries.filter((e) => e.status === "cooldown");
  const saturated = campaignEntries.filter((e) => e.status === "saturated");

  const calendar = loadEditorialCalendar();
  const nextDays = (calendar?.days ?? []).slice(0, 14).map((d) => ({
    date: d.date,
    primaryBriefId: d.primaryBriefId ?? null,
    backupBriefId: d.backupBriefId ?? null,
  }));

  const published = await readPublishedTopics();
  const schedule = await getBlogAutomationSchedule();
  const cadence = loadCadenceState();

  const trackedFiles = [
    "discovered-briefs.json",
    "discovered-briefs-state.json",
    "curated-blog-topics.json",
    "seo-gsc-boost.json",
    "gsc-latest-report.json",
    "gsc-blog-queries.json",
    "seo-blog-queue.json",
    "seo-keyword-campaigns.json",
    "editorial-calendar.json",
    "published-topics.json",
    "seo-coverage-filled.json",
    "seo-keyword-intent-registry.json",
    "semantic-topic-catalog.json",
    "evergreen-fallback-catalog.json",
    "discovery-run-state.json",
  ];

  const dataFiles = trackedFiles.map((name) => {
    const fp = dataPath(name);
    if (!fs.existsSync(fp)) {
      return { name, exists: false, updatedAt: null, sizeKb: 0 };
    }
    const stat = fs.statSync(fp);
    return {
      name,
      exists: true,
      updatedAt: stat.mtime.toISOString(),
      sizeKb: Math.round(stat.size / 1024),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    briefQueue: {
      stats: briefStats,
      open: openBriefs.slice(0, 40),
      filled: briefState.filled.slice(-20),
      rejected: briefState.rejected.slice(-20),
    },
    curatedTopics: {
      total: loadCuratedBlogTopics().length,
      stats: curatedStats,
      pending: pendingCurated,
      sample: curatedRows.slice(0, 40).map((r) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        category: r.category,
      })),
    },
    gsc: {
      configured: isGscConfigured(),
      updatedAt: typeof gscRaw?.updatedAt === "string" ? gscRaw.updatedAt : null,
      keywordCount: Array.isArray(gscRaw?.keywords)
        ? (gscRaw.keywords as string[]).length
        : 0,
      topOpportunities: opportunities.slice(0, 20),
    },
    seoBlogQueue: loadSeoBlogQueueKeywords().slice(0, 30),
    keywordCampaigns: {
      updatedAt:
        typeof campaignRaw?.updatedAt === "string" ? campaignRaw.updatedAt : null,
      eligible: eligible.length,
      cooldown: cooldown.length,
      saturated: saturated.length,
      topEligible: eligible
        .sort((a, b) => b.gscScore - a.gscScore)
        .slice(0, 15)
        .map((e) => ({
          keyword: e.keyword,
          gscScore: e.gscScore,
          status: e.status,
        })),
    },
    editorialCalendar: {
      generatedAt: calendar?.generatedAt ?? null,
      daysScheduled: calendar?.days?.length ?? 0,
      nextDays,
    },
    discovery: loadDiscoveryRunState(),
    publishedBlogCount: published.length,
    blogAutomation: {
      canGenerate: schedule.canGenerate,
      requiredGapDays: cadence.requiredGapDays,
      daysSinceLastRun: schedule.daysSinceLastRun,
      daysUntilEligible: schedule.daysUntilEligible,
      nextEligibleAt: schedule.nextEligibleAt,
      blackoutToday: schedule.blackoutToday,
      blackoutReason: schedule.blackoutReason,
      writerStartIst:
        process.env.BLOG_WRITER_START_IST?.trim() || "00:30",
      narrativeFormatShare: getBlogNarrativeFormatShare(),
      translationStagger: isBlogTranslationStaggerEnabled()
        ? getBlogTranslationStaggerSchedule().map((e) => ({
            locale: e.locale,
            dayOffset: e.dayOffset,
          }))
        : [],
    },
    dataFiles,
  };
}
