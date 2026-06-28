import "server-only";

import fs from "fs";
import path from "path";
import { createSlug } from "@/app/utils/blogFileUtils";
import { readPublishedTopics } from "@/lib/cms/topicService";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";

export type EvergreenFallbackEntry = {
  id: string;
  semanticDomain: string;
  intentFamily: SearchIntentFamily;
  subAngle: string;
  primaryKeyword: string;
  title: string;
  description: string;
  h2Outline: string[];
  angleId: string;
  archetype: StructuralArchetype;
  wordCountTier: "narrow" | "standard" | "pillar";
};

export type EvergreenFallbackCatalog = {
  description?: string;
  version?: number;
  entries: EvergreenFallbackEntry[];
};

function resolveCatalogPath(): string {
  const env = process.env.EVERGREEN_FALLBACK_CATALOG_PATH?.trim();
  if (env) return path.resolve(env);
  return path.join(getDeploymentRoot(), "data", "evergreen-fallback-catalog.json");
}

export function loadEvergreenFallbackCatalog(): EvergreenFallbackEntry[] {
  const filePath = resolveCatalogPath();
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as EvergreenFallbackCatalog;
    return Array.isArray(raw.entries) ? raw.entries : [];
  } catch {
    return [];
  }
}

/** Next unused evergreen entry (by slug/title not in published_topics). */
export async function pickNextEvergreenFallback(): Promise<EvergreenFallbackEntry | null> {
  const topics = await readPublishedTopics();
  const published = new Set<string>();
  for (const t of topics) {
    published.add(t.slug.toLowerCase());
    published.add(t.title.toLowerCase().trim());
  }

  for (const entry of loadEvergreenFallbackCatalog()) {
    const slugGuess = createSlug(entry.title);
    if (published.has(slugGuess)) continue;
    if (published.has(entry.title.toLowerCase().trim())) continue;
    return entry;
  }
  return loadEvergreenFallbackCatalog()[0] ?? null;
}

export function evergreenToPlanInput(entry: EvergreenFallbackEntry): {
  keyword: string;
  title: string;
  description: string;
  h2Outline: string[];
  angleId: string;
  slotKey: string;
} {
  return {
    keyword: entry.primaryKeyword,
    title: entry.title,
    description: entry.description,
    h2Outline: entry.h2Outline,
    angleId: entry.angleId,
    slotKey: `evergreen-fallback::${entry.id}`,
  };
}
