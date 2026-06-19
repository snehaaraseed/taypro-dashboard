import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";
import { parseSearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";

/** Structured outline from planBlogContent (phase 2) before full body write. */
export type BlogContentPlan = {
  description: string;
  h2Outline: string[];
  quickAnswerBullets: string[];
  faqQuestions: string[];
  outlineJson: string;
  readerQuestion?: string;
  mustCover?: string[];
  avoidTopics?: string[];
  /** AI-declared cluster intent (validated in planBlogContent). */
  intentFamily?: SearchIntentFamily;
  intentReason?: string;
};

export function parseBlogContentPlanJson(raw: string): BlogContentPlan {
  const parsed = JSON.parse(raw) as {
    description?: string;
    h2Outline?: unknown;
    quickAnswerBullets?: unknown;
    faqQuestions?: unknown;
    readerQuestion?: string;
    mustCover?: unknown;
    avoidTopics?: unknown;
    intentFamily?: unknown;
    intentReason?: unknown;
  };
  const h2Outline = Array.isArray(parsed.h2Outline)
    ? parsed.h2Outline.filter((h): h is string => typeof h === "string")
    : [];
  const quickAnswerBullets = Array.isArray(parsed.quickAnswerBullets)
    ? parsed.quickAnswerBullets.filter((b): b is string => typeof b === "string")
    : [];
  const faqQuestions = Array.isArray(parsed.faqQuestions)
    ? parsed.faqQuestions.filter((q): q is string => typeof q === "string")
    : [];
  const readerQuestion =
    typeof parsed.readerQuestion === "string" ? parsed.readerQuestion.trim() : undefined;
  const mustCover = Array.isArray(parsed.mustCover)
    ? parsed.mustCover.filter((x): x is string => typeof x === "string")
    : undefined;
  const avoidTopics = Array.isArray(parsed.avoidTopics)
    ? parsed.avoidTopics.filter((x): x is string => typeof x === "string")
    : undefined;
  const intentFamily = parseSearchIntentFamily(parsed.intentFamily) ?? undefined;
  const intentReason =
    typeof parsed.intentReason === "string" ? parsed.intentReason.trim() : undefined;
  return {
    description: String(parsed.description ?? "").trim(),
    h2Outline,
    quickAnswerBullets,
    faqQuestions,
    outlineJson: raw,
    readerQuestion,
    mustCover,
    avoidTopics,
    intentFamily,
    intentReason,
  };
}
