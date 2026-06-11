import {
  isCompetitorPrimaryKeyword,
} from "@/lib/seo/competitor-keyword-guard";

/**
 * Shared keyword gates for CSV import, GSC sync, and blog automation.
 *
 * Funnel: panel / inverter / brush / price / manufacturer researchers today
 * → utility O&M and cleaning robots tomorrow. Taypro does not sell modules;
 * content bridges capex research to lifetime plant operations.
 */

/** Terms that indicate solar plant / equipment / O&M intent (broad funnel). */
export const SEO_KEYWORD_RELEVANT =
  /solar|photovoltaic|\bpv\b|panel|module|inverter|string combiner|tracker|racking|mount|brush|clean|robot|maintenance|soil|wash|sprinkler|waterless|automatic|plant|farm|utility|commercial|performance ratio|om\b|o&m|price|cost|manufacturer|supplier|wholesal|equipment|system|power|energy|dry clean|solar washing|module clean|mw\b|bifacial|monocrystalline|polycrystalline/i;

/** Spam, wrong geo, or non-commercial intent — not upstream equipment buyers. */
export const SEO_KEYWORD_EXCLUDE =
  /near me|san diego|sydney|melbourne|austin|tucson|fresno|gold coast|canberra|utah|geelong|central coast|san antonio|los angeles|new york|chicago|houston|phoenix|diy\b|cleaning jobs|cleaning license|gutter and|www solar|student project|pdf download|ppt\b|thesis/i;

export function isRelevantSeoKeyword(keyword: string): boolean {
  return SEO_KEYWORD_RELEVANT.test(keyword);
}

export function isExcludedSeoKeyword(keyword: string): boolean {
  return SEO_KEYWORD_EXCLUDE.test(keyword);
}

export function passesSeoKeywordFilters(keyword: string): boolean {
  return (
    isRelevantSeoKeyword(keyword) &&
    !isExcludedSeoKeyword(keyword) &&
    !isCompetitorPrimaryKeyword(keyword)
  );
}
