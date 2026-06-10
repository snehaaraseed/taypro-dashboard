/**
 * Merge runtime 404 logs + GSC not-found feed into redirect candidates.
 * Run: npm run seo:merge-404-candidates
 *
 * GSC data comes from weekly sync (data/gsc-not-found-pages.json).
 * Promote high-confidence rows to next.config.ts after review.
 */
import fs from "node:fs";
import path from "node:path";
import {
  recoverBlogSlug,
  recoverProjectSlug,
  recoverStaticPath,
} from "../src/lib/url-recovery/recover";
import { normalizePath } from "../src/lib/url-recovery/normalize";

const ROOT = process.cwd();
const HITS_PATH = path.join(ROOT, "data/404-hits.json");
const GSC_PATH = path.join(ROOT, "data/gsc-not-found-pages.json");
const CORPUS_PATH = path.join(ROOT, "data/seo-corpus-index.json");
const OUT_PATH = path.join(ROOT, "data/redirect-candidates.json");
const MIN_HITS = Number(process.env.URL_RECOVERY_MIN_HITS ?? 5);
const MIN_GSC_IMPRESSIONS = Number(process.env.URL_RECOVERY_MIN_GSC_IMPRESSIONS ?? 3);

type CandidateRow = {
  source: string;
  destination: string;
  runtimeHits: number;
  gscImpressions: number;
  gscClicks: number;
  gscSource?: string;
  pageFetchState?: string;
  score: number;
  autoPromote: boolean;
  note: string;
};

function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function loadBlogSlugs(): string[] {
  const corpus = readJson<{ entries?: { slug: string }[] }>(CORPUS_PATH, {});
  return (corpus.entries ?? []).map((entry) => entry.slug).filter(Boolean);
}

function suggestTarget(
  pathname: string,
  blogSlugs: string[],
  existing?: string
): string | undefined {
  if (existing) return existing;

  const path = normalizePath(pathname);
  const staticRecovery = recoverStaticPath(path);
  if (staticRecovery.kind === "redirect" || staticRecovery.kind === "suggest") {
    return staticRecovery.destination;
  }

  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length);
    const recovery = recoverBlogSlug(slug, blogSlugs);
    if (recovery.kind !== "none") return recovery.destination;
  }

  if (path.startsWith("/projects/")) {
    const slug = path.slice("/projects/".length);
    const recovery = recoverProjectSlug(slug, []);
    if (recovery.kind !== "none") return recovery.destination;
  }

  return undefined;
}

function scoreCandidate(row: {
  runtimeHits: number;
  gscImpressions: number;
  gscClicks: number;
}): number {
  return row.runtimeHits * 5 + row.gscImpressions + row.gscClicks * 2;
}

const blogSlugs = loadBlogSlugs();
const merged = new Map<string, CandidateRow>();

const hitsFile = readJson<{
  hits?: Record<
    string,
    {
      path: string;
      count: number;
      suggestedTarget?: string;
    }
  >;
}>(HITS_PATH, { hits: {} });

for (const hit of Object.values(hitsFile.hits ?? {})) {
  const pathname = normalizePath(hit.path);
  const destination = suggestTarget(pathname, blogSlugs, hit.suggestedTarget);
  if (!destination) continue;

  merged.set(pathname, {
    source: pathname,
    destination,
    runtimeHits: hit.count,
    gscImpressions: 0,
    gscClicks: 0,
    score: 0,
    autoPromote: false,
    note: "",
  });
}

const gscFile = readJson<{
  pages?: Array<{
    pathname: string;
    source: string;
    impressions: number;
    clicks: number;
    runtimeHits: number;
    pageFetchState?: string;
  }>;
}>(GSC_PATH, { pages: [] });

for (const page of gscFile.pages ?? []) {
  const pathname = normalizePath(page.pathname);
  const destination = suggestTarget(pathname, blogSlugs);
  if (!destination) continue;

  const existing = merged.get(pathname);
  const runtimeHits = Math.max(existing?.runtimeHits ?? 0, page.runtimeHits ?? 0);
  const gscImpressions = Math.max(
    existing?.gscImpressions ?? 0,
    page.impressions ?? 0
  );
  const gscClicks = Math.max(existing?.gscClicks ?? 0, page.clicks ?? 0);

  merged.set(pathname, {
    source: pathname,
    destination,
    runtimeHits,
    gscImpressions,
    gscClicks,
    gscSource: page.source,
    pageFetchState: page.pageFetchState,
    score: 0,
    autoPromote: false,
    note: "",
  });
}

const candidates = [...merged.values()]
  .map((row) => {
    const score = scoreCandidate(row);
    const qualifies =
      row.runtimeHits >= MIN_HITS ||
      row.gscImpressions >= MIN_GSC_IMPRESSIONS ||
      score >= MIN_HITS * 5;
    const autoPromote =
      row.runtimeHits >= MIN_HITS * 2 ||
      (row.gscImpressions >= MIN_GSC_IMPRESSIONS * 3 && Boolean(row.pageFetchState));

    let note = "Review before promoting to permanent 301";
    if (autoPromote) {
      note = "High traffic (runtime or GSC) — safe to add as 301 in next.config.ts";
    } else if (!qualifies) {
      note = "Low traffic — monitor only";
    }

    return {
      ...row,
      score,
      autoPromote: autoPromote && qualifies,
      note,
      qualifies,
    };
  })
  .filter((row) => row.qualifies)
  .sort((a, b) => b.score - a.score)
  .map(({ qualifies: _q, ...row }) => row);

const payload = {
  description:
    "404 redirect candidates from runtime logs + GSC not-found sync. Promote autoPromote rows to next.config.ts.",
  updatedAt: new Date().toISOString(),
  minRuntimeHits: MIN_HITS,
  minGscImpressions: MIN_GSC_IMPRESSIONS,
  gscFeedLoaded: fs.existsSync(GSC_PATH),
  candidateCount: candidates.length,
  candidates,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Wrote ${candidates.length} redirect candidate(s) → ${path.relative(ROOT, OUT_PATH)}`
);
console.log(
  `  Sources: runtime=${Object.keys(hitsFile.hits ?? {}).length}, gsc=${gscFile.pages?.length ?? 0}`
);
for (const row of candidates.slice(0, 10)) {
  console.log(
    `  score=${row.score} ${row.source} → ${row.destination} (hits=${row.runtimeHits}, gsc imp=${row.gscImpressions})`
  );
}
