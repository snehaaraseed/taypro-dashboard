import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import {
  excerptFromProjectContent,
  projectCardExcerpt,
  type ProjectGridItem,
} from "@/lib/cms/project-card-display";
import type {
  ProjectData,
  ProjectMetadata,
} from "@/app/utils/projectFileUtils";
import type { TayproLocale } from "@/i18n/markets";
import { isActiveLocale } from "@/i18n/markets";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import {
  canonicalizeCategoryDetailTags,
  projectMatchesCategory,
  type ProjectCategoryFilter,
} from "@/lib/cms/project-categories";
import {
  projectMatchesListFilter,
  relatedProjectsFilterFromDetails,
  type ProjectListFilter,
} from "@/lib/cms/project-products";
import type {
  ProjectEditorialStatus,
  ProjectFactsJson,
  ProjectSectionsJson,
} from "@/lib/cms/project-facts-types";
import {
  buildDetailsFromFacts,
  parseFactsJson,
  parseSectionsJson,
} from "@/lib/cms/project-facts";
import {
  composeProjectContent,
  extractInlineImagesFromHtml,
} from "@/lib/cms/compose-project-content";
import {
  allocateProjectCodename,
  formatProjectDisplayTitle,
} from "@/lib/cms/project-codename";
import { isDraftProjectSlug } from "@/lib/seo/draft-project-slugs";

export type { ProjectCategoryFilter } from "@/lib/cms/project-categories";
export type { ProjectListFilter } from "@/lib/cms/project-products";

export type ProjectFullRecord = ProjectMetadata & {
  content: string;
  facts: ProjectFactsJson | null;
  sections: ProjectSectionsJson | null;
};

function resolveLocale(locale?: string): TayproLocale {
  if (locale && isActiveLocale(locale)) return locale;
  return SOURCE_LOCALE;
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function rowToMetadata(row: typeof projects.$inferSelect): ProjectMetadata {
  let details: string[] = [];
  try {
    details = JSON.parse(row.details) as string[];
    if (!Array.isArray(details)) details = [];
  } catch {
    details = [];
  }
  return {
    title: row.title,
    codename: row.codename ?? null,
    displayTitle: formatProjectDisplayTitle(row.codename, row.title),
    description: row.description,
    image: row.image,
    imageAlt: row.imageAlt,
    details,
    slug: row.slug,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    published: row.published,
    author: row.author ?? "Taypro Team",
    editorialStatus: (row.editorialStatus as ProjectEditorialStatus) ?? "legacy",
    seoKeyword: row.seoKeyword ?? null,
    factsJson: row.factsJson ?? null,
    sectionsJson: row.sectionsJson ?? null,
  };
}

function composeContentOnSave(
  projectData: ProjectData,
  existingContent?: string
): string {
  if (projectData.content?.trim() && !projectData.sections) {
    return projectData.content;
  }
  const facts = projectData.facts ?? null;
  const sections = projectData.sections ?? null;
  if (!facts || !sections) {
    return projectData.content || existingContent || "";
  }
  const preserved = existingContent
    ? extractInlineImagesFromHtml(existingContent)
    : [];
  return composeProjectContent(facts, sections, {
    preservedInlineImages: preserved,
  });
}

export async function listAllProjects(
  includeDrafts = false,
  locale?: string
): Promise<ProjectMetadata[]> {
  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.locale, loc));
  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .filter((r) => includeDrafts || !isDraftProjectSlug(r.slug))
    .map(rowToMetadata);
}

/** Locales with a published row for this slug (for hreflang). */
export async function getPublishedProjectLocales(
  slug: string
): Promise<TayproLocale[]> {
  const db = getDb();
  const rows = await db
    .select({ locale: projects.locale })
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.published, true)));
  return rows
    .map((r) => r.locale)
    .filter(isActiveLocale)
    .filter((locale) => !isDraftProjectSlug(slug)) as TayproLocale[];
}

export type ProjectSitemapEntry = {
  slug: string;
  locale: TayproLocale;
  date: string;
  updatedAt?: string | null;
};

/** Published projects only, used by dynamic sitemap generation. */
export async function listPublishedProjectsForSitemap(): Promise<
  ProjectSitemapEntry[]
> {
  const db = getDb();
  const rows = await db
    .select({
      slug: projects.slug,
      locale: projects.locale,
      date: projects.date,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(eq(projects.published, true));

  return rows
    .filter((r) => isActiveLocale(r.locale))
    .filter((r) => !isDraftProjectSlug(r.slug))
    .map((r) => ({
      slug: r.slug,
      locale: r.locale as TayproLocale,
      date: r.date,
      updatedAt: r.updatedAt,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllFileProjects(
  locale?: string
): Promise<
  Array<{
    id: string;
    img: string;
    title: string;
    description: string;
    imageAlt?: string;
    details: string[];
    href: string;
    date: string;
  }>
> {
  const metadataList = await listAllProjects(false, locale);
  return metadataList.map((metadata) => ({
    id: metadata.slug,
    img: metadata.image,
    title: metadata.displayTitle,
    siteTitle: metadata.title,
    codename: metadata.codename ?? undefined,
    description: metadata.description,
    imageAlt: metadata.imageAlt,
    details: metadata.details,
    href: `/projects/${metadata.slug}`,
    date: metadata.date,
  }));
}

export type ProjectCard = Awaited<ReturnType<typeof getAllFileProjects>>[number];

export async function getProjectsByCategory(
  category: ProjectCategoryFilter,
  locale?: string
): Promise<ProjectCard[]> {
  return getFilteredFileProjects({ category }, locale, 0);
}

const DEFAULT_PROJECT_CARD_LIMIT = 6;

function sortProjectsByDate(projects: ProjectCard[]): ProjectCard[] {
  return [...projects].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );
}

export async function getFilteredFileProjects(
  filter: ProjectListFilter,
  locale?: string,
  limit = DEFAULT_PROJECT_CARD_LIMIT
): Promise<ProjectCard[]> {
  const all = await getAllFileProjects(locale);
  const matched = sortProjectsByDate(
    all.filter((p) =>
      projectMatchesListFilter(
        {
          title: p.title,
          description: p.description,
          details: p.details,
        },
        filter
      )
    )
  );
  return limit > 0 ? matched.slice(0, limit) : matched;
}

/** Published projects in slug order; skips missing or draft slugs. */
export async function getProjectsBySlugs(
  slugs: string[],
  locale?: string
): Promise<ProjectCard[]> {
  if (slugs.length === 0) return [];
  const all = await getAllFileProjects(locale);
  const bySlug = new Map(all.map((p) => [p.id, p]));
  const ordered: ProjectCard[] = [];
  for (const slug of slugs) {
    const project = bySlug.get(slug);
    if (project) ordered.push(project);
  }
  return ordered;
}

/** Fetch HTML content for many slugs in one query (hub card excerpts). */
export async function getProjectContentBySlugs(
  slugs: string[],
  locale?: string
): Promise<Map<string, string>> {
  if (slugs.length === 0) return new Map();

  const loc = resolveLocale(locale);
  const db = getDb();
  const rows = await db
    .select({ slug: projects.slug, content: projects.content })
    .from(projects)
    .where(
      and(
        inArray(projects.slug, slugs),
        eq(projects.locale, loc),
        eq(projects.published, true)
      )
    );

  return new Map(rows.map((row) => [row.slug, row.content ?? ""]));
}

/** Attach card excerpts for editorial project grids (single content query). */
export async function enrichProjectsForGrid(
  projects: ProjectCard[],
  locale?: string
): Promise<ProjectGridItem[]> {
  if (projects.length === 0) return [];

  const contentBySlug = await getProjectContentBySlugs(
    projects.map((project) => project.id),
    locale
  );

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    img: project.img,
    href: project.href,
    description: project.description,
    imageAlt: project.imageAlt,
    details: project.details,
    cardExcerpt:
      excerptFromProjectContent(contentBySlug.get(project.id)) ||
      projectCardExcerpt(project.description),
  }));
}

/** Featured slugs first (config order), then keyword-filter matches; portfolio fallback when none. */
export async function getStateLandingProjects(
  featuredSlugs: string[],
  filter: ProjectListFilter,
  locale?: string,
  limit = DEFAULT_PROJECT_CARD_LIMIT
): Promise<ProjectCard[]> {
  const featured = await getProjectsBySlugs(featuredSlugs, locale);
  const featuredIds = new Set(featured.map((p) => p.id));
  const filtered = await getFilteredFileProjects(filter, locale, 0);
  const rest = filtered.filter((p) => !featuredIds.has(p.id));
  let combined = [...featured, ...rest];

  if (combined.length === 0) {
    const all = await getAllFileProjects(locale);
    combined = sortProjectsByDate(all);
  }

  return limit > 0 ? combined.slice(0, limit) : combined;
}

export async function getRelatedFileProjects(
  slug: string,
  details: string[],
  locale?: string,
  limit = 3
): Promise<ProjectCard[]> {
  const filter = relatedProjectsFilterFromDetails(details);
  const related = await getFilteredFileProjects(filter, locale, 0);
  return related
    .filter((p) => p.id !== slug && p.href !== `/projects/${slug}`)
    .slice(0, limit);
}

export async function readProjectMetadata(
  slug: string
): Promise<ProjectMetadata | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.locale, SOURCE_LOCALE))
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return rowToMetadata(row);
}

export async function readProjectContent(slug: string): Promise<string> {
  const db = getDb();
  const rows = await db
    .select({ content: projects.content })
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.locale, SOURCE_LOCALE))
    )
    .limit(1);
  return rows[0]?.content ?? "";
}

export async function createProjectFiles(
  projectData: ProjectData
): Promise<{ slug: string; updatedAt: string; codename: string }> {
  const slug = createSlug(projectData.title);
  const db = getDb();
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.locale, SOURCE_LOCALE))
    )
    .limit(1);
  if (existing.length > 0) {
    throw new Error(`Project with slug "${slug}" already exists`);
  }

  const now = new Date().toISOString();
  const published =
    projectData.published !== undefined ? projectData.published : true;

  const codename = await allocateProjectCodename();

  await db.insert(projects).values({
    slug,
    locale: SOURCE_LOCALE,
    title: projectData.title,
    codename,
    description: projectData.description,
    image: projectData.image,
    imageAlt: projectData.imageAlt?.trim() || "",
    details: JSON.stringify(
      canonicalizeCategoryDetailTags(
        projectData.details?.length
          ? projectData.details
          : projectData.facts
            ? buildDetailsFromFacts(projectData.facts)
            : []
      )
    ),
    content: composeContentOnSave(projectData),
    factsJson: projectData.facts ? JSON.stringify(projectData.facts) : null,
    sectionsJson: projectData.sections
      ? JSON.stringify(projectData.sections)
      : null,
    editorialStatus: projectData.editorialStatus ?? "ai_draft",
    seoKeyword: projectData.seoKeyword?.trim() || null,
    author: projectData.author?.trim() || "Taypro Team",
    date: projectData.date || new Date().toISOString().split("T")[0],
    createdAt: now,
    updatedAt: now,
    published,
  });

  return { slug, updatedAt: now, codename };
}

export async function updateProjectFiles(
  oldSlug: string,
  projectData: ProjectData,
  newSlug?: string
): Promise<{ slug: string; updatedAt: string }> {
  const db = getDb();
  const existingRows = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.slug, oldSlug), eq(projects.locale, SOURCE_LOCALE))
    )
    .limit(1);
  const existing = existingRows[0];
  if (!existing) {
    throw new Error(`Project with slug "${oldSlug}" does not exist`);
  }

  const finalSlug = newSlug || oldSlug;
  if (finalSlug !== oldSlug) {
    const conflict = await db
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(eq(projects.slug, finalSlug), eq(projects.locale, SOURCE_LOCALE))
      )
      .limit(1);
    if (conflict.length > 0) {
      throw new Error(`Project with slug "${finalSlug}" already exists`);
    }
  }

  const now = new Date().toISOString();
  const published =
    projectData.published !== undefined
      ? projectData.published
      : existing.published;

  if (finalSlug !== oldSlug) {
    await db
      .update(projects)
      .set({ slug: finalSlug })
      .where(eq(projects.slug, oldSlug));
  }

  await db
    .update(projects)
    .set({
      title: projectData.title,
      description: projectData.description,
      image: projectData.image,
      imageAlt: projectData.imageAlt?.trim() ?? existing.imageAlt,
      details: JSON.stringify(
        canonicalizeCategoryDetailTags(
          projectData.details?.length
            ? projectData.details
            : projectData.facts
              ? buildDetailsFromFacts(projectData.facts)
              : JSON.parse(existing.details || "[]")
        )
      ),
      content: composeContentOnSave(projectData, existing.content),
      factsJson:
        projectData.facts !== undefined
          ? projectData.facts
            ? JSON.stringify(projectData.facts)
            : null
          : existing.factsJson,
      sectionsJson:
        projectData.sections !== undefined
          ? projectData.sections
            ? JSON.stringify(projectData.sections)
            : null
          : existing.sectionsJson,
      editorialStatus:
        projectData.editorialStatus ?? existing.editorialStatus ?? "legacy",
      seoKeyword:
        projectData.seoKeyword !== undefined
          ? projectData.seoKeyword?.trim() || null
          : existing.seoKeyword,
      author:
        projectData.author?.trim() || existing.author || "Taypro Team",
      date: projectData.date || existing.date,
      updatedAt: now,
      published,
    })
    .where(
      and(eq(projects.slug, finalSlug), eq(projects.locale, SOURCE_LOCALE))
    );

  return { slug: finalSlug, updatedAt: now };
}

export async function deleteProjectFiles(slug: string): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (existing.length === 0) {
    throw new Error(`Project with slug "${slug}" does not exist`);
  }
  await db.delete(projects).where(eq(projects.slug, slug));
}

export async function readProjectFull(
  slug: string
): Promise<ProjectFullRecord | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(
      and(eq(projects.slug, slug), eq(projects.locale, SOURCE_LOCALE))
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    ...rowToMetadata(row),
    content: row.content ?? "",
    facts: parseFactsJson(row.factsJson),
    sections: parseSectionsJson(row.sectionsJson),
  };
}

export async function listProjectsAdmin(
  filters?: { editorialStatus?: ProjectEditorialStatus; published?: boolean }
): Promise<ProjectMetadata[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.locale, SOURCE_LOCALE));
  return rows
    .filter((r) => {
      if (
        filters?.editorialStatus &&
        r.editorialStatus !== filters.editorialStatus
      ) {
        return false;
      }
      if (
        filters?.published !== undefined &&
        r.published !== filters.published
      ) {
        return false;
      }
      return true;
    })
    .map(rowToMetadata);
}

export async function getProjectBySlug(
  slug: string,
  options?: { includeDraft?: boolean; locale?: string }
): Promise<{ metadata: ProjectMetadata; content: string } | null> {
  const loc = resolveLocale(options?.locale);
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.locale, loc)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!options?.includeDraft && isDraftProjectSlug(slug)) return null;
  if (!options?.includeDraft && row.published === false) return null;
  return {
    metadata: rowToMetadata(row),
    content: row.content,
  };
}
