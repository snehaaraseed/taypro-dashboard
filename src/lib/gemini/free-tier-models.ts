/**
 * Google AI Studio free-tier text models only.
 * Do not add Pro/Ultra/Imagen or other billing-required IDs here.
 */

export const DEFAULT_FREE_GEMINI_TEXT_MODEL = "gemini-3.1-flash-lite";

/** Alternate free ID on the same tier (useful on retry without paid models). */
export const FREE_GEMINI_TEXT_MODEL_RETRY = "gemini-3.1-flash-lite-preview";

const FREE_GEMINI_TEXT_MODEL_SET = new Set<string>([
  DEFAULT_FREE_GEMINI_TEXT_MODEL,
  FREE_GEMINI_TEXT_MODEL_RETRY,
  "gemini-2.0-flash-lite",
]);

/** Substrings that usually indicate paid / non–free-tier APIs. */
const PAID_MODEL_MARKERS = [
  /imagen/i,
  /\-pro\b/i,
  /pro\-/i,
  /ultra/i,
  /preview-0[0-9]{3}$/i, // dated experimental previews often billed
];

export function isFreeGeminiTextModel(model: string): boolean {
  const id = model.trim().toLowerCase();
  if (!id) return false;
  if (FREE_GEMINI_TEXT_MODEL_SET.has(id)) return true;
  if (PAID_MODEL_MARKERS.some((re) => re.test(id))) return false;
  // Unknown model IDs: reject so env typos do not hit paid tiers.
  return false;
}

/**
 * Resolve an env model name to a free-tier ID, or return fallback.
 */
export function resolveFreeGeminiTextModel(
  envValue: string | undefined,
  fallback: string = DEFAULT_FREE_GEMINI_TEXT_MODEL
): string {
  const candidate = envValue?.trim();
  if (candidate && isFreeGeminiTextModel(candidate)) {
    return candidate;
  }
  if (candidate) {
    console.warn(
      `[gemini] Ignoring non–free-tier model "${candidate}"; using "${fallback}". ` +
        `Allowed: ${[...FREE_GEMINI_TEXT_MODEL_SET].join(", ")}`
    );
  }
  return fallback;
}

/** Ordered candidates for generateContent (all free tier). */
export function freeGeminiTextModelCandidates(options?: {
  /** Retry pass: try preview ID before primary (still free). */
  preferRetryVariant?: boolean;
}): string[] {
  const primary = resolveFreeGeminiTextModel(
    process.env.GEMINI_BLOG_MODEL?.trim(),
    DEFAULT_FREE_GEMINI_TEXT_MODEL
  );
  const retry = resolveFreeGeminiTextModel(
    process.env.GEMINI_BLOG_RETRY_MODEL?.trim(),
    FREE_GEMINI_TEXT_MODEL_RETRY
  );

  const ordered = options?.preferRetryVariant
    ? [retry, primary, DEFAULT_FREE_GEMINI_TEXT_MODEL, FREE_GEMINI_TEXT_MODEL_RETRY]
    : [primary, DEFAULT_FREE_GEMINI_TEXT_MODEL, retry, FREE_GEMINI_TEXT_MODEL_RETRY];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of ordered) {
    const id = m.trim().toLowerCase();
    if (!id || seen.has(id) || !isFreeGeminiTextModel(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length > 0 ? out : [DEFAULT_FREE_GEMINI_TEXT_MODEL];
}
