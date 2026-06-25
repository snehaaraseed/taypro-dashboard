import "server-only";

import type { MetadataRoute } from "next";
import { resolveAuthorSlug } from "@/app/data/blogAuthors";
import type { BlogAuthor } from "@/app/data/blogAuthors";
import { routing } from "@/i18n/routing";
import type { TayproLocale } from "@/i18n/markets";
import { getStoredAuthors } from "@/lib/cms/authorService";
import { listPublishedBlogsForSitemap } from "@/lib/cms/blogService";
import { listPublishedProjectsForSitemap } from "@/lib/cms/projectService";
import {
  BLOG_LIST_PAGE_SIZE,
  CMS_SITEMAP_DEFAULTS,
  SITE_URL,
  STATIC_SITEMAP_ROUTES,
} from "./sitemap-config";
import {
  sitemapPathForLocale,
} from "./locale-alternates";
import { getSitemapLocalesForPath } from "./sitemap-locales";
import { isRedirectedBlogSlug } from "./redirected-blog-slugs";
import {
  careersJobPath,
  jobOpeningSlug,
  listOpenJobOpenings,
} from "@/lib/erpnext/job-openings";

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
  const item: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}${path}`,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  };

  if (options.lastModified) {
    item.lastModified = options.lastModified;
  }

  return item;
}

function collectAuthorPaths(
  blogs: Awaited<ReturnType<typeof listPublishedBlogsForSitemap>>,
  storedAuthors: BlogAuthor[]
): Map<string, { lastModified: Date }> {
  const bySlug = new Map<string, { lastModified: Date }>();

  for (const blog of blogs) {
    const authorSlug = resolveAuthorSlug(blog.author, storedAuthors);
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
    for (const locale of getSitemapLocalesForPath(internalPath)) {
      addForLocale(internalPath, locale, options);
    }
  };

  const addForLocale = (
    internalPath: string,
    locale: TayproLocale,
    options: {
      lastModified?: Date;
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
    }
  ) => {
    add(
      entry(sitemapPathForLocale(internalPath, locale), {
        lastModified: options.lastModified,
        changeFrequency: options.changeFrequency,
        priority: options.priority,
      })
    );
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
      (b) =>
        isIndexableSlug(b.slug) &&
        b.locale &&
        !isRedirectedBlogSlug(b.slug)
    );
    const indexableProjects = projects.filter(
      (p) => isIndexableSlug(p.slug) && p.locale
    );

    const blogListByLocale = new Map<TayproLocale, typeof indexableBlogs>();
    for (const blog of indexableBlogs) {
      const locale = blog.locale as TayproLocale;
      const list = blogListByLocale.get(locale) ?? [];
      list.push(blog);
      blogListByLocale.set(locale, list);
    }

    const storedAuthors = await getStoredAuthors();

    for (const blog of indexableBlogs) {
      addForLocale(`/blog/${blog.slug}`, blog.locale as TayproLocale, {
        lastModified: parseLastModified(blog.updatedAt, blog.publishDate),
        changeFrequency: CMS_SITEMAP_DEFAULTS.blog.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.blog.priority,
      });
    }

    for (const locale of routing.locales) {
      const localeBlogs = blogListByLocale.get(locale) ?? [];
      if (localeBlogs.length === 0) continue;

      const totalBlogPages = Math.max(
        1,
        Math.ceil(localeBlogs.length / BLOG_LIST_PAGE_SIZE)
      );
      const blogListLastModified = latestBlogModified(localeBlogs);

      for (let page = 2; page <= totalBlogPages; page += 1) {
        addForLocale(`/blog?page=${page}`, locale, {
          lastModified: blogListLastModified,
          changeFrequency: CMS_SITEMAP_DEFAULTS.blogPagination.changeFrequency,
          priority: CMS_SITEMAP_DEFAULTS.blogPagination.priority,
        });
      }
    }

    for (const project of indexableProjects) {
      addForLocale(`/projects/${project.slug}`, project.locale as TayproLocale, {
        lastModified: parseLastModified(project.updatedAt, project.date),
        changeFrequency: CMS_SITEMAP_DEFAULTS.project.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.project.priority,
      });
    }

    for (const locale of routing.locales) {
      const localeBlogs = blogListByLocale.get(locale) ?? [];
      if (localeBlogs.length === 0) continue;

      const authorPaths = collectAuthorPaths(localeBlogs, storedAuthors);
      for (const [authorSlug, meta] of authorPaths) {
        addForLocale(`/blog/author/${authorSlug}`, locale, {
          lastModified: meta.lastModified,
          changeFrequency: CMS_SITEMAP_DEFAULTS.author.changeFrequency,
          priority: CMS_SITEMAP_DEFAULTS.author.priority,
        });
      }
    }

    const skipped =
      blogs.length -
      indexableBlogs.length +
      (projects.length - indexableProjects.length);
    if (skipped > 0) {
      console.warn(
        `[sitemap] Skipped ${skipped} CMS URL(s) with invalid slugs`
      );
    }
  } catch (error) {
    console.error(
      "[sitemap] CMS lookup failed; serving static routes only:",
      error
    );
  }

  try {
    const jobs = await listOpenJobOpenings();
    const careersLocale = routing.defaultLocale as TayproLocale;

    for (const job of jobs) {
      const slug = jobOpeningSlug(job);
      if (!slug) continue;

      addForLocale(careersJobPath(job), careersLocale, {
        lastModified: parseLastModified(job.posted_on),
        changeFrequency: CMS_SITEMAP_DEFAULTS.jobOpening.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.jobOpening.priority,
      });
    }
  } catch (error) {
    console.error(
      "[sitemap] ERPNext job openings lookup failed; omitting job URLs:",
      error
    );
  }

  return [...urls.values()].sort((a, b) => a.url.localeCompare(b.url));
}
