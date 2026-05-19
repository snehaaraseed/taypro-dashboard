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

function rowToAuthor(row: typeof authors.$inferSelect): BlogAuthor {
  return {
    name: row.name,
    slug: row.slug,
    role: row.role,
    bio: row.bio,
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
    await db.insert(authors).values({
      slug: author.slug,
      name: author.name,
      role: author.role,
      bio: author.bio,
      avatarUrl: author.avatarUrl ?? null,
      linkedInUrl: author.linkedInUrl ?? null,
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

export async function upsertAuthor(
  authorInput: Omit<BlogAuthor, "slug"> & { slug?: string }
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
