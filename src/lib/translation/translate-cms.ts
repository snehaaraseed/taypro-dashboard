import "server-only";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import type { TayproLocale } from "@/i18n/markets";
import { getDb } from "@/lib/db";
import { blogs, projects } from "@/lib/db/schema";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
import { SOURCE_LOCALE, TARGET_LOCALES } from "./config";
import { parseBlogFaqs, serializeBlogFaqs } from "@/lib/cms/blog-faqs";
import {
  translateBlogFaqsWithGemini,
  translateFieldsWithGemini,
  translateStringListWithGemini,
} from "./gemini-translate";
import {
  mergeTranslatedProjectDetails,
  partitionProjectDetailsForTranslation,
} from "@/lib/cms/project-categories";
async function onBlogLocaleTranslated(
  slug: string,
  locale: TayproLocale,
  success: boolean,
  error?: unknown
): Promise<void> {
  if (success) return;
  console.warn(
    `[translate] blog ${slug} (${locale}) failed; will retry on next daily cron:`,
    error instanceof Error ? error.message : error
  );
}

async function onProjectLocaleTranslated(
  slug: string,
  locale: TayproLocale,
  success: boolean,
  error?: unknown
): Promise<void> {
  if (success) return;
  console.warn(
    `[translate] project ${slug} (${locale}) failed; will retry on next daily cron:`,
    error instanceof Error ? error.message : error
  );
}

export type TranslationResult = {
  locale: TayproLocale;
  success: boolean;
  error?: string;
};

export type BatchTranslationResult = {
  slug: string;
  type: "blog" | "project";
  results: TranslationResult[];
};

async function upsertBlogLocale(
  slug: string,
  locale: TayproLocale,
  source: typeof blogs.$inferSelect,
  translated: {
    title: string;
    description: string;
    content: string;
    featuredImageAlt: string;
    faqs: string;
  }
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = await db
    .select({ id: blogs.id })
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.locale, locale)))
    .limit(1);

  const row = {
    slug,
    locale,
    title: translated.title,
    description: translated.description,
    content: translated.content,
    faqs: translated.faqs,
    featuredImage: source.featuredImage,
    featuredImageAlt: translated.featuredImageAlt || source.featuredImageAlt,
    author: source.author,
    publishDate: source.publishDate,
    published: source.published,
    updatedAt: now,
  };

  if (existing.length > 0) {
    await db
      .update(blogs)
      .set(row)
      .where(and(eq(blogs.slug, slug), eq(blogs.locale, locale)));
  } else {
    await db.insert(blogs).values({
      ...row,
      createdAt: source.createdAt || now,
    });
  }
}

async function upsertProjectLocale(
  slug: string,
  locale: TayproLocale,
  source: typeof projects.$inferSelect,
  translated: {
    title: string;
    description: string;
    content: string;
    imageAlt: string;
    details: string[];
  }
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, locale)))
    .limit(1);

  const row = {
    slug,
    locale,
    title: translated.title,
    description: translated.description,
    content: translated.content,
    image: source.image,
    imageAlt: translated.imageAlt || source.imageAlt,
    details: JSON.stringify(translated.details),
    author: source.author,
    date: source.date,
    published: source.published,
    updatedAt: now,
  };

  if (existing.length > 0) {
    await db
      .update(projects)
      .set(row)
      .where(and(eq(projects.slug, slug), eq(projects.locale, locale)));
  } else {
    await db.insert(projects).values({
      ...row,
      createdAt: source.createdAt || now,
    });
  }
}

function revalidateBlogPaths(slug: string): void {
  for (const locale of [SOURCE_LOCALE, ...TARGET_LOCALES]) {
    revalidatePath(`/${locale}/blog/${slug}`);
  }
  revalidatePath("/blog");
  revalidateSitemap();
}

function revalidateProjectPaths(slug: string): void {
  for (const locale of [SOURCE_LOCALE, ...TARGET_LOCALES]) {
    revalidatePath(`/${locale}/projects/${slug}`);
  }
  revalidatePath("/projects");
  revalidateSitemap();
}

/** Translate one published English blog into all target locales. */
export async function translatePublishedBlog(
  slug: string,
  options?: { locales?: TayproLocale[]; force?: boolean }
): Promise<BatchTranslationResult> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogs)
    .where(and(eq(blogs.slug, slug), eq(blogs.locale, SOURCE_LOCALE)))
    .limit(1);

  const source = rows[0];
  const results: TranslationResult[] = [];

  if (!source) {
    return {
      slug,
      type: "blog",
      results: TARGET_LOCALES.map((locale) => ({
        locale,
        success: false,
        error: "English source post not found",
      })),
    };
  }

  if (!source.published) {
    return {
      slug,
      type: "blog",
      results: TARGET_LOCALES.map((locale) => ({
        locale,
        success: false,
        error: "Source post is not published",
      })),
    };
  }

  const targets = options?.locales?.length
    ? options.locales.filter((l) => l !== SOURCE_LOCALE)
    : [...TARGET_LOCALES];

  for (const locale of targets) {
    try {
      if (!options?.force) {
        const existing = await db
          .select({ updatedAt: blogs.updatedAt })
          .from(blogs)
          .where(and(eq(blogs.slug, slug), eq(blogs.locale, locale)))
          .limit(1);
        if (
          existing[0]?.updatedAt &&
          source.updatedAt &&
          existing[0].updatedAt >= source.updatedAt
        ) {
          results.push({ locale, success: true });
          await onBlogLocaleTranslated(slug, locale, true);
          continue;
        }
      }

      const sourceFaqs = parseBlogFaqs(source.faqs);

      const translated = await translateFieldsWithGemini(
        {
          title: source.title,
          description: source.description,
          content: source.content,
          featuredImageAlt: source.featuredImageAlt,
        },
        locale
      );

      const translatedFaqs = sourceFaqs.length
        ? await translateBlogFaqsWithGemini(sourceFaqs, locale)
        : [];

      await upsertBlogLocale(slug, locale, source, {
        title: translated.title,
        description: translated.description,
        content: translated.content,
        featuredImageAlt: translated.featuredImageAlt || source.featuredImageAlt,
        faqs: serializeBlogFaqs(translatedFaqs),
      });

      results.push({ locale, success: true });
      await onBlogLocaleTranslated(slug, locale, true);
    } catch (error) {
      results.push({
        locale,
        success: false,
        error: error instanceof Error ? error.message : "Translation failed",
      });
      await onBlogLocaleTranslated(slug, locale, false, error);
    }
  }

  revalidateBlogPaths(slug);
  return { slug, type: "blog", results };
}

/** Translate one published English project into all target locales. */
export async function translatePublishedProject(
  slug: string,
  options?: { locales?: TayproLocale[]; force?: boolean }
): Promise<BatchTranslationResult> {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, SOURCE_LOCALE)))
    .limit(1);

  const source = rows[0];
  const results: TranslationResult[] = [];

  if (!source) {
    return {
      slug,
      type: "project",
      results: TARGET_LOCALES.map((locale) => ({
        locale,
        success: false,
        error: "English source project not found",
      })),
    };
  }

  if (!source.published) {
    return {
      slug,
      type: "project",
      results: TARGET_LOCALES.map((locale) => ({
        locale,
        success: false,
        error: "Source project is not published",
      })),
    };
  }

  let details: string[] = [];
  try {
    details = JSON.parse(source.details) as string[];
    if (!Array.isArray(details)) details = [];
  } catch {
    details = [];
  }

  const targets = options?.locales?.length
    ? options.locales.filter((l) => l !== SOURCE_LOCALE)
    : [...TARGET_LOCALES];

  for (const locale of targets) {
    try {
      if (!options?.force) {
        const existing = await db
          .select({ updatedAt: projects.updatedAt })
          .from(projects)
          .where(and(eq(projects.slug, slug), eq(projects.locale, locale)))
          .limit(1);
        if (
          existing[0]?.updatedAt &&
          source.updatedAt &&
          existing[0].updatedAt >= source.updatedAt
        ) {
          results.push({ locale, success: true });
          continue;
        }
      }

      const translated = await translateFieldsWithGemini(
        {
          title: source.title,
          description: source.description,
          content: source.content,
          imageAlt: source.imageAlt,
        },
        locale
      );

      const { categoryByIndex, translatableIndices } =
        partitionProjectDetailsForTranslation(details);
      const translatableValues = translatableIndices.map((i) => details[i]);
      const translatedFacts = translatableValues.length
        ? await translateStringListWithGemini(translatableValues, locale)
        : [];
      const translatedDetails = mergeTranslatedProjectDetails(
        details,
        translatedFacts,
        translatableIndices,
        categoryByIndex
      );

      await upsertProjectLocale(slug, locale, source, {
        title: translated.title,
        description: translated.description,
        content: translated.content,
        imageAlt: translated.imageAlt || source.imageAlt,
        details: translatedDetails,
      });

      results.push({ locale, success: true });
      await onProjectLocaleTranslated(slug, locale, true);
    } catch (error) {
      results.push({
        locale,
        success: false,
        error: error instanceof Error ? error.message : "Translation failed",
      });
      await onProjectLocaleTranslated(slug, locale, false, error);
    }
  }

  revalidateProjectPaths(slug);
  return { slug, type: "project", results };
}

/** Fire-and-forget translation after publish (logs errors). */
export function scheduleBlogTranslations(slug: string): void {
  void translatePublishedBlog(slug).catch((error) => {
    console.error(`[translate] blog ${slug}:`, error);
  });
}

export function scheduleProjectTranslations(slug: string): void {
  void translatePublishedProject(slug).catch((error) => {
    console.error(`[translate] project ${slug}:`, error);
  });
}

export async function listEnglishBlogSlugs(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ slug: blogs.slug })
    .from(blogs)
    .where(and(eq(blogs.locale, SOURCE_LOCALE), eq(blogs.published, true)));
  return rows.map((r) => r.slug);
}

export async function listEnglishProjectSlugs(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(
      and(eq(projects.locale, SOURCE_LOCALE), eq(projects.published, true))
    );
  return rows.map((r) => r.slug);
}
