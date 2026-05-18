/** Reject buzzword-heavy, vague automation titles and meta lines. */

const GENERIC_TITLE_PATTERNS: RegExp[] = [
  /\bboost\b.+\bwith\b/i,
  /\bai[- ]driven\b/i,
  /\bleverage\b/i,
  /\bunlock\b/i,
  /\bgame[- ]?changer\b/i,
  /\bthe future of\b/i,
  /\btransform(s|ing)?\b.+\bsolar\b/i,
  /\bmaximize your\b/i,
  /\boptimize your\b/i,
  /^how (ai|automation|technology)\b/i,
];

const SPECIFICITY_SIGNAL =
  /robot|brush|waterless|utility|MW|tracker|soiling|frequency|manual|automatic|O&M|plant|cleaning|cost|ROI|India|single-axis|Model[- ]|dry clean|sprinkler|10\s*MW/i;

const GENERIC_DESCRIPTION_PATTERNS: RegExp[] = [
  /^discover how\b/i,
  /^learn how\b/i,
  /^unlock\b/i,
  /^in this (blog|article|post)\b/i,
];

export const ANTI_GENERIC_WRITING_RULES = `TITLE & ANGLE RULES (strict):
- NO vague marketing titles (e.g. "Boost X with AI-Driven Y", "The Future of Solar", "Unlock Peak Performance").
- Each title must name a SPECIFIC problem, method, or comparison (brush vs robot, cleaning every N days, soiling loss %, 10MW plant logistics, tracker farms, waterless vs sprinkler).
- Prefer concrete utility-scale India context: MW plants, O&M leads, asset owners — not generic "solar energy" readers.
- If a primary SEO keyword is provided, include its exact phrase or a very close variant in the title.
- Meta descriptions: start with the specific benefit or question — never "Discover how" or "Learn how".`;

export function isTooGenericTitle(
  title: string,
  seoKeyword?: string
): boolean {
  const t = title.trim();
  if (t.length < 20) return true;
  if (GENERIC_TITLE_PATTERNS.some((p) => p.test(t))) return true;
  if (!SPECIFICITY_SIGNAL.test(t)) return true;
  if (seoKeyword?.trim() && !titleReflectsKeyword(t, seoKeyword)) return true;
  return false;
}

export function isTooGenericDescription(description: string): boolean {
  const d = description.trim();
  if (GENERIC_DESCRIPTION_PATTERNS.some((p) => p.test(d))) return true;
  return false;
}

function titleReflectsKeyword(title: string, keyword: string): boolean {
  const titleLower = title.toLowerCase();
  const kwLower = keyword.toLowerCase().trim();
  if (titleLower.includes(kwLower)) return true;

  const words = kwLower.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const matched = words.filter((w) => titleLower.includes(w)).length;
  return matched >= Math.min(2, words.length);
}
