import type { BlogAuthorExpertiseTag } from "@/lib/cms/blog-author-expertise-ids";

export interface BlogAuthor {
  name: string;
  slug: string;
  role: string;
  bio: string;
  /** CMS expertise lanes for blog automation (see BLOG_AUTHOR_EXPERTISE_TAGS). */
  expertiseTags?: BlogAuthorExpertiseTag[];
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
    bio: "The Taypro editorial team covers utility-scale solar O&M, waterless robotic cleaning, fleet software, and plant performance for IPPs and EPC teams across India. Our writers draw on field data from 150+ live robot deployments, 5 GW+ of monitored cleaning capacity, and Taypro's Made-in-India manufacturing in Chakan, Pune.",
    expertiseTags: ["industry-trends", "robot-products"],
    avatarUrl:
      "https://ui-avatars.com/api/?name=Taypro+Team&background=052638&color=ffffff&size=256",
  },
  {
    name: "Yogesh",
    slug: "yogesh",
    role: "Product & Growth",
    bio: "Yogesh leads product and growth at Taypro, where he works with utility asset owners on robotic cleaning ROI, deployment planning, and fleet operations. He writes about waterless O&M, CAPEX vs Opex models, and how Indian MW-scale plants recover yield with GLYDE, NYUMA, and NECTYR.",
    expertiseTags: ["roi-cost", "robot-products", "industry-trends"],
    linkedInUrl: "https://www.linkedin.com/company/taypro",
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
 * Prefer stored authors (by name); slug is kept in sync when names are edited in admin.
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

const AUTHOR_AVATAR_BACKGROUNDS = [
  "052638",
  "0c3c57",
  "1a4d63",
  "2a6578",
  "356f7f",
  "447a8f",
  "5b8499",
  "6d93a8",
  "7fa2b6",
  "91b1c4",
] as const;

function avatarBackgroundForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash + slug.charCodeAt(i) * (i + 1)) % 997;
  }
  return AUTHOR_AVATAR_BACKGROUNDS[hash % AUTHOR_AVATAR_BACKGROUNDS.length];
}

/** Default initials avatar when no upload is stored in CMS. */
export function getDefaultAuthorAvatarUrl(name: string, slug?: string): string {
  const encodedName = encodeURIComponent(name || "Author");
  const bg = slug ? avatarBackgroundForSlug(slug) : "4b5563";
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${bg}&color=ffffff&size=256`;
}

export function getAuthorAvatarUrl(name: string): string {
  const knownAuthor = getAuthorByName(name);
  if (knownAuthor?.avatarUrl) {
    return knownAuthor.avatarUrl;
  }

  return getDefaultAuthorAvatarUrl(name);
}

