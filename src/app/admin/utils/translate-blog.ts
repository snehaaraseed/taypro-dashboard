export type TranslateBlogResponse = {
  success: boolean;
  slug: string;
  type: "blog";
  results: { locale: string; success: boolean; error?: string }[];
};

export async function translateBlogAllLocales(
  slug: string,
  options?: { force?: boolean }
): Promise<TranslateBlogResponse> {
  const res = await fetch(
    `/api/admin/translate/blog/${encodeURIComponent(slug)}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: Boolean(options?.force) }),
    }
  );
  const data = (await res.json()) as TranslateBlogResponse & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Translation failed"
    );
  }
  return data;
}

export function summarizeTranslateBlogResults(data: TranslateBlogResponse): string {
  const ok = data.results.filter((r) => r.success);
  const bad = data.results.filter((r) => !r.success);
  const lines: string[] = [];
  if (ok.length) {
    lines.push(`Success (${ok.length}): ${ok.map((r) => r.locale).join(", ")}`);
  }
  if (bad.length) {
    lines.push(
      `Failed (${bad.length}): ${bad
        .map((r) => `${r.locale}${r.error ? ` — ${r.error}` : ""}`)
        .join("; ")}`
    );
  }
  return lines.join("\n");
}

export type TranslateBlogsBackfillResponse = {
  success: boolean;
  summary: {
    blogs: TranslateBlogResponse[];
    projects: unknown[];
  };
};

export async function translateBlogsBackfill(options?: {
  slugs?: string[];
  force?: boolean;
}): Promise<TranslateBlogsBackfillResponse> {
  const res = await fetch("/api/admin/translate/backfill", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blogs: true,
      projects: false,
      force: Boolean(options?.force),
      ...(options?.slugs?.length ? { slugs: options.slugs } : {}),
    }),
  });
  const data = (await res.json()) as TranslateBlogsBackfillResponse & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Bulk translation failed"
    );
  }
  return data;
}

export function summarizeBlogsBackfillResults(
  data: TranslateBlogsBackfillResponse
): string {
  const blogResults = data.summary.blogs;
  if (!blogResults.length) {
    return "No blogs were processed.";
  }
  const fullyOk = blogResults.filter((b) => b.results.every((r) => r.success));
  const partialOrFailed = blogResults.filter((b) =>
    b.results.some((r) => !r.success)
  );
  const lines: string[] = [
    `Processed ${blogResults.length} blog(s).`,
    `Fully translated: ${fullyOk.length}.`,
  ];
  if (partialOrFailed.length) {
    lines.push(
      `Needs attention (${partialOrFailed.length}):`,
      ...partialOrFailed.map((b) => {
        const failed = b.results.filter((r) => !r.success);
        return `  • ${b.slug}: ${failed.map((r) => r.locale).join(", ")}${failed[0]?.error ? ` (${failed[0].error.slice(0, 80)}…)` : ""}`;
      })
    );
  }
  return lines.join("\n");
}
