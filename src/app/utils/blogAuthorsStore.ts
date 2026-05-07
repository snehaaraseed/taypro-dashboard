import { promises as fs } from "fs";
import path from "path";
import { BLOG_AUTHORS, BlogAuthor, slugifyAuthorName } from "../data/blogAuthors";

const AUTHORS_FILE = path.join(
  process.cwd(),
  "src",
  "app",
  "data",
  "blogAuthors.store.json"
);

async function ensureAuthorsFile(): Promise<void> {
  try {
    await fs.access(AUTHORS_FILE);
  } catch {
    await fs.writeFile(AUTHORS_FILE, JSON.stringify(BLOG_AUTHORS, null, 2), "utf-8");
  }
}

export async function getStoredAuthors(): Promise<BlogAuthor[]> {
  try {
    await ensureAuthorsFile();
    const raw = await fs.readFile(AUTHORS_FILE, "utf-8");
    const authors = JSON.parse(raw) as BlogAuthor[];
    return Array.isArray(authors) ? authors : BLOG_AUTHORS;
  } catch {
    return BLOG_AUTHORS;
  }
}

export async function saveStoredAuthors(authors: BlogAuthor[]): Promise<void> {
  await fs.writeFile(AUTHORS_FILE, JSON.stringify(authors, null, 2), "utf-8");
}

export async function upsertAuthor(
  authorInput: Omit<BlogAuthor, "slug"> & { slug?: string }
): Promise<BlogAuthor[]> {
  const authors = await getStoredAuthors();
  const slug = authorInput.slug?.trim() || slugifyAuthorName(authorInput.name);
  const existingIndex = authors.findIndex((a) => a.slug === slug);
  const nextAuthor: BlogAuthor = {
    name: authorInput.name.trim(),
    slug,
    role: authorInput.role.trim(),
    bio: authorInput.bio.trim(),
    avatarUrl: authorInput.avatarUrl?.trim() || undefined,
  };

  if (existingIndex >= 0) {
    authors[existingIndex] = nextAuthor;
  } else {
    authors.push(nextAuthor);
  }

  await saveStoredAuthors(authors);
  return authors;
}

export async function deleteAuthor(slug: string): Promise<BlogAuthor[]> {
  const authors = await getStoredAuthors();
  const filtered = authors.filter((author) => author.slug !== slug);
  await saveStoredAuthors(filtered);
  return filtered;
}

