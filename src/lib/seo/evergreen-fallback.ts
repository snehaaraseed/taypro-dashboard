import "server-only";

import fs from "fs";
import path from "path";
import { createSlug } from "@/app/utils/blogFileUtils";
import { isTopicPublished } from "@/lib/cms/topicService";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import type { BlogUniquenessContext } from "@/lib/seo/blog-plan-gates";
import { preFlightUniquenessProbe } from "@/lib/seo/blog-preflight-gates";
import { titlesTooSimilar } from "@/lib/seo/blog-similarity";
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

/** Next unused evergreen entry that passes title + pre-flight corpus checks. */
export type PickEvergreenOptions = {
  rejectedSlotKeys?: string[];
  rejectedTitles?: string[];
  uniquenessCtx?: BlogUniquenessContext;
};

export async function pickNextEvergreenFallback(
  options?: PickEvergreenOptions
): Promise<EvergreenFallbackEntry | null> {
  const rejectedSlots = new Set(options?.rejectedSlotKeys ?? []);
  const rejectedTitles = options?.rejectedTitles ?? [];
  const ctx = options?.uniquenessCtx;

  // Entries that clear exact/near-duplicate guards (title, slug, description vs
  // published corpus, plus this run's rejects). These are always safe to publish.
  const eligible: EvergreenFallbackEntry[] = [];
  for (const entry of loadEvergreenFallbackCatalog()) {
    const plan = evergreenToPlanInput(entry);
    if (rejectedSlots.has(plan.slotKey)) continue;
    if (rejectedTitles.some((t) => titlesTooSimilar(t, entry.title))) continue;

    const slug = createSlug(entry.title);
    if (await isTopicPublished(entry.title, slug, entry.description)) continue;

    eligible.push(entry);
  }

  if (eligible.length === 0) return null;

  // Pass 1 (preferred): favour the entry that also clears the strict semantic
  // probe so normal days publish the most distinct topic available.
  if (ctx) {
    for (const entry of eligible) {
      const match = await preFlightUniquenessProbe(
        {
          title: entry.title,
          description: entry.description,
          h2Outline: entry.h2Outline,
          slug: createSlug(entry.title),
        },
        ctx,
        ctx.corpus
      );
      if (!match) return entry;
    }
  }

  // Pass 2 (guaranteed): the semantic probe rejected everything, but this is the
  // daily safety net, so publish the first exact-unique curated entry rather than
  // let the day pass with no blog. Curated titles are already distinct topics.
  return eligible[0];
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
