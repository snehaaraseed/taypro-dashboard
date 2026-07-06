import "server-only";

import type { MetadataRoute } from "next";
import { resolveAuthorSlug } from "@/app/data/blogAuthors";
import type { BlogAuthor } from "@/app/data/blogAuthors";
import { routing } from "@/i18n/routing";
import type { TayproLocale } from "@/i18n/markets";
import { getStoredAuthors } from "@/lib/cms/authorService";
import { listPublishedBlogsForSitemap } from "@/lib/cms/blogService";
import { listPublishedInsightsForSitemap } from "@/lib/cms/insightService";
import { listPublishedPressReleasesForSitemap } from "@/lib/cms/pressReleaseService";
import { listPublishedProjectsForSitemap } from "@/lib/cms/projectService";
import {
  BLOG_LIST_PAGE_SIZE,
  CMS_SITEMAP_DEFAULTS,
  SITE_URL,
  STATIC_SITEMAP_ROUTES,
} from "./sitemap-config";
import {
  sitemapPathForLocale,
  hreflangTagForLocale,
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
    alternates?: MetadataRoute.Sitemap[number]["alternates"];
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
  if (options.alternates) {
    item.alternates = options.alternates;
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
    const locales = getSitemapLocalesForPath(internalPath);
    const languages: Record<string, string> = {};
    for (const loc of locales) {
      languages[hreflangTagForLocale(loc)] = `${SITE_URL}${sitemapPathForLocale(internalPath, loc)}`;
    }
    languages["x-default"] = `${SITE_URL}${sitemapPathForLocale(internalPath, routing.defaultLocale as TayproLocale)}`;

    for (const locale of locales) {
      add(
        entry(sitemapPathForLocale(internalPath, locale), {
          lastModified: options.lastModified,
          changeFrequency: options.changeFrequency,
          priority: options.priority,
          alternates: {
            languages,
          },
        })
      );
    }
  };

  const addForLocale = (
    internalPath: string,
    locale: TayproLocale,
    options: {
      lastModified?: Date;
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
      alternates?: MetadataRoute.Sitemap[number]["alternates"];
    }
  ) => {
    add(
      entry(sitemapPathForLocale(internalPath, locale), {
        lastModified: options.lastModified,
        changeFrequency: options.changeFrequency,
        priority: options.priority,
        alternates: options.alternates,
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
    const [blogs, projects, insights, pressReleases] = await Promise.all([
      listPublishedBlogsForSitemap(),
      listPublishedProjectsForSitemap(),
      listPublishedInsightsForSitemap(),
      listPublishedPressReleasesForSitemap(),
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
    const indexableInsights = insights.filter(
      (i) => isIndexableSlug(i.slug) && i.locale
    );
    const indexablePressReleases = pressReleases.filter(
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

    const blogLocalesBySlug = new Map<string, TayproLocale[]>();
    for (const blog of indexableBlogs) {
      const list = blogLocalesBySlug.get(blog.slug) ?? [];
      list.push(blog.locale as TayproLocale);
      blogLocalesBySlug.set(blog.slug, list);
    }

    for (const blog of indexableBlogs) {
      const slug = blog.slug;
      const locales = blogLocalesBySlug.get(slug) || [blog.locale as TayproLocale];
      const languages: Record<string, string> = {};
      for (const loc of locales) {
        languages[hreflangTagForLocale(loc)] = `${SITE_URL}${sitemapPathForLocale(`/blog/${slug}`, loc)}`;
      }
      languages["x-default"] = `${SITE_URL}${sitemapPathForLocale(`/blog/${slug}`, routing.defaultLocale as TayproLocale)}`;

      addForLocale(`/blog/${blog.slug}`, blog.locale as TayproLocale, {
        lastModified: parseLastModified(blog.updatedAt, blog.publishDate),
        changeFrequency: CMS_SITEMAP_DEFAULTS.blog.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.blog.priority,
        alternates: {
          languages,
        },
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

    const projectLocalesBySlug = new Map<string, TayproLocale[]>();
    for (const project of indexableProjects) {
      const list = projectLocalesBySlug.get(project.slug) ?? [];
      list.push(project.locale as TayproLocale);
      projectLocalesBySlug.set(project.slug, list);
    }

    for (const project of indexableProjects) {
      const slug = project.slug;
      const locales = projectLocalesBySlug.get(slug) || [project.locale as TayproLocale];
      const languages: Record<string, string> = {};
      for (const loc of locales) {
        languages[hreflangTagForLocale(loc)] = `${SITE_URL}${sitemapPathForLocale(`/projects/${slug}`, loc)}`;
      }
      languages["x-default"] = `${SITE_URL}${sitemapPathForLocale(`/projects/${slug}`, routing.defaultLocale as TayproLocale)}`;

      addForLocale(`/projects/${project.slug}`, project.locale as TayproLocale, {
        lastModified: parseLastModified(project.updatedAt, project.date),
        changeFrequency: CMS_SITEMAP_DEFAULTS.project.changeFrequency,
        priority: CMS_SITEMAP_DEFAULTS.project.priority,
        alternates: {
          languages,
        },
      });
    }

    const insightLocalesBySlug = new Map<string, TayproLocale[]>();
    for (const insight of indexableInsights) {
      const list = insightLocalesBySlug.get(insight.slug) ?? [];
      list.push(insight.locale as TayproLocale);
      insightLocalesBySlug.set(insight.slug, list);
    }

    for (const insight of indexableInsights) {
      const slug = insight.slug;
      const locales = insightLocalesBySlug.get(slug) || [insight.locale as TayproLocale];
      const languages: Record<string, string> = {};
      for (const loc of locales) {
        languages[hreflangTagForLocale(loc)] = `${SITE_URL}${sitemapPathForLocale(`/insights/${slug}`, loc)}`;
      }
      languages["x-default"] = `${SITE_URL}${sitemapPathForLocale(`/insights/${slug}`, routing.defaultLocale as TayproLocale)}`;

      addForLocale(`/insights/${insight.slug}`, insight.locale as TayproLocale, {
        lastModified: parseLastModified(insight.updatedAt, insight.publishDate),
        changeFrequency: CMS_SITEMAP_DEFAULTS.blog.changeFrequency,
        priority: 0.55,
        alternates: {
          languages,
        },
      });
    }

    const pressLocalesBySlug = new Map<string, TayproLocale[]>();
    for (const pr of indexablePressReleases) {
      const list = pressLocalesBySlug.get(pr.slug) ?? [];
      list.push(pr.locale as TayproLocale);
      pressLocalesBySlug.set(pr.slug, list);
    }

    for (const pr of indexablePressReleases) {
      const slug = pr.slug;
      const locales = pressLocalesBySlug.get(slug) || [pr.locale as TayproLocale];
      const languages: Record<string, string> = {};
      for (const loc of locales) {
        languages[hreflangTagForLocale(loc)] = `${SITE_URL}${sitemapPathForLocale(`/press/releases/${slug}`, loc)}`;
      }
      languages["x-default"] = `${SITE_URL}${sitemapPathForLocale(`/press/releases/${slug}`, routing.defaultLocale as TayproLocale)}`;

      addForLocale(`/press/releases/${pr.slug}`, pr.locale as TayproLocale, {
        lastModified: parseLastModified(pr.updatedAt, pr.publishDate),
        changeFrequency: "monthly",
        priority: 0.55,
        alternates: {
          languages,
        },
      });
    }

    const authorLocales = new Map<string, { locales: TayproLocale[]; lastModified: Date }>();
    for (const locale of routing.locales) {
      const localeBlogs = blogListByLocale.get(locale) ?? [];
      if (localeBlogs.length === 0) continue;

      const authorPaths = collectAuthorPaths(localeBlogs, storedAuthors);
      for (const [authorSlug, meta] of authorPaths) {
        const entryVal = authorLocales.get(authorSlug) ?? { locales: [], lastModified: new Date(0) };
        entryVal.locales.push(locale);
        if (meta.lastModified > entryVal.lastModified) {
          entryVal.lastModified = meta.lastModified;
        }
        authorLocales.set(authorSlug, entryVal);
      }
    }

    for (const [authorSlug, entryVal] of authorLocales) {
      const languages: Record<string, string> = {};
      for (const loc of entryVal.locales) {
        languages[hreflangTagForLocale(loc)] = `${SITE_URL}${sitemapPathForLocale(`/blog/author/${authorSlug}`, loc)}`;
      }
      languages["x-default"] = `${SITE_URL}${sitemapPathForLocale(`/blog/author/${authorSlug}`, routing.defaultLocale as TayproLocale)}`;

      for (const locale of entryVal.locales) {
        addForLocale(`/blog/author/${authorSlug}`, locale, {
          lastModified: entryVal.lastModified,
          changeFrequency: CMS_SITEMAP_DEFAULTS.author.changeFrequency,
          priority: CMS_SITEMAP_DEFAULTS.author.priority,
          alternates: {
            languages,
          },
        });
      }
    }

    const skipped =
      blogs.length -
      indexableBlogs.length +
      (projects.length - indexableProjects.length) +
      (insights.length - indexableInsights.length) +
      (pressReleases.length - indexablePressReleases.length);
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
