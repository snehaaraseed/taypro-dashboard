import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import type { GscPageQueryRow } from "@/lib/gsc/search-console-client";

export type GscBlogQueriesFile = {
  updatedAt: string;
  siteUrl: string;
  lookbackDays: number;
  /** Blog slug → top GSC queries for that URL (impressions order). */
  bySlug: Record<string, string[]>;
};

function resolveBlogQueriesPath(): string {
  const envPath = process.env.GSC_BLOG_QUERIES_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "gsc-blog-queries.json");
}

function slugFromGscPage(page: string): string | null {
  const match = page.match(/\/blog\/([^/?#]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function buildBlogQueryIndex(
  rows: GscPageQueryRow[]
): Record<string, string[]> {
  const scored = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const slug = slugFromGscPage(row.page);
    if (!slug) continue;
    if (!scored.has(slug)) scored.set(slug, new Map());
    const queries = scored.get(slug)!;
    queries.set(row.query, (queries.get(row.query) ?? 0) + row.impressions);
  }

  const bySlug: Record<string, string[]> = {};
  for (const [slug, queries] of scored) {
    bySlug[slug] = [...queries.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([query]) => query);
  }
  return bySlug;
}

export function writeGscBlogQueriesFile(input: {
  siteUrl: string;
  lookbackDays: number;
  rows: GscPageQueryRow[];
}): string {
  const filePath = resolveBlogQueriesPath();
  const payload: GscBlogQueriesFile = {
    updatedAt: new Date().toISOString(),
    siteUrl: input.siteUrl,
    lookbackDays: input.lookbackDays,
    bySlug: buildBlogQueryIndex(input.rows),
  };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}

let cachedIndex: Record<string, string[]> | null = null;

/** Top GSC queries for a blog slug (from weekly sync file). */
export function loadGscKeywordsForBlogSlug(slug: string): string[] {
  if (!cachedIndex) {
    cachedIndex = {};
    const filePath = resolveBlogQueriesPath();
    if (fs.existsSync(filePath)) {
      try {
        const raw = JSON.parse(
          fs.readFileSync(filePath, "utf8")
        ) as GscBlogQueriesFile;
        cachedIndex = raw.bySlug ?? {};
      } catch {
        cachedIndex = {};
      }
    }
  }
  return cachedIndex[slug.toLowerCase()] ?? [];
}

export function invalidateGscBlogQueriesCache(): void {
  cachedIndex = null;
}
