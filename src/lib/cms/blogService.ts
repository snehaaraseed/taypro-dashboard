import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogs } from "@/lib/db/schema";
import type { BlogData, BlogMetadata } from "@/app/utils/blogFileUtils";

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function rowToMetadata(row: typeof blogs.$inferSelect): BlogMetadata {
  return {
    title: row.title,
    description: row.description,
    featuredImage: row.featuredImage,
    author: row.author,
    slug: row.slug,
    publishDate: row.publishDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? undefined,
    published: row.published,
  };
}

export async function listAllBlogs(includeDrafts = false): Promise<BlogMetadata[]> {
  const db = getDb();
  const rows = await db.select().from(blogs);
  return rows
    .filter((r) => includeDrafts || r.published !== false)
    .map(rowToMetadata)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
}

export async function listPublishedBlogSlugs(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ slug: blogs.slug })
    .from(blogs)
    .where(eq(blogs.published, true));
  return rows.map((r) => r.slug);
}

export async function getBlogBySlug(
  slug: string,
  options?: { includeDraft?: boolean }
): Promise<{ metadata: BlogMetadata; content: string } | null> {
  const db = getDb();
  const rows = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!options?.includeDraft && row.published === false) return null;
  return {
    metadata: rowToMetadata(row),
    content: row.content,
  };
}

export async function createBlog(
  blogData: BlogData,
  slug?: string
): Promise<{
  success: boolean;
  slug: string;
  updatedAt?: string;
  error?: string;
}> {
  try {
    const finalSlug = slug || createSlug(blogData.title);
    const db = getDb();
    const existing = await db
      .select({ id: blogs.id })
      .from(blogs)
      .where(eq(blogs.slug, finalSlug))
      .limit(1);
    if (existing.length > 0) {
      return {
        success: false,
        slug: finalSlug,
        error: `Blog with slug "${finalSlug}" already exists`,
      };
    }

    const now = new Date().toISOString();
    await db.insert(blogs).values({
      slug: finalSlug,
      title: blogData.title,
      description: blogData.description,
      featuredImage: blogData.featuredImage || "",
      author: blogData.author || "Taypro Team",
      content: blogData.content || "",
      publishDate: blogData.publishDate || now,
      createdAt: now,
      updatedAt: now,
      published: blogData.published !== undefined ? blogData.published : true,
    });

    return { success: true, slug: finalSlug, updatedAt: now };
  } catch (error) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      slug: slug || createSlug(blogData.title),
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBlog(
  oldSlug: string,
  blogData: BlogData,
  newSlug?: string
): Promise<{
  success: boolean;
  slug: string;
  updatedAt?: string;
  error?: string;
}> {
  try {
    const db = getDb();
    const existingRows = await db
      .select()
      .from(blogs)
      .where(eq(blogs.slug, oldSlug))
      .limit(1);
    const existing = existingRows[0];
    if (!existing) {
      return {
        success: false,
        slug: oldSlug,
        error: `Blog with slug "${oldSlug}" does not exist`,
      };
    }

    const finalSlug = newSlug || oldSlug;
    if (finalSlug !== oldSlug) {
      const conflict = await db
        .select({ id: blogs.id })
        .from(blogs)
        .where(eq(blogs.slug, finalSlug))
        .limit(1);
      if (conflict.length > 0) {
        return {
          success: false,
          slug: finalSlug,
          error: `Blog with slug "${finalSlug}" already exists`,
        };
      }
    }

    const now = new Date().toISOString();
    await db
      .update(blogs)
      .set({
        slug: finalSlug,
        title: blogData.title,
        description: blogData.description,
        featuredImage: blogData.featuredImage || "",
        author: blogData.author || "Taypro Team",
        content: blogData.content || "",
        publishDate: blogData.publishDate || existing.publishDate,
        updatedAt: now,
        published:
          blogData.published !== undefined
            ? blogData.published
            : existing.published,
      })
      .where(eq(blogs.slug, oldSlug));

    return { success: true, slug: finalSlug, updatedAt: now };
  } catch (error) {
    console.error("Error updating blog:", error);
    return {
      success: false,
      slug: newSlug || oldSlug,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteBlog(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    const existing = await db
      .select({ id: blogs.id })
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);
    if (existing.length === 0) {
      return {
        success: false,
        error: `Blog with slug "${slug}" does not exist`,
      };
    }
    await db.delete(blogs).where(eq(blogs.slug, slug));
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function readBlogMetadata(
  slug: string
): Promise<{ success: boolean; metadata?: BlogMetadata; error?: string }> {
  const post = await getBlogBySlug(slug, { includeDraft: true });
  if (!post) {
    return { success: false, error: "Blog not found" };
  }
  return { success: true, metadata: post.metadata };
}

export async function readBlogContent(
  slug: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const post = await getBlogBySlug(slug, { includeDraft: true });
  if (!post) {
    return { success: false, error: "Blog not found" };
  }
  return { success: true, content: post.content };
}
