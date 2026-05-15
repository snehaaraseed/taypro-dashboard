import "server-only";

import type { MetadataRoute } from "next";
import { slugifyAuthorName } from "@/app/data/blogAuthors";
import { listAllBlogs } from "@/lib/cms/blogService";
import { listAllProjects } from "@/lib/cms/projectService";
import {
  CMS_SITEMAP_DEFAULTS,
  SITE_URL,
  STATIC_SITEMAP_ROUTES,
} from "./sitemap-config";

function parseLastModified(...candidates: (string | undefined)[]): Date {
  for (const value of candidates) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
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

/** Author profile URLs that resolve to real pages (at least one published post). */
async function collectAuthorPaths(): Promise<
  Map<string, { lastModified: Date }>
> {
  const blogs = await listAllBlogs(false);
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

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const urls = new Map<string, MetadataRoute.Sitemap[number]>();

  const add = (item: MetadataRoute.Sitemap[number]) => {
    const path = item.url.replace(SITE_URL, "") || "/";
    urls.set(path, item);
  };

  for (const route of STATIC_SITEMAP_ROUTES) {
    add(
      entry(route.path, {
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      })
    );
  }

  try {
    const [blogs, projects, authorPaths] = await Promise.all([
      listAllBlogs(false),
      listAllProjects(false),
      collectAuthorPaths(),
    ]);

    for (const blog of blogs) {
      add(
        entry(`/blog/${blog.slug}`, {
          lastModified: parseLastModified(blog.updatedAt, blog.publishDate),
          changeFrequency: CMS_SITEMAP_DEFAULTS.blog.changeFrequency,
          priority: CMS_SITEMAP_DEFAULTS.blog.priority,
        })
      );
    }

    for (const project of projects) {
      add(
        entry(`/projects/${project.slug}`, {
          lastModified: parseLastModified(project.updatedAt, project.date),
          changeFrequency: CMS_SITEMAP_DEFAULTS.project.changeFrequency,
          priority: CMS_SITEMAP_DEFAULTS.project.priority,
        })
      );
    }

    for (const [authorSlug, meta] of authorPaths) {
      add(
        entry(`/blog/author/${authorSlug}`, {
          lastModified: meta.lastModified,
          changeFrequency: CMS_SITEMAP_DEFAULTS.author.changeFrequency,
          priority: CMS_SITEMAP_DEFAULTS.author.priority,
        })
      );
    }
  } catch (error) {
    console.error("[sitemap] CMS lookup failed; serving static routes only:", error);
  }

  return [...urls.values()].sort((a, b) => a.url.localeCompare(b.url));
}
