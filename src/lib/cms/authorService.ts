import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { authors, blogs, projects } from "@/lib/db/schema";
import {
  BLOG_AUTHORS,
  BlogAuthor,
  slugifyAuthorName,
  normalizeLinkedInUrl,
  resolveAuthorSlug,
} from "@/app/data/blogAuthors";
import { isEligibleBlogAuthor } from "@/lib/cms/blog-author-pool";
import { listRecentBlogAuthorNames } from "@/lib/cms/blogService";
import {
  inferExpertiseFromAuthor,
  mergeTopicTags,
  parseExpertiseTags,
  pickBestAuthorForTopicTags,
  serializeExpertiseTags,
} from "@/lib/cms/blog-author-expertise";
import type { BlogAuthorExpertiseTag } from "@/lib/cms/blog-author-expertise-ids";
import type { TopicCategory } from "@/lib/topicCategories";

function rowToAuthor(row: typeof authors.$inferSelect): BlogAuthor {
  const expertiseTags = parseExpertiseTags(row.expertiseTags);
  return {
    name: row.name,
    slug: row.slug,
    role: row.role,
    bio: row.bio,
    expertiseTags: expertiseTags.length > 0 ? expertiseTags : undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    linkedInUrl: row.linkedInUrl ?? undefined,
  };
}

async function seedDefaultAuthorsIfEmpty(): Promise<void> {
  const db = getDb();
  const count = await db.select({ id: authors.id }).from(authors);
  if (count.length > 0) return;

  const now = new Date().toISOString();
  for (const author of BLOG_AUTHORS) {
    const tags =
      author.expertiseTags?.length ?
        serializeExpertiseTags(author.expertiseTags)
      : serializeExpertiseTags(inferExpertiseFromAuthor(author));
    await db.insert(authors).values({
      slug: author.slug,
      name: author.name,
      role: author.role,
      bio: author.bio,
      avatarUrl: author.avatarUrl ?? null,
      linkedInUrl: author.linkedInUrl ?? null,
      expertiseTags: tags,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function getStoredAuthors(): Promise<BlogAuthor[]> {
  await seedDefaultAuthorsIfEmpty();
  const db = getDb();
  const rows = await db.select().from(authors).orderBy(asc(authors.name));
  return rows.map(rowToAuthor);
}

function normalizeExpertiseInput(
  tags: BlogAuthorExpertiseTag[] | undefined,
  fallbackAuthor: Pick<BlogAuthor, "role" | "bio" | "name">
): string {
  if (tags && tags.length > 0) {
    return serializeExpertiseTags(tags);
  }
  return serializeExpertiseTags(inferExpertiseFromAuthor(fallbackAuthor));
}

export type AuthorPropagationResult = {
  blogs: number;
  projects: number;
};

export type UpsertAuthorResult = {
  authors: BlogAuthor[];
  propagated: AuthorPropagationResult | null;
};

async function propagateAuthorNameToCmsContent(
  slug: string,
  oldName: string,
  newName: string,
  authorsBeforeRename: BlogAuthor[]
): Promise<AuthorPropagationResult> {
  if (oldName.trim().toLowerCase() === newName.trim().toLowerCase()) {
    return { blogs: 0, projects: 0 };
  }

  const db = getDb();
  const now = new Date().toISOString();
  const oldNorm = oldName.trim().toLowerCase();

  function matchesAuthorField(authorField: string): boolean {
    const trimmed = authorField.trim();
    if (!trimmed) return false;
    if (trimmed.toLowerCase() === oldNorm) return true;
    return resolveAuthorSlug(trimmed, authorsBeforeRename) === slug;
  }

  const blogRows = await db
    .select({ id: blogs.id, author: blogs.author })
    .from(blogs);
  const blogIds = blogRows
    .filter((row) => matchesAuthorField(row.author))
    .map((row) => row.id);
  if (blogIds.length > 0) {
    await db
      .update(blogs)
      .set({ author: newName, updatedAt: now })
      .where(inArray(blogs.id, blogIds));
  }

  const projectRows = await db
    .select({ id: projects.id, author: projects.author })
    .from(projects);
  const projectIds = projectRows
    .filter((row) => matchesAuthorField(row.author))
    .map((row) => row.id);
  if (projectIds.length > 0) {
    await db
      .update(projects)
      .set({ author: newName, updatedAt: now })
      .where(inArray(projects.id, projectIds));
  }

  return { blogs: blogIds.length, projects: projectIds.length };
}

export async function upsertAuthor(
  authorInput: Omit<BlogAuthor, "slug"> & {
    slug?: string;
    expertiseTags?: BlogAuthorExpertiseTag[];
  }
): Promise<UpsertAuthorResult> {
  const db = getDb();
  await seedDefaultAuthorsIfEmpty();

  const slug = authorInput.slug?.trim() || slugifyAuthorName(authorInput.name);
  const linkedIn = normalizeLinkedInUrl(authorInput.linkedInUrl);
  const now = new Date().toISOString();
  const normalizedName = authorInput.name.trim().toLowerCase();

  const allAuthors = await db.select().from(authors);
  const duplicateName = allAuthors.find(
    (row) =>
      row.name.trim().toLowerCase() === normalizedName && row.slug !== slug
  );
  if (duplicateName) {
    throw new Error(
      `An author named "${authorInput.name.trim()}" already exists (slug: ${duplicateName.slug}). Edit the existing profile instead.`
    );
  }

  const existing = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1);

  const values = {
    slug,
    name: authorInput.name.trim(),
    role: authorInput.role.trim(),
    bio: authorInput.bio.trim(),
    avatarUrl: authorInput.avatarUrl?.trim() || null,
    linkedInUrl: linkedIn ?? null,
    expertiseTags: normalizeExpertiseInput(authorInput.expertiseTags, {
      name: authorInput.name,
      role: authorInput.role,
      bio: authorInput.bio,
    }),
    updatedAt: now,
  };

  let propagated: AuthorPropagationResult | null = null;

  if (existing[0]) {
    const authorsBeforeRename = allAuthors.map(rowToAuthor);
    propagated = await propagateAuthorNameToCmsContent(
      slug,
      existing[0].name,
      values.name,
      authorsBeforeRename
    );
    await db.update(authors).set(values).where(eq(authors.slug, slug));
  } else {
    await db.insert(authors).values({
      ...values,
      createdAt: now,
    });
  }

  return {
    authors: await getStoredAuthors(),
    propagated,
  };
}

export async function deleteAuthor(slug: string): Promise<BlogAuthor[]> {
  const db = getDb();
  await db.delete(authors).where(eq(authors.slug, slug));
  return getStoredAuthors();
}

export async function getAuthorBySlug(
  slug: string
): Promise<BlogAuthor | undefined> {
  const all = await getStoredAuthors();
  return all.find((a) => a.slug === slug);
}

function eligibleAuthorPool(all: BlogAuthor[]): BlogAuthor[] {
  const pool = all.filter(isEligibleBlogAuthor);
  return pool.length > 0 ? pool : all;
}

export type BlogAuthorPickMode = "rotate" | "expertise" | "random";

/** Default `rotate`: expertise match + skip recent bylines (hybrid). */
export function getBlogAuthorPickMode(): BlogAuthorPickMode {
  const raw = process.env.BLOG_AUTHOR_PICK?.trim().toLowerCase();
  if (raw === "random" || raw === "expertise" || raw === "rotate") {
    return raw;
  }
  return "rotate";
}

export function getBlogAuthorRotateDays(): number {
  const raw = process.env.BLOG_AUTHOR_ROTATE_DAYS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 7;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
}

/** Random CMS author for automation (excludes Taypro Team, Suraj Kadam, etc.). */
export async function pickRandomBlogAuthor(): Promise<BlogAuthor> {
  const all = await getStoredAuthors();
  const pickFrom = eligibleAuthorPool(all);
  if (pickFrom.length === 0) {
    return (
      all[0] ?? {
        name: "Taypro Team",
        slug: "taypro-team",
        role: "Solar Automation Specialists",
        bio: "Editorial team covering solar O&M and robotic cleaning.",
      }
    );
  }
  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}

/** Best-matching byline for keyword + category; hybrid rotation by default. */
export async function pickAuthorForBlogTopic(input: {
  seoKeyword: string;
  category: TopicCategory;
  searchIntent?: string;
}): Promise<BlogAuthor> {
  const mode = getBlogAuthorPickMode();
  const all = await getStoredAuthors();
  const pool = eligibleAuthorPool(all);
  if (pool.length === 0) return pickRandomBlogAuthor();

  if (mode === "random") {
    return pickRandomBlogAuthor();
  }

  const topicTags = mergeTopicTags(
    input.seoKeyword,
    input.category,
    input.searchIntent
  );

  const excludeAuthorNames =
    mode === "rotate"
      ? await listRecentBlogAuthorNames({
          withinDays: getBlogAuthorRotateDays(),
        })
      : undefined;

  const matched = pickBestAuthorForTopicTags(pool, topicTags, {
    excludeAuthorNames,
  });
  return matched ?? pickRandomBlogAuthor();
}

export async function pickRandomBlogAuthorName(): Promise<string> {
  return (await pickRandomBlogAuthor()).name;
}
