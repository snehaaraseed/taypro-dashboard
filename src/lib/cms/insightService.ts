import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { insights } from "@/lib/db/schema";
import type { TayproLocale } from "@/i18n/markets";
import { isActiveLocale } from "@/i18n/markets";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export type InsightReportType =
  | "category_pulse"
  | "playbook"
  | "index"
  | "mini_study";

export type InsightMetadata = {
  title: string;
  description: string;
  slug: string;
  reportType: InsightReportType;
  period: string | null;
  publishDate: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
};

export type InsightData = InsightMetadata & {
  content: string;
  metricsJson: string;
};

function resolveLocale(locale?: string): TayproLocale {
  if (locale && isActiveLocale(locale)) return locale;
  return SOURCE_LOCALE;
}

function rowToMetadata(row: typeof insights.$inferSelect): InsightMetadata {
  return {
    title: row.title,
    description: row.description,
    slug: row.slug,
    reportType: (row.reportType as InsightReportType) ?? "category_pulse",
    period: row.period ?? null,
    publishDate: row.publishDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    published: row.published,
  };
}

export async function listPublishedInsights(
  locale?: string,
  reportType?: InsightReportType
): Promise<InsightMetadata[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(insights)
    .where(and(eq(insights.locale, loc), eq(insights.published, true)));

  return rows
    .filter((r) => !reportType || r.reportType === reportType)
    .map(rowToMetadata)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function listAllInsights(
  includeDrafts = true,
  locale?: string
): Promise<InsightMetadata[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db.select().from(insights).where(eq(insights.locale, loc));

  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .map(rowToMetadata)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function getInsightBySlug(
  slug: string,
  options?: { includeDraft?: boolean; locale?: string }
): Promise<{ metadata: InsightMetadata; content: string; metricsJson: string } | null> {
  const loc = resolveLocale(options?.locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(insights)
    .where(and(eq(insights.slug, slug), eq(insights.locale, loc)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!options?.includeDraft && row.published === false) return null;
  return {
    metadata: rowToMetadata(row),
    content: row.content,
    metricsJson: row.metricsJson,
  };
}

export async function getInsightForPeriod(
  period: string,
  reportType: InsightReportType = "category_pulse",
  locale?: string
): Promise<InsightMetadata | null> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(insights)
    .where(
      and(
        eq(insights.locale, loc),
        eq(insights.period, period),
        eq(insights.reportType, reportType)
      )
    )
    .limit(1);
  const row = rows[0];
  return row ? rowToMetadata(row) : null;
}

export async function getLatestPublishedInsight(
  reportType?: InsightReportType,
  locale?: string
): Promise<InsightMetadata | null> {
  const list = await listPublishedInsights(locale, reportType);
  return list[0] ?? null;
}

export type InsightSitemapEntry = {
  slug: string;
  locale: TayproLocale;
  publishDate: string;
  updatedAt?: string | null;
};

export async function listPublishedInsightsForSitemap(): Promise<InsightSitemapEntry[]> {
  const db = getDb();
  const rows = await db
    .select({
      slug: insights.slug,
      locale: insights.locale,
      publishDate: insights.publishDate,
      updatedAt: insights.updatedAt,
    })
    .from(insights)
    .where(eq(insights.published, true));

  return rows
    .filter((r) => isActiveLocale(r.locale))
    .map((r) => ({
      slug: r.slug,
      locale: r.locale as TayproLocale,
      publishDate: r.publishDate,
      updatedAt: r.updatedAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function createInsight(data: {
  slug: string;
  title: string;
  description: string;
  content: string;
  reportType?: InsightReportType;
  period?: string | null;
  metricsJson?: string;
  published?: boolean;
  publishDate?: string;
}): Promise<{ success: boolean; slug: string; error?: string }> {
  try {
    const db = getDb();
    const existing = await db
      .select({ id: insights.id })
      .from(insights)
      .where(
        and(eq(insights.slug, data.slug), eq(insights.locale, SOURCE_LOCALE))
      )
      .limit(1);
    if (existing.length > 0) {
      return {
        success: false,
        slug: data.slug,
        error: `Insight with slug "${data.slug}" already exists`,
      };
    }

    const now = new Date().toISOString();
    await db.insert(insights).values({
      slug: data.slug,
      locale: SOURCE_LOCALE,
      title: data.title,
      description: data.description,
      content: data.content,
      reportType: data.reportType ?? "category_pulse",
      period: data.period ?? null,
      metricsJson: data.metricsJson ?? "{}",
      publishDate: data.publishDate ?? now,
      createdAt: now,
      updatedAt: now,
      published: data.published !== false,
    });

    return { success: true, slug: data.slug };
  } catch (error) {
    return {
      success: false,
      slug: data.slug,
      error: error instanceof Error ? error.message : "Failed to create insight",
    };
  }
}

export async function updateInsight(
  slug: string,
  data: Partial<{
    title: string;
    description: string;
    content: string;
    published: boolean;
    publishDate: string;
    metricsJson: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const result = await db
      .update(insights)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.published !== undefined ? { published: data.published } : {}),
        ...(data.publishDate !== undefined
          ? { publishDate: data.publishDate }
          : {}),
        ...(data.metricsJson !== undefined
          ? { metricsJson: data.metricsJson }
          : {}),
        updatedAt: now,
      })
      .where(
        and(eq(insights.slug, slug), eq(insights.locale, SOURCE_LOCALE))
      );

    if (result.changes === 0) {
      return { success: false, error: "Insight not found" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update insight",
    };
  }
}

export async function deleteInsight(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const result = await db
      .delete(insights)
      .where(
        and(eq(insights.slug, slug), eq(insights.locale, SOURCE_LOCALE))
      );
    if (result.changes === 0) {
      return { success: false, error: "Insight not found" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete insight",
    };
  }
}

/**
 * Prior published editions of a given research topic (newest first).
 * topicId lives in the metricsJson bundle, so we filter in memory.
 */
export async function getPriorTopicEditions(
  topicId: string,
  excludeSlug?: string
): Promise<{ slug: string; title: string; content: string }[]> {
  const db = getDb();
  const rows = await db
    .select({
      slug: insights.slug,
      title: insights.title,
      content: insights.content,
      metricsJson: insights.metricsJson,
      publishDate: insights.publishDate,
    })
    .from(insights)
    .where(
      and(
        eq(insights.reportType, "mini_study"),
        eq(insights.locale, SOURCE_LOCALE)
      )
    )
    .orderBy(desc(insights.publishDate));

  return rows
    .filter((r) => r.slug !== excludeSlug)
    .filter((r) => {
      try {
        return (JSON.parse(r.metricsJson) as { topicId?: string }).topicId === topicId;
      } catch {
        return false;
      }
    })
    .map((r) => ({ slug: r.slug, title: r.title, content: r.content }));
}

/** Most recent category pulse period (YYYY-MM) if any. */
export async function getLatestCategoryPulsePeriod(): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ period: insights.period })
    .from(insights)
    .where(
      and(
        eq(insights.reportType, "category_pulse"),
        eq(insights.locale, SOURCE_LOCALE)
      )
    )
    .orderBy(desc(insights.publishDate))
    .limit(1);
  return rows[0]?.period ?? null;
}
