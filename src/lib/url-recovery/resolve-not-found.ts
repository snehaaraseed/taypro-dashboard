import "server-only";

import type { DynamicBlog } from "@/app/api/blog/list/route";
import type { BlogMetadata } from "@/app/utils/blogFileUtils";
import { listAllBlogs } from "@/lib/cms/blogService";
import { listAllProjects } from "@/lib/cms/projectService";
import { normalizePath } from "@/lib/url-recovery/normalize";
import {
  recoverBlogSlug,
  recoverProjectSlug,
  recoverStaticPath,
} from "@/lib/url-recovery/recover";
import { findSimilarBlogsForMissingSlug } from "@/lib/url-recovery/similar-blogs";
import type { RecoveryResult } from "@/lib/url-recovery/types";

export type NotFoundRecoveryContext = {
  suggestion?: RecoveryResult;
  similarBlogs?: DynamicBlog[];
  currentBlogSlug?: string;
};

function toDynamicBlogs(rows: BlogMetadata[]): DynamicBlog[] {
  return rows.map((metadata) => ({
    ...metadata,
    href: `/blog/${metadata.slug}`,
    source: "db" as const,
  }));
}

/** Resolve optional did-you-mean + similar blogs for a logical pathname. */
export async function resolveNotFoundRecovery(
  logicalPath: string,
  locale: string
): Promise<NotFoundRecoveryContext> {
  const path = normalizePath(logicalPath);
  if (!path || path === "/") return {};

  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    if (!slug || slug.startsWith("author/") || slug.startsWith("db/")) {
      return {};
    }

    const rows = await listAllBlogs(false, locale);
    const blogs = toDynamicBlogs(rows);
    const slugs = rows.map((row) => row.slug);
    const recovery = recoverBlogSlug(slug, slugs);
    const similarBlogs = findSimilarBlogsForMissingSlug(slug, blogs);

    if (recovery.kind === "none" && similarBlogs.length === 0) {
      return {};
    }

    return {
      suggestion: recovery.kind !== "none" ? recovery : undefined,
      similarBlogs,
      currentBlogSlug: slug,
    };
  }

  if (path.startsWith("/projects/")) {
    const slug = path.slice("/projects/".length);
    if (!slug) return {};
    const slugs = (await listAllProjects(false, locale)).map((row) => row.slug);
    const recovery = recoverProjectSlug(slug, slugs);
    return recovery.kind !== "none" ? { suggestion: recovery } : {};
  }

  const recovery = recoverStaticPath(path);
  return recovery.kind !== "none" ? { suggestion: recovery } : {};
}
