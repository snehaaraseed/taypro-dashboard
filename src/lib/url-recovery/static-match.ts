import { STATIC_SITEMAP_ROUTES } from "@/lib/seo/sitemap-config";
import {
  AMBIGUITY_SCORE_GAP,
  MIN_REDIRECT_SCORE,
  RECOVERY_BLOCKLIST,
} from "@/lib/url-recovery/constants";
import { resolveAlias } from "@/lib/url-recovery/aliases";
import { levenshteinDistance } from "@/lib/url-recovery/levenshtein";
import { normalizePath } from "@/lib/url-recovery/normalize";
import type { RecoveryResult } from "@/lib/url-recovery/types";

const STATIC_PATHS = STATIC_SITEMAP_ROUTES.map((route) =>
  normalizePath(route.path)
);

export function isRecoveryBlocked(path: string): boolean {
  const normalized = normalizePath(path);
  return RECOVERY_BLOCKLIST.some((pattern) => pattern.test(normalized));
}

function scoreStaticPath(input: string, candidate: string): number {
  const a = normalizePath(input);
  const b = normalizePath(candidate);
  if (a === b) return 1;

  const aParts = a.split("/").filter(Boolean);
  const bParts = b.split("/").filter(Boolean);

  if (aParts.length === 1 && bParts.length === 1) {
    const aWord = aParts[0]!;
    const bWord = bParts[0]!;
    const dist = levenshteinDistance(aWord, bWord);
    const maxLen = Math.max(aWord.length, bWord.length);
    if (maxLen <= 3 || dist > 2) return 0;
    if (dist === 0) return 1;
    if (maxLen <= 12 && dist === 1) return 0.94;
    if (maxLen <= 12 && dist === 2) return 0.88;
    return 1 - dist / maxLen;
  }

  if (aParts.length !== bParts.length) return 0;

  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  const maxAllowed = maxLen > 50 ? 4 : maxLen > 30 ? 3 : 2;
  if (dist > maxAllowed) return 0;
  return 1 - dist / maxLen;
}

/** Recover a mistyped static marketing path (not blog/project CMS slugs). */
export function recoverStaticPath(path: string): RecoveryResult {
  const normalized = normalizePath(path);
  if (normalized === "/" || isRecoveryBlocked(normalized)) {
    return { kind: "none" };
  }

  if (STATIC_PATHS.includes(normalized)) {
    const needsNormalization =
      path.includes("_") ||
      path !== path.toLowerCase() ||
      (path.length > 1 && path.endsWith("/"));
    if (needsNormalization) {
      return {
        kind: "redirect",
        destination: normalized,
        reason: "normalization",
        score: 1,
      };
    }
    return { kind: "none" };
  }

  const alias = resolveAlias(normalized);
  if (alias && alias !== normalized) {
    return {
      kind: "redirect",
      destination: alias,
      reason: "alias",
      score: 1,
    };
  }

  const scored = STATIC_PATHS.filter((candidate) => candidate !== normalized)
    .map((candidate) => ({
      candidate,
      score: scoreStaticPath(normalized, candidate),
    }))
    .filter((row) => row.score >= MIN_REDIRECT_SCORE)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { kind: "none" };

  const best = scored[0]!;
  const second = scored[1];
  if (second && best.score - second.score < AMBIGUITY_SCORE_GAP) {
    return {
      kind: "suggest",
      destination: best.candidate,
      reason: "static-fuzzy",
      score: best.score,
    };
  }

  return {
    kind: "redirect",
    destination: best.candidate,
    reason: "static-fuzzy",
    score: best.score,
  };
}
