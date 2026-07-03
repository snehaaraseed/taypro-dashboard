import "server-only";

import {
  DEFAULT_EDITORIAL_QUALITY_PRIMARY,
  DEFAULT_EDITORIAL_QUALITY_RETRY,
  DEFAULT_GEMMA_TEXT_MODEL,
  DEFAULT_GEMMA_TEXT_MODEL_RETRY,
  DEFAULT_GROUNDING_PRIMARY,
  DEFAULT_GROUNDING_RETRY,
  dedupeModelIds,
  resolveAutomationTextModel,
  resolveGroundingCapableModel,
} from "@/lib/gemini/free-tier-models";

export type AutomationTextPurpose =
  | "blog"
  | "translation"
  | "editorial"
  | "project";

function orderedCandidates(
  primary: string,
  retry: string,
  options?: { preferRetryVariant?: boolean }
): string[] {
  const ordered = options?.preferRetryVariant
    ? [retry, primary]
    : [primary, retry];
  return dedupeModelIds(ordered);
}

/**
 * Blog writing: Flash Lite primary (fast, 500 RPD/key), Gemma 26B retry.
 * ~10–40 generateContent calls per post.
 */
export function blogTextModelCandidates(options?: {
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
  return orderedCandidates(primary, retry, options);
}

/**
 * CMS translation + project improve: same Flash → Gemma chain as blog.
 */
export function translationTextModelCandidates(options?: {
  preferRetryVariant?: boolean;
}): string[] {
  const primary = resolveAutomationTextModel(
    process.env.GEMINI_TRANSLATION_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL
  );
  const retry = resolveAutomationTextModel(
    process.env.GEMINI_TRANSLATION_RETRY_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL_RETRY
  );
  return orderedCandidates(primary, retry, options);
}

/**
 * Monthly insights, rank judge, long editorial: Gemma 26B primary, 31B retry.
 */
export function editorialQualityModelCandidates(options?: {
  preferRetryVariant?: boolean;
}): string[] {
  const primary = resolveAutomationTextModel(
    process.env.GEMINI_EDITORIAL_MODEL?.trim(),
    DEFAULT_EDITORIAL_QUALITY_PRIMARY
  );
  const retry = resolveAutomationTextModel(
    process.env.GEMINI_EDITORIAL_RETRY_MODEL?.trim(),
    DEFAULT_EDITORIAL_QUALITY_RETRY
  );
  return orderedCandidates(primary, retry, options);
}

/**
 * Google Search grounding: Gemma 26B primary (1.5K RPD/key, reliable),
 * Gemma 31B retry. Never Flash Lite (Gemini 3 search quota = 0 on free tier).
 */
export function groundingModelCandidates(): string[] {
  const pinned =
    process.env.GEMINI_GROUNDING_MODEL?.trim() ||
    process.env.GEMINI_SERP_MODEL?.trim() ||
    process.env.GEMINI_FACT_MODEL?.trim();

  const primary = resolveGroundingCapableModel(
    pinned,
    DEFAULT_GROUNDING_PRIMARY
  );
  const retry = resolveGroundingCapableModel(
    process.env.GEMINI_GROUNDING_RETRY_MODEL?.trim(),
    DEFAULT_GROUNDING_RETRY
  );

  const out = dedupeModelIds([primary, retry], (id) =>
    id.startsWith("gemma-4-")
  );
  return out.length > 0
    ? out
    : [DEFAULT_GROUNDING_PRIMARY, DEFAULT_GROUNDING_RETRY];
}

export function textModelCandidatesForPurpose(
  purpose: AutomationTextPurpose,
  options?: { preferRetryVariant?: boolean }
): string[] {
  switch (purpose) {
    case "translation":
    case "project":
      return translationTextModelCandidates(options);
    case "editorial":
      return editorialQualityModelCandidates(options);
    case "blog":
    default:
      return blogTextModelCandidates(options);
  }
}

/** @deprecated Prefer blogTextModelCandidates or textModelCandidatesForPurpose. */
export function automationTextModelCandidates(options?: {
  preferRetryVariant?: boolean;
}): string[] {
  return blogTextModelCandidates(options);
}
