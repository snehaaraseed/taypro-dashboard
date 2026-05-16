import "server-only";

import type { MetadataRoute } from "next";
import { slugifyAuthorName } from "@/app/data/blogAuthors";
import { listPublishedBlogsForSitemap } from "@/lib/cms/blogService";
import { listPublishedProjectsForSitemap } from "@/lib/cms/projectService";
import {
  BLOG_LIST_PAGE_SIZE,
  CMS_SITEMAP_DEFAULTS,
  SITE_URL,
  STATIC_SITEMAP_ROUTES,
} from "./sitemap-config";
import { sitemapPathsForAllLocales } from "./locale-alternates";

const INDEXABLE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseLastModified(...candidates: (string | null | undefined)[]): Date {
  for (const value of candidates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

function isIndexableSlug(slug: string): boolean {
  const normalized = slug.trim();
  return Boolean(normalized && INDEXABLE_SLUG.test(normalized));
}

function entry(
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  };
}

function collectAuthorPaths(
  blogs: Awaited<ReturnType<typeof listPublishedBlogsForSitemap>>
): Map<string, { lastModified: Date }> {
  const bySlug = new Map<string, { lastModified: Date }>();

  for (const blog of blogs) {
    const authorSlug = slugifyAuthorName(blog.author);
    const lastModified = parseLastModified(blog.updatedAt, blog.publishDate);
    const existing = bySlug.get(authorSlug);
    if (!existing || lastModified > existing.lastModified) {
      bySlug.set(authorSlug, { lastModified });
    }
  }

  return bySlug;
}

function latestBlogModified(
  blogs: Awaited<ReturnType<typeof listPublishedBlogsForSitemap>>
): Date {
  let latest = new Date(0);
  for (const blog of blogs) {
    const modified = parseLastModified(blog.updatedAt, blog.publishDate);
    if (modified > latest) latest = modified;
  }
  return latest.getTime() > 0 ? latest : new Date();
}

/** Builds sitemap URLs from static routes + live CMS (published blogs/projects/authors). */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const urls = new Map<string, MetadataRoute.Sitemap[number]>();

  const add = (item: MetadataRoute.Sitemap[number]) => {
    const path = item.url.replace(SITE_URL, "") || "/";
    urls.set(path, item);
  };

  const addLocalized = (
    internalPath: string,
    options: {
      lastModified?: Date;
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
    }
  ) => {
    for (const path of sitemapPathsForAllLocales(internalPath)) {
      add(
        entry(path, {
          lastModified: options.lastModified,
          changeFrequency: options.changeFrequency,
          priority: options.priority,
        })
      );
    }
  };

  for (const route of STATIC_SITEMAP_ROUTES) {
    addLocalized(route.path, {
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  try {
    const [blogs, projects] = await Promise.all([
      listPublishedBlogsForSitemap(),
      listPublishedProjectsForSitemap(),
    ]);

    const indexableBlogs = blogs.filter(
      (b) => isIndexableSlug(b.slug) && b.locale
    );
    const indexableProjects = projects.filter(
      (p) => isIndexableSlug(p.slug) && p.locale
    );

    const blogListByLocale = new Map<string, typeof indexableBlogs>();
    for (const blog of indexableBlogs) {
      const list = blogListByLocale.get(blog.locale) ?? [];
      list.push(blog);
      blogListByLocale.set(blog.locale, list);
    }

    const authorPaths = collectAuthorPaths(
      blogListByLocale.get("en") ?? indexableBlogs.filter((b) => b.locale === "en")
    );
    const enBlogs =
      blogListByLocale.get("en") ??
      indexableBlogs.filter((b) => b.locale === "en");
    const blogListLastModified = latestBlogModified(enBlogs);

    for (const blog of indexableBlogs) {
      addLocalized(`/blog/${blog.slug}`, {
        lastModified: parseLastModified(blog.updatedAt, blog.publishDate),
        changeFrequency: CMS_SITEMAP_DEFAULTS.blog.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.blog.priority,
      });
    }

    const totalBlogPages = Math.max(
      1,
      Math.ceil(indexableBlogs.length / BLOG_LIST_PAGE_SIZE)
    );
    for (let page = 2; page <= totalBlogPages; page++) {
      addLocalized(`/blog?page=${page}`, {
        lastModified: blogListLastModified,
        changeFrequency: CMS_SITEMAP_DEFAULTS.blogPagination.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.blogPagination.priority,
      });
    }
    for (const project of indexableProjects) {
      addLocalized(`/projects/${project.slug}`, {
        lastModified: parseLastModified(project.updatedAt, project.date),
        changeFrequency: CMS_SITEMAP_DEFAULTS.project.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.project.priority,
      });
    }

    for (const [authorSlug, meta] of authorPaths) {
      addLocalized(`/blog/author/${authorSlug}`, {
        lastModified: meta.lastModified,
        changeFrequency: CMS_SITEMAP_DEFAULTS.author.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.author.priority,
      });
    }

    const skipped =
      blogs.length -
      indexableBlogs.length +
      (projects.length - indexableProjects.length);
    if (skipped > 0) {
      console.warn(
        `[sitemap] Skipped ${skipped} CMS URL(s) with invalid or unpublished slugs`
      );
    }
  } catch (error) {
    console.error(
      "[sitemap] CMS lookup failed; serving static routes only:",
      error
    );
  }

  return [...urls.values()].sort((a, b) => a.url.localeCompare(b.url));
}
