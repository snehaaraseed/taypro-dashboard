/**
 * Google AI Studio free-tier text models for automation.
 * Flash Lite for high-volume writing; Gemma 26B for grounding + retry.
 */

export const DEFAULT_GEMMA_TEXT_MODEL = "gemini-3.1-flash-lite";

export const DEFAULT_GEMMA_TEXT_MODEL_RETRY = "gemma-4-26b-a4b-it";

/** @deprecated Use DEFAULT_GEMMA_TEXT_MODEL: kept for type compat during migration. */
export const DEFAULT_FREE_GEMINI_TEXT_MODEL = DEFAULT_GEMMA_TEXT_MODEL;

/** @deprecated Use DEFAULT_GEMMA_TEXT_MODEL_RETRY */
export const FREE_GEMINI_TEXT_MODEL_RETRY = DEFAULT_GEMMA_TEXT_MODEL_RETRY;

const AUTOMATION_TEXT_MODEL_SET = new Set<string>([
  DEFAULT_GEMMA_TEXT_MODEL,
  DEFAULT_GEMMA_TEXT_MODEL_RETRY,
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
        `Allowed automation IDs: ${[...AUTOMATION_TEXT_MODEL_SET].join(", ")}`
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

/** Ordered candidates for generateContent (Flash Lite primary, Gemma retry). */
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

  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of ordered) {
    const id = m.trim().toLowerCase();
    if (!id || seen.has(id) || !isAutomationTextModel(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length > 0 ? out : [DEFAULT_GEMMA_TEXT_MODEL];
}
