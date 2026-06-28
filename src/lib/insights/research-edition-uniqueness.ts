import "server-only";

import {
  extractH2Headings,
  extractKeywords,
  h2OverlapScore,
  jaccardSimilarity,
  stripHtmlToPlainText,
} from "@/lib/seo/blog-similarity";

export type PriorEdition = {
  slug: string;
  title: string;
  content: string;
};

export type EditionUniquenessResult = {
  unique: boolean;
  maxBodySimilarity: number;
  maxH2Overlap: number;
  conflictSlug: string | null;
};

/** Body keyword-overlap above this ⇒ the new edition reads like the old one. */
export function getEditionBodyThreshold(): number {
  const raw = process.env.RESEARCH_EDITION_BODY_THRESHOLD?.trim();
  const parsed = raw ? Number.parseFloat(raw) : 0.5;
  return Number.isFinite(parsed) && parsed > 0 && parsed < 1 ? parsed : 0.5;
}

/** H2 outline overlap above this ⇒ the new edition reuses the old structure. */
export function getEditionH2Threshold(): number {
  const raw = process.env.RESEARCH_EDITION_H2_THRESHOLD?.trim();
  const parsed = raw ? Number.parseFloat(raw) : 0.6;
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 1 ? parsed : 0.6;
}

/**
 * The topic queue rotates annually, so the same topic recurs every 12 months.
 * This guards against the new edition being a near-duplicate of any prior
 * edition of the SAME topic (the grounding context differs each run, but the
 * model can still drift back to the same structure/points).
 */
export function checkEditionUniqueness(
  newContent: string,
  priorEditions: PriorEdition[]
): EditionUniquenessResult {
  if (priorEditions.length === 0) {
    return {
      unique: true,
      maxBodySimilarity: 0,
      maxH2Overlap: 0,
      conflictSlug: null,
    };
  }

  const newKeywords = extractKeywords(stripHtmlToPlainText(newContent));
  const newH2s = extractH2Headings(newContent);

  let maxBodySimilarity = 0;
  let maxH2Overlap = 0;
  let conflictSlug: string | null = null;

  const bodyThreshold = getEditionBodyThreshold();
  const h2Threshold = getEditionH2Threshold();

  for (const prior of priorEditions) {
    const bodySim = jaccardSimilarity(
      newKeywords,
      extractKeywords(stripHtmlToPlainText(prior.content))
    );
    const h2Sim = h2OverlapScore(newH2s, extractH2Headings(prior.content));

    if (bodySim > maxBodySimilarity) maxBodySimilarity = bodySim;
    if (h2Sim > maxH2Overlap) maxH2Overlap = h2Sim;

    if (bodySim > bodyThreshold || h2Sim > h2Threshold) {
      conflictSlug = prior.slug;
    }
  }

  return {
    unique: conflictSlug === null,
    maxBodySimilarity,
    maxH2Overlap,
    conflictSlug,
  };
}

/** Prior-edition H2 outlines, deduped, for steering the planner to a new angle. */
export function priorEditionH2Themes(priorEditions: PriorEdition[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const prior of priorEditions) {
    for (const h2 of extractH2Headings(prior.content)) {
      const key = h2.toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(h2);
    }
  }
  return out.slice(0, 24);
}
