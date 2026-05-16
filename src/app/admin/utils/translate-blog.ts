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
