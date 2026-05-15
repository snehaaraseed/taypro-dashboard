import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import type {
  ProjectData,
  ProjectMetadata,
} from "@/app/utils/projectFileUtils";

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
    description: row.description,
    image: row.image,
    imageAlt: row.imageAlt,
    details,
    slug: row.slug,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    published: row.published,
  };
}

export async function listAllProjects(
  includeDrafts = false
): Promise<ProjectMetadata[]> {
  const db = getDb();
  const rows = await db.select().from(projects);
  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .map(rowToMetadata);
}

export type ProjectSitemapEntry = {
  slug: string;
  date: string;
  updatedAt?: string | null;
};

/** Published projects only — used by dynamic sitemap generation. */
export async function listPublishedProjectsForSitemap(): Promise<
  ProjectSitemapEntry[]
> {
  const db = getDb();
  const rows = await db
    .select({
      slug: projects.slug,
      date: projects.date,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(eq(projects.published, true));

  return rows.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getAllFileProjects(): Promise<
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
  const metadataList = await listAllProjects(false);
  return metadataList.map((metadata) => ({
    id: metadata.slug,
    img: metadata.image,
    title: metadata.title,
    description: metadata.description,
    imageAlt: metadata.imageAlt,
    details: metadata.details,
    href: `/projects/${metadata.slug}`,
    date: metadata.date,
  }));
}

export async function readProjectMetadata(
  slug: string
): Promise<ProjectMetadata | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
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
    .where(eq(projects.slug, slug))
    .limit(1);
  return rows[0]?.content ?? "";
}

export async function createProjectFiles(
  projectData: ProjectData
): Promise<{ slug: string; updatedAt: string }> {
  const slug = createSlug(projectData.title);
  const db = getDb();
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (existing.length > 0) {
    throw new Error(`Project with slug "${slug}" already exists`);
  }

  const now = new Date().toISOString();
  await db.insert(projects).values({
    slug,
    title: projectData.title,
    description: projectData.description,
    image: projectData.image,
    imageAlt: projectData.imageAlt?.trim() || "",
    details: JSON.stringify(projectData.details || []),
    content: projectData.content || "",
    date: projectData.date || new Date().toISOString().split("T")[0],
    createdAt: now,
    updatedAt: now,
    published:
      projectData.published !== undefined ? projectData.published : true,
  });

  return { slug, updatedAt: now };
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
    .where(eq(projects.slug, oldSlug))
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
      .where(eq(projects.slug, finalSlug))
      .limit(1);
    if (conflict.length > 0) {
      throw new Error(`Project with slug "${finalSlug}" already exists`);
    }
  }

  const now = new Date().toISOString();
  await db
    .update(projects)
    .set({
      slug: finalSlug,
      title: projectData.title,
      description: projectData.description,
      image: projectData.image,
      imageAlt: projectData.imageAlt?.trim() ?? existing.imageAlt,
      details: JSON.stringify(projectData.details || []),
      content: projectData.content || "",
      date: projectData.date || existing.date,
      updatedAt: now,
      published:
        projectData.published !== undefined
          ? projectData.published
          : existing.published,
    })
    .where(eq(projects.slug, oldSlug));

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

export async function getProjectBySlug(
  slug: string,
  options?: { includeDraft?: boolean }
): Promise<{ metadata: ProjectMetadata; content: string } | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!options?.includeDraft && row.published === false) return null;
  return {
    metadata: rowToMetadata(row),
    content: row.content,
  };
}
