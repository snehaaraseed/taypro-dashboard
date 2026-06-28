import "server-only";

import {
  DEFAULT_GEMMA_TEXT_MODEL,
  DEFAULT_GEMMA_TEXT_MODEL_RETRY,
  resolveAutomationTextModel,
} from "@/lib/gemini/free-tier-models";

/** All automation text (blog, translation, project improve) uses Gemma only. */
export function automationTextModelCandidates(options?: {
  preferRetryVariant?: boolean;
}): string[] {
  const primary = resolveAutomationTextModel(
    process.env.GEMINI_BLOG_MODEL?.trim() ||
      process.env.GEMINI_TRANSLATION_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL
  );
  const retry = resolveAutomationTextModel(
    process.env.GEMINI_BLOG_RETRY_MODEL?.trim() ||
      process.env.GEMINI_TRANSLATION_RETRY_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL_RETRY
  );

  const ordered = options?.preferRetryVariant
    ? [retry, primary]
    : [primary, retry];

  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of ordered) {
    const id = m.trim().toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length > 0 ? out : [DEFAULT_GEMMA_TEXT_MODEL];
}

/** Blog generation model chain (alias for automation). */
export function blogTextModelCandidates(options?: {
  preferRetryVariant?: boolean;
}): string[] {
  return automationTextModelCandidates(options);
}

/** CMS translation / project improve model chain. */
export function translationTextModelCandidates(): string[] {
  const primary = resolveAutomationTextModel(
    process.env.GEMINI_TRANSLATION_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL
  );
  const retry = resolveAutomationTextModel(
    process.env.GEMINI_TRANSLATION_RETRY_MODEL?.trim(),
    DEFAULT_GEMMA_TEXT_MODEL_RETRY
  );

  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of [primary, retry]) {
    const id = m.trim().toLowerCase();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length > 0 ? out : [DEFAULT_GEMMA_TEXT_MODEL];
}
