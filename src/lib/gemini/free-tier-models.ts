/**
 * Google AI Studio free-tier models for Taypro automation.
 *
 * Split by capability (not one model for everything):
 * - Flash Lite: fast high-volume text (blog sections, translation, repair)
 * - Gemma 26B: reliable grounding + quality retry + long editorial
 * - Gemma 31B: grounding/editorial retry when 26B is saturated
 */

export const MODEL_FLASH_LITE = "gemini-3.1-flash-lite";
export const MODEL_GEMMA_26B = "gemma-4-26b-a4b-it";
export const MODEL_GEMMA_31B = "gemma-4-31b-it";

/** High-volume writing: blog plan/sections/FAQ, CMS translation, project improve. */
export const DEFAULT_GEMMA_TEXT_MODEL = MODEL_FLASH_LITE;

/** Retry when Flash JSON/HTML fails; also used for grounding primary. */
export const DEFAULT_GEMMA_TEXT_MODEL_RETRY = MODEL_GEMMA_26B;

/** Google Search grounding (discovery, SERP, facts). Most reliable on free tier. */
export const DEFAULT_GROUNDING_PRIMARY = MODEL_GEMMA_26B;

/** Grounding retry when 26B returns 500/503. */
export const DEFAULT_GROUNDING_RETRY = MODEL_GEMMA_31B;

/** Long-form editorial: monthly insights, rank judge, press-style drafts. */
export const DEFAULT_EDITORIAL_QUALITY_PRIMARY = MODEL_GEMMA_26B;

/** Editorial retry (higher quality, less stable). */
export const DEFAULT_EDITORIAL_QUALITY_RETRY = MODEL_GEMMA_31B;

/** @deprecated Use DEFAULT_GEMMA_TEXT_MODEL */
export const DEFAULT_FREE_GEMINI_TEXT_MODEL = DEFAULT_GEMMA_TEXT_MODEL;

/** @deprecated Use DEFAULT_GEMMA_TEXT_MODEL_RETRY */
export const FREE_GEMINI_TEXT_MODEL_RETRY = DEFAULT_GEMMA_TEXT_MODEL_RETRY;

const AUTOMATION_TEXT_MODEL_SET = new Set<string>([
  MODEL_FLASH_LITE,
  MODEL_GEMMA_26B,
  MODEL_GEMMA_31B,
  "gemini-3.1-flash-lite",
]);

/** Substrings that usually indicate paid / non–free-tier APIs. */
const PAID_MODEL_MARKERS = [
  /imagen/i,
  /\-pro\b/i,
  /pro\-/i,
  /ultra/i,
  /preview-0[0-9]{3}$/i,
];

export function isAutomationTextModel(model: string): boolean {
  const id = model.trim().toLowerCase();
  if (!id) return false;
  if (AUTOMATION_TEXT_MODEL_SET.has(id)) return true;
  if (id.startsWith("gemma-4-")) return true;
  if (PAID_MODEL_MARKERS.some((re) => re.test(id))) return false;
  return false;
}

/** Gemma 4 supports googleSearch; Flash Lite does not on free tier (Gemini 3 search = 0). */
export function isGroundingCapableModel(model: string): boolean {
  const id = model.trim().toLowerCase();
  if (!id) return false;
  if (id.startsWith("gemma-4-")) return true;
  return false;
}

/** @deprecated Use isAutomationTextModel */
export function isFreeGeminiTextModel(model: string): boolean {
  return isAutomationTextModel(model);
}

export function resolveAutomationTextModel(
  envValue: string | undefined,
  fallback: string = DEFAULT_GEMMA_TEXT_MODEL
): string {
  const candidate = envValue?.trim();
  if (candidate && isAutomationTextModel(candidate)) {
    return candidate;
  }
  if (candidate) {
    console.warn(
      `[gemini] Ignoring non-automation model "${candidate}"; using "${fallback}". ` +
        `Allowed: Flash Lite, Gemma 4 26B/31B.`
    );
  }
  return fallback;
}

export function resolveGroundingCapableModel(
  envValue: string | undefined,
  fallback: string = DEFAULT_GROUNDING_PRIMARY
): string {
  const candidate = envValue?.trim();
  if (candidate && isGroundingCapableModel(candidate)) {
    return candidate;
  }
  if (candidate && isAutomationTextModel(candidate)) {
    console.warn(
      `[gemini] Model "${candidate}" cannot use googleSearch on free tier; using "${fallback}".`
    );
  } else if (candidate) {
    console.warn(
      `[gemini] Ignoring non-grounding model "${candidate}"; using "${fallback}".`
    );
  }
  return fallback;
}

/** @deprecated Use resolveAutomationTextModel */
export function resolveFreeGeminiTextModel(
  envValue: string | undefined,
  fallback: string = DEFAULT_GEMMA_TEXT_MODEL
): string {
  return resolveAutomationTextModel(envValue, fallback);
}

/** Ordered candidates for generateContent (Flash primary, Gemma retry). */
export function freeGeminiTextModelCandidates(options?: {
  preferRetryVariant?: boolean;
}): string[] {
  const primary = resolveAutomationTextModel(
    process.env.GEMINI_BLOG_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL
  );
  const retry = resolveAutomationTextModel(
    process.env.GEMINI_BLOG_RETRY_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL_RETRY
  );

  const ordered = options?.preferRetryVariant
    ? [retry, primary]
    : [primary, retry];

  const out = dedupeModelIds(ordered);
  return out.length > 0 ? out : [DEFAULT_GEMMA_TEXT_MODEL];
}

function dedupeModelIds(
  models: string[],
  allow: (id: string) => boolean = isAutomationTextModel
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of models) {
    const id = m.trim().toLowerCase();
    if (!id || seen.has(id) || !allow(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export { dedupeModelIds };
