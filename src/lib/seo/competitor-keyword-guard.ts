import "server-only";

import { loadCompetitorLandscape } from "@/lib/seo/competitor-knowledge";

const OWN_BRAND =
  /\btaypro\b|taypro\.in|glyde|helyx|nyuma|nectyr|miny|cradyl/i;

let cachedTokens: string[] | null = null;

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function competitorTokens(): string[] {
  if (cachedTokens) return cachedTokens;

  const landscape = loadCompetitorLandscape();
  const tokens = new Set<string>();

  for (const competitor of landscape?.competitors ?? []) {
    for (const raw of [competitor.id, competitor.name]) {
      const normalized = normalizeToken(raw);
      if (normalized.length >= 4) tokens.add(normalized);
      for (const part of normalized.split(/\s+/)) {
        if (part.length >= 4) tokens.add(part);
      }
    }
    if (competitor.website) {
      try {
        const host = new URL(competitor.website).hostname
          .replace(/^www\./, "")
          .split(".")[0];
        const hostNorm = normalizeToken(host);
        if (hostNorm.length >= 4) tokens.add(hostNorm);
      } catch {
        // ignore invalid URLs
      }
    }
  }

  cachedTokens = [...tokens].sort((a, b) => b.length - a.length);
  return cachedTokens;
}

function matchesCompetitorToken(haystack: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

function matchingCompetitorToken(text: string): string | null {
  const normalized = normalizeToken(text);
  if (!normalized || OWN_BRAND.test(normalized)) return null;

  for (const token of competitorTokens()) {
    if (matchesCompetitorToken(normalized, token)) {
      return token;
    }
  }
  return null;
}

/** True when a keyword should not be the primary topic for automated Taypro blogs. */
export function isCompetitorPrimaryKeyword(keyword: string): boolean {
  return matchingCompetitorToken(keyword) !== null;
}

/** True when the title leads with a competitor brand (not a Taypro-led comparison). */
export function isCompetitorLedTitle(title: string): boolean {
  const normalized = normalizeToken(title);
  if (!normalized || OWN_BRAND.test(normalized)) return false;

  const token = matchingCompetitorToken(normalized);
  if (!token) return false;

  const firstWords = normalized.split(/\s+/).slice(0, 3).join(" ");
  return matchesCompetitorToken(firstWords, token);
}

export function competitorPrimaryKeywordReason(keyword: string): string {
  const token = matchingCompetitorToken(keyword);
  return token
    ? `Keyword "${keyword}" is competitor-led (${token}); automation must write Taypro-first content, not competitor product pages.`
    : `Keyword "${keyword}" is competitor-led.`;
}

export function clearCompetitorKeywordGuardCache(): void {
  cachedTokens = null;
}
