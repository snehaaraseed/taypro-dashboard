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
- Rankings: one clear primary keyword in title + H1 theme; 3–6 related terms in H2s; cover "how often / how much / which is better" in body sections and in the separate faqs array.
- Make it readable: short paragraphs, real plant scenarios (MW-scale, India dust/coastal/agri soiling), not textbook filler.
- Support related content with ≥2 /blog/ cross-links plus optional pillar pages when the post is about cleaning/O&M (validator enforced); do not pitch robots on equipment-only posts.`;

export const AI_OVERVIEW_SNIPPET_RULES = `AI OVERVIEW & FEATURED SNIPPET (strict):
- Opening: the first <p> after a brief intro (1–2 sentences max) must be 2–3 sentences that directly answer the title question. No filler, no "the solar industry is growing".
- Include one H2 titled "Quick answer" or "Summary for plant managers" with a <ul> of 3–5 bullets: specific ranges (days, %, MW, INR as industry-typical) and a clear decision outcome.
- Include at least one other H2 phrased as a natural question (People Also Ask style, e.g. "How often should you clean solar panels on a 50 MW plant?") with a direct-answer <p> immediately below. Do NOT use a "Frequently asked questions" heading in the HTML body.
- FAQ JSON: the first faqs[0] question must phrase the primary keyword as a question; its answer must align with the Quick answer bullets (same facts, not contradictory).
- For Taypro fleet/impact use PUBLIC PROOF POINTS only; for industry data use "typical range" language, never invent study, report, or university names.`;

/** Structure-only fallback; prefer formatLongFormWordCountRules() with a resolved tier policy. */
export const LONG_FORM_CONTENT_RULES = `DEPTH & LENGTH (tier applied at generation: pillar 1800+, standard 1200+, narrow 900+ words):
- Every section must add a NEW idea: data range, decision criterion, plant scenario, or trade-off, no repeating the intro in different words.
- Structure: 6–10 H2 sections including "Quick answer" (or "Summary for plant managers") and one question-shaped H2 with a direct answer paragraph; use H3 subsections where a topic needs steps or sub-comparisons.
- Include at least one of: HTML comparison table (<table> with <thead>), numbered checklist, or bullet list with specific thresholds (days, %, MW, INR ranges as industry-typical). Comparison-intent posts MUST include an HTML <table>.
- Do NOT put a "Frequently asked questions" heading or FAQ list in the HTML body; Q&A for schema lives only in the JSON "faqs" array.
- End the article with a short "Key takeaways" or "What plant managers should do next" H2 (4–6 bullets), no FAQ heading in content.
- Do NOT inflate word count with generic AI intros, duplicate conclusions, or filler about "the solar industry growing".`;

export const PUNCTUATION_RULES = `PUNCTUATION (strict):
- Do NOT use em dashes (Unicode U+2014, the long dash character) anywhere in title, description, content, FAQs, or topic titles.
- Use commas, periods, colons, semicolons, or parentheses to join clauses (never the long em dash character).
- Regular hyphens (-) in compound adjectives and en dashes in numeric ranges (3–10 MW) are fine.`;

/** Replace em dashes in Gemini output when the model ignores prompt rules. */
export function sanitizeEmDash(text: string): string {
  return text.replace(/\s*\u2014\s*/g, ", ");
}

export const ANTI_GENERIC_WRITING_RULES = `TITLE & ANGLE RULES (strict):
- NO vague marketing titles (e.g. "Boost X with AI-Driven Y", "The Future of Solar", "Unlock Peak Performance").
- Each title must name a SPECIFIC problem, method, or comparison (brush vs robot, cleaning every N days, soiling loss %, 10MW plant logistics, tracker farms, waterless vs sprinkler).
- Prefer concrete utility-scale India context: MW plants, O&M leads, asset owners, not generic "solar energy" readers.
- If a primary SEO keyword is provided, include its exact phrase or a very close variant in the title.
- Meta descriptions: start with the specific benefit or question, never "Discover how" or "Learn how".`;

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

export type GenerationFailureKind =
  | "quota"
  | "new_contract"
  | "in_place"
  | "fatal";

import { isGroundingQuotaError } from "@/lib/gemini/grounding-config";

export function isGeminiQuotaErrorMessage(error: unknown): boolean {
  if (isGroundingQuotaError(error)) return false;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("quota exceeded") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("free-tier quota")
  );
}

export function classifyGenerationFailure(error: unknown): GenerationFailureKind {
  if (isGeminiQuotaErrorMessage(error)) return "quota";
  const msg = error instanceof Error ? error.message : String(error);

  if (
    msg.includes("No unique title for coverage slot") ||
    msg.includes("Pre-flight uniqueness failed") ||
    msg.includes("Outline too similar") ||
    msg.includes("Blog too similar") ||
    msg.includes("too similar") ||
    msg.includes("already covered by existing post") ||
    msg.includes("Topic already published") ||
    msg.includes("Blog structure validation failed") ||
    msg.includes("Generated title or meta description was too generic")
  ) {
    return "new_contract";
  }

  if (
    msg.includes("Body too short") ||
    msg.includes("Could not parse JSON") ||
    msg.includes("JSON at position") ||
    msg.includes("Could not parse section HTML") ||
    msg.includes("Could not parse outline JSON") ||
    msg.includes("Section writer produced incomplete article") ||
    msg.includes("Bad control character")
  ) {
    return "in_place";
  }

  if (isGenericContentError(error)) return "new_contract";

  return "fatal";
}

/** Optional dev/staging safety cap. Unset = retry with new topics until Gemini quota. */
export function getBlogPipelineMaxOuterAttempts(): number | null {
  const raw = process.env.BLOG_PIPELINE_MAX_OUTER_ATTEMPTS?.trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getBlogPipelineMaxInPlaceExpansions(): number {
  const raw = process.env.BLOG_PIPELINE_MAX_INPLACE_EXPANSIONS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 4;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
}

/** @deprecated Use classifyGenerationFailure for typed retries. */
export function isRetryableGenerationError(error: unknown): boolean {
  const kind = classifyGenerationFailure(error);
  return kind === "new_contract" || kind === "in_place";
}
