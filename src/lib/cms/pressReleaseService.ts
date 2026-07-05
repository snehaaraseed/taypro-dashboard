import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { pressReleases } from "@/lib/db/schema";
import type { TayproLocale } from "@/i18n/markets";
import { isActiveLocale } from "@/i18n/markets";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import { createSlug } from "@/lib/cms/blogService";
import { sanitizePressReleaseHtml } from "@/lib/security/sanitize-html";
import { resolvePressPublishDate } from "@/lib/press/press-release-dates";

export type PressReleaseStatus = "draft" | "ready" | "published";
export type PressReleaseSource = "queue" | "project" | "insight" | "manual";

export type PressContact = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
};

export type PressQuote = {
  text: string;
  attribution: string;
};

export type PressReleaseMetadata = {
  title: string;
  subhead: string;
  dateline: string;
  slug: string;
  status: PressReleaseStatus;
  source: PressReleaseSource;
  queueKey: string | null;
  publishDate: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  featuredImage: string;
};

export type PressReleaseData = PressReleaseMetadata & {
  content: string;
  boilerplate: string;
  contact: PressContact;
  quotes: PressQuote[];
};

function resolveLocale(locale?: string): TayproLocale {
  if (locale && isActiveLocale(locale)) return locale;
  return SOURCE_LOCALE;
}

function parseContact(json: string): PressContact {
  try {
    const parsed = JSON.parse(json) as PressContact;
    return {
      name: parsed.name ?? "Taypro Media Team",
      email: parsed.email ?? "info@taypro.in",
      phone: parsed.phone,
      company: parsed.company ?? "Taypro Private Limited",
    };
  } catch {
    return {
      name: "Taypro Media Team",
      email: "info@taypro.in",
      company: "Taypro Private Limited",
    };
  }
}

function parseQuotes(json: string): PressQuote[] {
  try {
    const parsed = JSON.parse(json) as PressQuote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToMetadata(row: typeof pressReleases.$inferSelect): PressReleaseMetadata {
  return {
    title: row.title,
    subhead: row.subhead,
    dateline: row.dateline,
    slug: row.slug,
    status: (row.status as PressReleaseStatus) ?? "draft",
    source: (row.source as PressReleaseSource) ?? "queue",
    queueKey: row.queueKey ?? null,
    publishDate: row.publishDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    published: row.published,
    featuredImage: row.featuredImage,
  };
}

function rowToData(row: typeof pressReleases.$inferSelect): PressReleaseData {
  return {
    ...rowToMetadata(row),
    content: row.content,
    boilerplate: row.boilerplate,
    contact: parseContact(row.contactJson),
    quotes: parseQuotes(row.quotesJson),
  };
}

export async function listPublishedPressReleases(
  locale?: string
): Promise<PressReleaseMetadata[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(pressReleases)
    .where(and(eq(pressReleases.locale, loc), eq(pressReleases.published, true)));

  return rows
    .map(rowToMetadata)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function listAllPressReleases(
  includeDrafts = true,
  locale?: string
): Promise<PressReleaseMetadata[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.locale, loc));

  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .map(rowToMetadata)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function getPressReleaseBySlug(
  slug: string,
  options?: { includeDraft?: boolean; locale?: string }
): Promise<PressReleaseData | null> {
  const loc = resolveLocale(options?.locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(pressReleases)
    .where(and(eq(pressReleases.slug, slug), eq(pressReleases.locale, loc)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!options?.includeDraft && row.published === false) return null;
  return rowToData(row);
}

export async function getPressReleaseByQueueKey(
  queueKey: string
): Promise<PressReleaseMetadata | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(pressReleases)
    .where(
      and(eq(pressReleases.queueKey, queueKey), eq(pressReleases.locale, SOURCE_LOCALE))
    )
    .limit(1);
  const row = rows[0];
  return row ? rowToMetadata(row) : null;
}

export type PressReleaseSitemapEntry = {
  slug: string;
  locale: TayproLocale;
  publishDate: string;
  updatedAt?: string | null;
};

export async function listPublishedPressReleasesForSitemap(): Promise<
  PressReleaseSitemapEntry[]
> {
  const db = getDb();
  const rows = await db
    .select({
      slug: pressReleases.slug,
      locale: pressReleases.locale,
      publishDate: pressReleases.publishDate,
      updatedAt: pressReleases.updatedAt,
    })
    .from(pressReleases)
    .where(eq(pressReleases.published, true));

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

export async function getLatestPressRelease(): Promise<PressReleaseMetadata | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.locale, SOURCE_LOCALE))
    .orderBy(desc(pressReleases.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? rowToMetadata(row) : null;
}

export async function createPressRelease(data: {
  slug?: string;
  title: string;
  subhead?: string;
  dateline?: string;
  content: string;
  boilerplate?: string;
  contact?: PressContact;
  quotes?: PressQuote[];
  featuredImage?: string;
  status?: PressReleaseStatus;
  source?: PressReleaseSource;
  queueKey?: string | null;
  published?: boolean;
  publishDate?: string;
}): Promise<{ success: boolean; slug: string; error?: string }> {
  try {
    const finalSlug = data.slug ?? createSlug(data.title);
    const db = getDb();
    const existing = await db
      .select({ id: pressReleases.id })
      .from(pressReleases)
      .where(
        and(eq(pressReleases.slug, finalSlug), eq(pressReleases.locale, SOURCE_LOCALE))
      )
      .limit(1);
    if (existing.length > 0) {
      return {
        success: false,
        slug: finalSlug,
        error: `Press release with slug "${finalSlug}" already exists`,
      };
    }

    const now = new Date().toISOString();
    const published = data.published === true;
    const status: PressReleaseStatus =
      data.status ?? (published ? "published" : "ready");
    const publishDate = resolvePressPublishDate({
      dateline: data.dateline,
      publishDate: data.publishDate,
      fallback: now,
    });

    await db.insert(pressReleases).values({
      slug: finalSlug,
      locale: SOURCE_LOCALE,
      title: data.title,
      subhead: data.subhead ?? "",
      dateline: data.dateline ?? "",
      content: sanitizePressReleaseHtml(data.content),
      boilerplate: data.boilerplate ?? "",
      contactJson: JSON.stringify(
        data.contact ?? {
          name: "Taypro Media Team",
          email: "info@taypro.in",
          company: "Taypro Private Limited",
        }
      ),
      quotesJson: JSON.stringify(data.quotes ?? []),
      featuredImage: data.featuredImage ?? "",
      status,
      source: data.source ?? "queue",
      queueKey: data.queueKey ?? null,
      publishDate,
      createdAt: now,
      updatedAt: now,
      published,
    });

    return { success: true, slug: finalSlug };
  } catch (error) {
    return {
      success: false,
      slug: data.slug ?? createSlug(data.title),
      error:
        error instanceof Error ? error.message : "Failed to create press release",
    };
  }
}

export async function updatePressRelease(
  slug: string,
  data: Partial<{
    title: string;
    subhead: string;
    dateline: string;
    content: string;
    boilerplate: string;
    contact: PressContact;
    quotes: PressQuote[];
    featuredImage: string;
    status: PressReleaseStatus;
    published: boolean;
    publishDate: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await getPressReleaseBySlug(slug, { includeDraft: true });
    const publishDate =
      data.dateline !== undefined || data.publishDate !== undefined ?
        resolvePressPublishDate({
          dateline: data.dateline ?? existing?.dateline,
          publishDate: data.publishDate,
          fallback: existing?.publishDate ?? now,
        })
      : undefined;

    const result = await db
      .update(pressReleases)
      .set({
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.subhead !== undefined ? { subhead: data.subhead } : {}),
        ...(data.dateline !== undefined ? { dateline: data.dateline } : {}),
        ...(data.content !== undefined
          ? { content: sanitizePressReleaseHtml(data.content) }
          : {}),
        ...(data.boilerplate !== undefined ? { boilerplate: data.boilerplate } : {}),
        ...(data.contact !== undefined
          ? { contactJson: JSON.stringify(data.contact) }
          : {}),
        ...(data.quotes !== undefined
          ? { quotesJson: JSON.stringify(data.quotes) }
          : {}),
        ...(data.featuredImage !== undefined
          ? { featuredImage: data.featuredImage }
          : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.published !== undefined ? { published: data.published } : {}),
        ...(publishDate !== undefined ? { publishDate } : {}),
        updatedAt: now,
      })
      .where(
        and(eq(pressReleases.slug, slug), eq(pressReleases.locale, SOURCE_LOCALE))
      );

    if (result.changes === 0) {
      return { success: false, error: "Press release not found" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update press release",
    };
  }
}

export async function deletePressRelease(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const result = await db
      .delete(pressReleases)
      .where(
        and(eq(pressReleases.slug, slug), eq(pressReleases.locale, SOURCE_LOCALE))
      );
    if (result.changes === 0) {
      return { success: false, error: "Press release not found" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete press release",
    };
  }
}

export { createSlug };
