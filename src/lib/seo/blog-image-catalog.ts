import "server-only";

import fs from "fs";
import path from "path";
import { listAllBlogs } from "@/lib/cms/blogService";
import { listAllProjects } from "@/lib/cms/projectService";
import { listUploads } from "@/lib/cms/uploadService";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { OG_PRESETS } from "@/lib/seo/open-graph";
import { SOURCE_LOCALE } from "@/lib/translation/config";

export type BlogImageCandidate = {
  url: string;
  label: string;
  source: "product" | "asset" | "project" | "upload";
  tags: string[];
};

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

const ASSET_BLOCKLIST =
  /favicon|logo|spiral|dashboard\.png|logoforwhitebg/i;

const MAX_UPLOAD_CANDIDATES = 120;
const MAX_GEMINI_POOL = 28;

let cachedCandidates: BlogImageCandidate[] | null = null;

function publicPath(...segments: string[]): string {
  return path.join(getDeploymentRoot(), "public", ...segments);
}

function scanPublicDir(
  subdir: string,
  source: BlogImageCandidate["source"],
  tag: string
): BlogImageCandidate[] {
  const dir = publicPath(subdir);
  if (!fs.existsSync(dir)) return [];

  const out: BlogImageCandidate[] = [];
  const walk = (relative: string) => {
    const full = path.join(dir, relative);
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(full, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(rel);
        continue;
      }
      if (!IMAGE_EXT.test(entry.name)) continue;
      const url = `/${subdir}/${rel}`.replace(/\\/g, "/");
      if (ASSET_BLOCKLIST.test(url)) continue;
      const name = entry.name.replace(/[-_]/g, " ").replace(/\.\w+$/, "");
      out.push({
        url,
        label: `${tag}: ${name}`,
        source,
        tags: [tag, name, subdir],
      });
    }
  };
  walk("");
  return out;
}

function productPageCandidates(): BlogImageCandidate[] {
  return Object.entries(OG_PRESETS).map(([key, spec]) => ({
    url: spec.path,
    label: `Product/page preset (${key}): ${spec.alt}`,
    source: "product" as const,
    tags: [key, ...spec.alt.toLowerCase().split(/\s+/).slice(0, 8)],
  }));
}

async function projectCandidates(): Promise<BlogImageCandidate[]> {
  const projects = await listAllProjects(false, SOURCE_LOCALE);
  const seen = new Set<string>();
  const out: BlogImageCandidate[] = [];

  for (const p of projects) {
    const url = p.image?.trim();
    if (!url || !url.startsWith("/") || seen.has(url)) continue;
    seen.add(url);
    out.push({
      url,
      label: `Project case study: ${p.title}`,
      source: "project",
      tags: ["project", p.slug, ...p.title.toLowerCase().split(/\s+/).slice(0, 6)],
    });
  }
  return out;
}

async function uploadCandidates(): Promise<BlogImageCandidate[]> {
  const uploads = await listUploads(MAX_UPLOAD_CANDIDATES);
  return uploads
    .filter((u) => IMAGE_EXT.test(u.url))
    .map((u) => ({
      url: u.url,
      label: `Media library: ${u.name}`,
      source: "upload" as const,
      tags: u.name.toLowerCase().split(/[-_.\s]+/).filter((t) => t.length > 2),
    }));
}

export async function collectBlogImageCandidates(): Promise<BlogImageCandidate[]> {
  if (cachedCandidates) return cachedCandidates;

  const merged: BlogImageCandidate[] = [];
  const seen = new Set<string>();

  const add = (items: BlogImageCandidate[]) => {
    for (const item of items) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      merged.push(item);
    }
  };

  add(productPageCandidates());
  add(scanPublicDir("tayproasset", "asset", "brand asset"));
  add(scanPublicDir("tayprorobots", "product", "product robot"));
  add(await projectCandidates());
  add(await uploadCandidates());

  cachedCandidates = merged;
  return merged;
}

export async function getRecentlyUsedFeaturedImages(
  limit = 25
): Promise<Set<string>> {
  const blogs = await listAllBlogs(true, SOURCE_LOCALE);
  const used = new Set<string>();
  for (const b of blogs.slice(0, limit)) {
    const img = b.featuredImage?.trim();
    if (img) used.add(img);
  }
  return used;
}

function scoreCandidate(
  c: BlogImageCandidate,
  title: string,
  seoKeyword: string
): number {
  const haystack =
    `${c.url} ${c.label} ${c.tags.join(" ")} ${title} ${seoKeyword}`.toLowerCase();
  let score = c.source === "product" ? 3 : c.source === "project" ? 4 : 1;
  const terms = [...seoKeyword.split(/\s+/), ...title.split(/\s+/)]
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 3);
  for (const term of terms) {
    if (haystack.includes(term)) score += 3;
  }
  if (/robot|clean|opex|model|tracker|console|plant|farm|soil|brush|waterless/.test(haystack)) {
    score += 2;
  }
  return score;
}

/** Top candidates for Gemini (diverse sources, keyword-ranked). */
export async function selectCandidatePoolForGemini(
  title: string,
  seoKeyword: string
): Promise<BlogImageCandidate[]> {
  const all = await collectBlogImageCandidates();
  const recent = await getRecentlyUsedFeaturedImages();

  const available = all.filter((c) => !recent.has(c.url));
  const pool = available.length > 0 ? available : all;

  const ranked = [...pool].sort(
    (a, b) =>
      scoreCandidate(b, title, seoKeyword) - scoreCandidate(a, title, seoKeyword)
  );

  const picked: BlogImageCandidate[] = [];
  const seen = new Set<string>();
  const bySource = (s: BlogImageCandidate["source"]) =>
    ranked.filter((c) => c.source === s);

  for (const source of ["project", "product", "asset", "upload"] as const) {
    for (const c of bySource(source)) {
      if (picked.length >= MAX_GEMINI_POOL) break;
      if (seen.has(c.url)) continue;
      seen.add(c.url);
      picked.push(c);
    }
  }

  for (const c of ranked) {
    if (picked.length >= MAX_GEMINI_POOL) break;
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    picked.push(c);
  }

  return picked;
}

export function keywordFallbackImage(
  seoKeyword: string,
  pool: BlogImageCandidate[]
): BlogImageCandidate | null {
  const k = seoKeyword.toLowerCase();
  const rules: Array<{ test: RegExp; match: RegExp }> = [
    { test: /model-t|tracker/, match: /modelt|model-t|tracker/i },
    { test: /model-b|semi/, match: /modelb|model-b|semi/i },
    { test: /model-a|automatic/, match: /modela|model-a|automatic/i },
    { test: /opex|service/, match: /opex|service/i },
    { test: /console|monitor/, match: /console|dashboard/i },
    { test: /brush|manual/, match: /robot|clean|feature/i },
    { test: /project|plant|farm/, match: /project|farm|plant/i },
  ];

  for (const rule of rules) {
    if (!rule.test.test(k)) continue;
    const hit = pool.find((c) => rule.match.test(`${c.url} ${c.label}`));
    if (hit) return hit;
  }

  return (
    pool.find((c) => /robotimage|robot-feature|robots\.png/i.test(c.url)) ??
    pool[0] ??
    null
  );
}
