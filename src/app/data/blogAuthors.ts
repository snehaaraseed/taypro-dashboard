export interface BlogAuthor {
  name: string;
  slug: string;
  role: string;
  bio: string;
  /** Profile image URL (e.g. from site upload). */
  avatarUrl?: string;
  /** Full LinkedIn profile URL (https only, linkedin.com host). */
  linkedInUrl?: string;
}

/**
 * Accepts a full URL or pasted path; returns a normalized https URL or undefined if invalid.
 */
export function normalizeLinkedInUrl(
  input: string | undefined | null
): string | undefined {
  if (!input?.trim()) return undefined;
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return undefined;
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host.endsWith("linkedin.com")) return undefined;
    u.hash = "";
    return u.toString();
  } catch {
    return undefined;
  }
}

export const BLOG_AUTHORS: BlogAuthor[] = [
  {
    name: "Taypro Team",
    slug: "taypro-team",
    role: "Solar Automation Specialists",
    bio: "The Taypro editorial team writes about solar operations, robotic cleaning systems, plant efficiency, and maintenance best practices.",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Taypro+Team&background=052638&color=ffffff&size=256",
  },
  {
    name: "Yogesh",
    slug: "yogesh",
    role: "Product & Growth",
    bio: "Yogesh shares practical insights on solar technology adoption, product strategy, and performance optimization in utility-scale projects.",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Yogesh&background=0c3c57&color=ffffff&size=256",
  },
];

export function slugifyAuthorName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeAuthorName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Maps a blog's free-text author field to the canonical author slug.
 * Prefer stored authors (by name) so profile URLs stay stable when slug !== slugify(name).
 */
export function resolveAuthorSlug(
  authorName: string,
  storedAuthors: BlogAuthor[]
): string {
  const normalized = normalizeAuthorName(authorName || "Taypro Team");
  const byName = storedAuthors.find(
    (author) => normalizeAuthorName(author.name) === normalized
  );
  if (byName) return byName.slug;
  return slugifyAuthorName(authorName || "Taypro Team");
}

export function getAuthorByName(name: string): BlogAuthor | undefined {
  const normalizedName = name.trim().toLowerCase();
  return BLOG_AUTHORS.find((author) => author.name.toLowerCase() === normalizedName);
}

export function getAuthorBySlug(slug: string): BlogAuthor | undefined {
  return BLOG_AUTHORS.find((author) => author.slug === slug);
}

export function getAuthorAvatarUrl(name: string): string {
  const knownAuthor = getAuthorByName(name);
  if (knownAuthor?.avatarUrl) {
    return knownAuthor.avatarUrl;
  }

  const encodedName = encodeURIComponent(name || "Author");
  return `https://ui-avatars.com/api/?name=${encodedName}&background=4b5563&color=ffffff&size=256`;
}

