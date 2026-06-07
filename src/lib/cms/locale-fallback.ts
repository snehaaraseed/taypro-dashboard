import "server-only";

import type { TayproLocale } from "@/i18n/markets";
import { isActiveLocale } from "@/i18n/markets";
import { routing } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import type { DynamicBlog } from "@/app/api/blog/list/route";
import type { ProjectLinkSource } from "@/app/utils/internalLinking";
import { getBlogBySlug, listAllBlogs } from "@/lib/cms/blogService";
import {
  getAllFileProjects,
  getProjectBySlug,
} from "@/lib/cms/projectService";

export type CmsDetailKind = "blog" | "project";

export type CmsLinkTarget = {
  href: string;
  /** When set, next-intl Link should open this path in that locale (English fallback). */
  linkLocale?: TayproLocale;
};

function resolveRequestLocale(locale?: string): TayproLocale {
  if (locale && isActiveLocale(locale)) return locale;
  return SOURCE_LOCALE;
}

function detailPath(kind: CmsDetailKind, slug: string): string {
  return kind === "blog" ? `/blog/${slug}` : `/projects/${slug}`;
}

/** Href for a CMS detail page; links to English when the viewer locale has no translation. */
export function cmsDetailLink(
  kind: CmsDetailKind,
  slug: string,
  viewerLocale: string,
  publishedInViewerLocale: boolean
): CmsLinkTarget {
  const href = detailPath(kind, slug);
  const loc = resolveRequestLocale(viewerLocale);
  if (publishedInViewerLocale || loc === SOURCE_LOCALE) {
    return { href };
  }
  return { href, linkLocale: SOURCE_LOCALE };
}

type BlogPost = NonNullable<Awaited<ReturnType<typeof getBlogBySlug>>>;
type ProjectPost = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;

export type ResolvedCmsPost<T> = {
  post: T;
  requestedLocale: TayproLocale;
  contentLocale: TayproLocale;
  /** True when the visitor asked for a non-English locale but only English exists. */
  usesEnglishFallback: boolean;
};

export async function resolvePublishedBlog(
  slug: string,
  requestedLocale?: string
): Promise<ResolvedCmsPost<BlogPost> | null> {
  const loc = resolveRequestLocale(requestedLocale);
  const localized = await getBlogBySlug(slug, { locale: loc });
  if (localized) {
    return {
      post: localized,
      requestedLocale: loc,
      contentLocale: loc,
      usesEnglishFallback: false,
    };
  }
  if (loc === SOURCE_LOCALE) return null;
  const english = await getBlogBySlug(slug, { locale: SOURCE_LOCALE });
  if (!english) return null;
  return {
    post: english,
    requestedLocale: loc,
    contentLocale: SOURCE_LOCALE,
    usesEnglishFallback: true,
  };
}

export async function resolvePublishedProject(
  slug: string,
  requestedLocale?: string
): Promise<ResolvedCmsPost<ProjectPost> | null> {
  const loc = resolveRequestLocale(requestedLocale);
  const localized = await getProjectBySlug(slug, { locale: loc });
  if (localized) {
    return {
      post: localized,
      requestedLocale: loc,
      contentLocale: loc,
      usesEnglishFallback: false,
    };
  }
  if (loc === SOURCE_LOCALE) return null;
  const english = await getProjectBySlug(slug, { locale: SOURCE_LOCALE });
  if (!english) return null;
  return {
    post: english,
    requestedLocale: loc,
    contentLocale: SOURCE_LOCALE,
    usesEnglishFallback: true,
  };
}

/** Temporary redirect to English until a CMS translation is published. */
export function redirectCmsDetailToEnglish(
  kind: CmsDetailKind,
  slug: string
): never {
  return redirect({ href: detailPath(kind, slug), locale: SOURCE_LOCALE });
}

export function hreflangLocalesOrAll(
  published: TayproLocale[]
): TayproLocale[] {
  const unique = [...new Set(published)].filter((l) =>
    (routing.locales as readonly string[]).includes(l)
  );
  return unique.length > 0 ? unique : [SOURCE_LOCALE];
}

/** Locale blogs plus English-only posts (English href) for in-content cross-links. */
export async function listBlogsForInternalLinking(
  viewerLocale?: string
): Promise<DynamicBlog[]> {
  const loc = resolveRequestLocale(viewerLocale);
  const localeRows = await listAllBlogs(false, loc);
  const localeSlugs = new Set(localeRows.map((row) => row.slug));

  const toDynamic = (
    metadata: (typeof localeRows)[number],
    publishedInViewerLocale: boolean
  ): DynamicBlog => {
    const link = cmsDetailLink("blog", metadata.slug, loc, publishedInViewerLocale);
    return {
      ...metadata,
      href: link.href,
      source: "db",
      linkLocale: link.linkLocale,
    };
  };

  const merged: DynamicBlog[] = localeRows.map((row) => toDynamic(row, true));

  if (loc !== SOURCE_LOCALE) {
    const englishRows = await listAllBlogs(false, SOURCE_LOCALE);
    for (const row of englishRows) {
      if (!localeSlugs.has(row.slug)) {
        merged.push(toDynamic(row, false));
      }
    }
  }

  return merged;
}

/** Locale projects plus English-only case studies for in-content cross-links. */
export async function listProjectsForInternalLinking(
  viewerLocale?: string
): Promise<ProjectLinkSource[]> {
  const loc = resolveRequestLocale(viewerLocale);
  const localeProjects = await getAllFileProjects(loc);
  const localeSlugs = new Set(localeProjects.map((p) => p.id));

  const toSource = (
    project: (typeof localeProjects)[number],
    publishedInViewerLocale: boolean
  ): ProjectLinkSource => {
    const link = cmsDetailLink("project", project.id, loc, publishedInViewerLocale);
    return {
      slug: project.id,
      title: project.title,
      href: link.href,
      description: project.description,
      linkLocale: link.linkLocale,
    };
  };

  const merged = localeProjects.map((p) => toSource(p, true));

  if (loc !== SOURCE_LOCALE) {
    const englishProjects = await getAllFileProjects(SOURCE_LOCALE);
    for (const project of englishProjects) {
      if (!localeSlugs.has(project.id)) {
        merged.push(toSource(project, false));
      }
    }
  }

  return merged;
}
