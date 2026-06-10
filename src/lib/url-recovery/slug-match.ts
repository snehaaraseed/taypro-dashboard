import {
  AMBIGUITY_SCORE_GAP,
  MIN_REDIRECT_SCORE,
} from "@/lib/url-recovery/constants";
import { levenshteinDistance } from "@/lib/url-recovery/levenshtein";
import { normalizeSlug } from "@/lib/url-recovery/normalize";
import type { RecoveryResult } from "@/lib/url-recovery/types";

function maxEditDistance(length: number): number {
  if (length > 40) return 3;
  if (length > 20) return 2;
  return 1;
}

/** Score similarity between a mistyped slug and a published slug (0–1). */
export function scoreSlugSimilarity(input: string, candidate: string): number {
  const a = normalizeSlug(input);
  const b = normalizeSlug(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;

  if (b.startsWith(a) && a.length >= 16) {
    const ratio = a.length / b.length;
    if (ratio >= 0.72) return 0.9 + ratio * 0.1;
  }

  if (a.startsWith(b) && b.length >= 16) {
    const ratio = b.length / a.length;
    if (ratio >= 0.72) return 0.88 + ratio * 0.1;
  }

  const maxLen = Math.max(a.length, b.length);
  const dist = levenshteinDistance(a, b);
  if (dist > maxEditDistance(maxLen)) return 0;
  return 1 - dist / maxLen;
}

export function findClosestSlug(
  input: string,
  candidates: string[],
  options?: { minScore?: number }
): RecoveryResult {
  const minScore = options?.minScore ?? MIN_REDIRECT_SCORE;
  const unique = [...new Set(candidates.map(normalizeSlug).filter(Boolean))];
  const inputNorm = normalizeSlug(input);
  if (!inputNorm) return { kind: "none" };

  const scored = unique
    .filter((slug) => slug !== inputNorm)
    .map((slug) => ({
      slug,
      score: scoreSlugSimilarity(inputNorm, slug),
    }))
    .filter((row) => row.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { kind: "none" };

  const best = scored[0]!;
  const second = scored[1];
  if (second && best.score - second.score < AMBIGUITY_SCORE_GAP) {
    return {
      kind: "suggest",
      destination: best.slug,
      reason: best.score >= 0.9 ? "prefix" : "fuzzy",
      score: best.score,
    };
  }

  return {
    kind: "redirect",
    destination: best.slug,
    reason: best.score >= 0.9 ? "prefix" : "fuzzy",
    score: best.score,
  };
}
