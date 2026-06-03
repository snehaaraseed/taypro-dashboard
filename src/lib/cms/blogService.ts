import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import type { BlogData, BlogMetadata } from "@/app/utils/blogFileUtils";
import { parseBlogFaqs, serializeBlogFaqs } from "@/lib/cms/blog-faqs";
import type { TayproLocale } from "@/i18n/markets";
import { isActiveLocale } from "@/i18n/markets";
import { SOURCE_LOCALE, TARGET_LOCALES } from "@/lib/translation/config";
import { scheduleBlogTranslations } from "@/lib/translation/translate-cms";

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function resolveLocale(locale?: string): TayproLocale {
  if (locale && isActiveLocale(locale)) return locale;
  return SOURCE_LOCALE;
}

function rowToMetadata(row: typeof blogs.$inferSelect): BlogMetadata {
  return {
    title: row.title,
    description: row.description,
    featuredImage: row.featuredImage,
    featuredImageAlt: row.featuredImageAlt,
    author: row.author,
    slug: row.slug,
    publishDate: row.publishDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    published: row.published,
    faqs: parseBlogFaqs(row.faqs),
  };
}

export type BlogSimilarityCorpusRow = {
  slug: string;
  title: string;
  description: string;
  content: string;
};

export async function listBlogsForSimilarityCheck(
  includeDrafts = true,
  locale?: string
): Promise<BlogSimilarityCorpusRow[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select({
      slug: blogs.slug,
      title: blogs.title,
      description: blogs.description,
      content: blogs.content,
      published: blogs.published,
    })
    .from(blogs)
    .where(eq(blogs.locale, loc));

  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .map(({ slug, title, description, content }) => ({
      slug,
      title,
      description,
      content,
    }));
}

export async function listAllBlogs(
  includeDrafts = false,
  locale?: string
): Promise<BlogMetadata[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db.select().from(blogs).where(eq(blogs.locale, loc));
  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .map(rowToMetadata)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function listPublishedBlogSlugs(
  locale?: string
): Promise<string[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select({ slug: blogs.slug })
    .from(blogs)
    .where(and(eq(blogs.published, true), eq(blogs.locale, loc)));
  return rows.map((r) => r.slug);
}

export type BlogSitemapEntry = {
  slug: string;
  locale: TayproLocale;
  author: string;
  publishDate: string;
  updatedAt?: string | null;
};

export async function listPublishedBlogsForSitemap(): Promise<BlogSitemapEntry[]> {
  const db = getDb();
  const rows = await db
    .select({
      slug: blogs.slug,
      locale: blogs.locale,
      author: blogs.author,
      publishDate: blogs.publishDate,
      updatedAt: blogs.updatedAt,
    })
    .from(blogs)
    .where(eq(blogs.published, true));

  return rows
    .filter((r) => isActiveLocale(r.locale))
    .map((r) => ({
      slug: r.slug,
      locale: r.locale as TayproLocale,
      author: r.author,
      publishDate: r.publishDate,
      updatedAt: r.updatedAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function getBlogBySlug(
  slug: string,
  options?: { includeDraft?: boolean; locale?: string }
): Promise<{ metadata: BlogMetadata; content: string } | null> {
  const loc = resolveLocale(options?.locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.locale, loc)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!options?.includeDraft && row.published === false) return null;
  return {
    metadata: rowToMetadata(row),
    content: row.content,
  };
}

export async function createBlog(
  blogData: BlogData,
  slug?: string
): Promise<{
  success: boolean;
  slug: string;
  updatedAt?: string;
  error?: string;
}> {
  try {
    const finalSlug = slug || createSlug(blogData.title);
    const db = getDb();
    const existing = await db
      .select({ id: blogs.id })
      .from(blogs)
      .where(
        and(eq(blogs.slug, finalSlug), eq(blogs.locale, SOURCE_LOCALE))
      )
      .limit(1);
    if (existing.length > 0) {
      return {
        success: false,
        slug: finalSlug,
        error: `Blog with slug "${finalSlug}" already exists`,
      };
    }

    const now = new Date().toISOString();
    const published = blogData.published !== undefined ? blogData.published : true;

    await db.insert(blogs).values({
      slug: finalSlug,
      locale: SOURCE_LOCALE,
      title: blogData.title,
      description: blogData.description,
      featuredImage: blogData.featuredImage || "",
      featuredImageAlt: blogData.featuredImageAlt?.trim() || "",
      author: blogData.author || "Taypro Team",
      content: blogData.content || "",
      faqs: serializeBlogFaqs(blogData.faqs),
      publishDate: blogData.publishDate || now,
      createdAt: now,
      updatedAt: now,
      published,
    });

    if (published) {
      scheduleBlogTranslations(finalSlug);
    }

    return { success: true, slug: finalSlug, updatedAt: now };
  } catch (error) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      slug: slug || createSlug(blogData.title),
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBlog(
  oldSlug: string,
  blogData: BlogData,
  newSlug?: string
): Promise<{
  success: boolean;
  slug: string;
  updatedAt?: string;
  error?: string;
}> {
  try {
    const db = getDb();
    const existingRows = await db
      .select()
      .from(blogs)
      .where(
        and(eq(blogs.slug, oldSlug), eq(blogs.locale, SOURCE_LOCALE))
      )
      .limit(1);
    const existing = existingRows[0];
    if (!existing) {
      return {
        success: false,
        slug: oldSlug,
        error: `Blog with slug "${oldSlug}" does not exist`,
      };
    }

    const finalSlug = newSlug || oldSlug;
    if (finalSlug !== oldSlug) {
      const conflict = await db
        .select({ id: blogs.id })
        .from(blogs)
        .where(
          and(eq(blogs.slug, finalSlug), eq(blogs.locale, SOURCE_LOCALE))
        )
        .limit(1);
      if (conflict.length > 0) {
        return {
          success: false,
          slug: finalSlug,
          error: `Blog with slug "${finalSlug}" already exists`,
        };
      }

      await db
        .update(blogs)
        .set({ slug: finalSlug })
        .where(eq(blogs.slug, oldSlug));
    }

    const now = new Date().toISOString();
    const published =
      blogData.published !== undefined ? blogData.published : existing.published;

    await db
      .update(blogs)
      .set({
        title: blogData.title,
        description: blogData.description,
        featuredImage: blogData.featuredImage || "",
        featuredImageAlt:
          blogData.featuredImageAlt?.trim() ?? existing.featuredImageAlt,
        author: blogData.author || "Taypro Team",
        content: blogData.content || "",
        faqs:
          blogData.faqs !== undefined
            ? serializeBlogFaqs(blogData.faqs)
            : existing.faqs,
        publishDate: blogData.publishDate || existing.publishDate,
        updatedAt: now,
        published,
      })
      .where(
        and(eq(blogs.slug, finalSlug), eq(blogs.locale, SOURCE_LOCALE))
      );

    if (published) {
      scheduleBlogTranslations(finalSlug);
    }

    return { success: true, slug: finalSlug, updatedAt: now };
  } catch (error) {
    console.error("Error updating blog:", error);
    return {
      success: false,
      slug: newSlug || oldSlug,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteBlog(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const existing = await db
      .select({ id: blogs.id })
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);
    if (existing.length === 0) {
      return {
        success: false,
        error: `Blog with slug "${slug}" does not exist`,
      };
    }
    await db.delete(blogs).where(eq(blogs.slug, slug));
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export type BlogTranslationLocaleStatus = {
  locale: TayproLocale;
  synced: boolean;
};

export type BlogTranslationSyncInfo = {
  allSynced: boolean;
  locales: BlogTranslationLocaleStatus[];
};

/** Compare ISO timestamps (lexicographic works for UTC ISO strings). */
function isTranslationRowSynced(
  sourceUpdatedAt: string | null,
  rowUpdatedAt: string | null | undefined
): boolean {
  return Boolean(
    sourceUpdatedAt && rowUpdatedAt && rowUpdatedAt >= sourceUpdatedAt
  );
}

/** Per-slug sync state for admin (English vs target locale rows). */
export async function getBlogTranslationSyncInfo(
  slug: string
): Promise<BlogTranslationSyncInfo | null> {
  const db = getDb();
  const enRows = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.locale, SOURCE_LOCALE)))
    .limit(1);
  const source = enRows[0];
  if (!source) return null;

  if (!source.published) {
    return {
      allSynced: false,
      locales: TARGET_LOCALES.map((locale) => ({ locale, synced: false })),
    };
  }

  const srcAt = source.updatedAt;
  const locales: BlogTranslationLocaleStatus[] = [];

  for (const locale of TARGET_LOCALES) {
    const rows = await db
      .select({ updatedAt: blogs.updatedAt })
      .from(blogs)
      .where(and(eq(blogs.slug, slug), eq(blogs.locale, locale)))
      .limit(1);
    locales.push({
      locale,
      synced: isTranslationRowSynced(srcAt, rows[0]?.updatedAt),
    });
  }

  return {
    allSynced: locales.every((l) => l.synced),
    locales,
  };
}

/** Map slug → all target locales synced with published English (for blog list). */
export async function getBlogTranslationAllSyncedBatch(
  slugs: string[]
): Promise<Record<string, boolean>> {
  if (slugs.length === 0) return {};
  const db = getDb();
  const unique = [...new Set(slugs)];
  const allowedLocales = [SOURCE_LOCALE, ...TARGET_LOCALES] as TayproLocale[];

  const rows = await db
    .select({
      slug: blogs.slug,
      locale: blogs.locale,
      published: blogs.published,
      updatedAt: blogs.updatedAt,
    })
    .from(blogs)
    .where(
      and(inArray(blogs.slug, unique), inArray(blogs.locale, allowedLocales))
    );

  const bySlug = new Map<string, typeof rows>();
  for (const r of rows) {
    const list = bySlug.get(r.slug) ?? [];
    list.push(r);
    bySlug.set(r.slug, list);
  }

  const out: Record<string, boolean> = {};
  for (const slug of unique) {
    const list = bySlug.get(slug) ?? [];
    const source = list.find((r) => r.locale === SOURCE_LOCALE);
    if (!source?.published || !source.updatedAt) {
      out[slug] = false;
      continue;
    }
    const srcAt = source.updatedAt;
    let all = true;
    for (const loc of TARGET_LOCALES) {
      const t = list.find((r) => r.locale === loc);
      if (!isTranslationRowSynced(srcAt, t?.updatedAt)) {
        all = false;
        break;
      }
    }
    out[slug] = all;
  }
  return out;
}

export async function readBlogMetadata(
  slug: string
): Promise<{ success: boolean; metadata?: BlogMetadata; error?: string }> {
  const post = await getBlogBySlug(slug, {
    includeDraft: true,
    locale: SOURCE_LOCALE,
  });
  if (!post) {
    return { success: false, error: "Blog not found" };
  }
  return { success: true, metadata: post.metadata };
}

export async function readBlogContent(
  slug: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const post = await getBlogBySlug(slug, {
    includeDraft: true,
    locale: SOURCE_LOCALE,
  });
  if (!post) {
    return { success: false, error: "Blog not found" };
  }
  return { success: true, content: post.content };
}
