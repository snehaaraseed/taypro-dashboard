import "server-only";

import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { authors } from "@/lib/db/schema";
import {
  BLOG_AUTHORS,
  BlogAuthor,
  slugifyAuthorName,
  normalizeLinkedInUrl,
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

export async function upsertAuthor(
  authorInput: Omit<BlogAuthor, "slug"> & {
    slug?: string;
    expertiseTags?: BlogAuthorExpertiseTag[];
  }
): Promise<BlogAuthor[]> {
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

  if (existing[0]) {
    await db.update(authors).set(values).where(eq(authors.slug, slug));
  } else {
    await db.insert(authors).values({
      ...values,
      createdAt: now,
    });
  }

  return getStoredAuthors();
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
