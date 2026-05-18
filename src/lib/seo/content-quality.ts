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

export const SEO_AND_READER_RULES = `SEO & READER INTENT (every post):
- Write for a real search query: answer what the reader came to decide (compare methods, pick frequency, justify budget, understand soiling impact).
- Match search intent: comparison posts use tables/pros-cons; how-to posts use numbered steps; cost posts reference ROI and link to /solar-panel-cleaning-robot-price-calculator.
- Earn clicks: meta description = specific outcome or question (e.g. "Manual brush vs robot on 50 MW: water, labour, and PR impact").
- Rankings: one clear primary keyword in title + H1 theme; 3–6 related terms in H2s; FAQ-style H2 for "how often / how much / which is better" where natural.
- Make it readable: short paragraphs, real plant scenarios (MW-scale, India dust/coastal/agri soiling), not textbook filler.
- Support money pages with 3–5 internal links; blogs compare/educate — they do not replace product pages.`;

export const LONG_FORM_CONTENT_RULES = `DEPTH & LENGTH (target ~2,800–3,200 words — quality over padding):
- Every section must add a NEW idea: data range, decision criterion, plant scenario, or trade-off — no repeating the intro in different words.
- Structure: 6–10 H2 sections; use H3 subsections where a topic needs steps or sub-comparisons.
- Include at least one of: HTML comparison table (<table>), numbered checklist, or bullet list with specific thresholds (days, %, MW, INR ranges as industry-typical).
- End with an H2 "Frequently asked questions" and 3–4 concise Q&As (<h3> question + <p> answer) tied to the primary keyword.
- Add a short "Key takeaways" or "What plant managers should do next" H2 before the FAQ (4–6 bullets).
- Do NOT inflate word count with generic AI intros, duplicate conclusions, or filler about "the solar industry growing".`;

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

export function isGenericContentError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("too generic");
}
