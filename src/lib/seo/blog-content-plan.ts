/** Structured outline from planBlogContent (phase 2) before full body write. */
export type BlogContentPlan = {
  description: string;
  h2Outline: string[];
  quickAnswerBullets: string[];
  faqQuestions: string[];
  outlineJson: string;
};

export function parseBlogContentPlanJson(raw: string): BlogContentPlan {
  const parsed = JSON.parse(raw) as {
    description?: string;
    h2Outline?: unknown;
    quickAnswerBullets?: unknown;
    faqQuestions?: unknown;
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
  return {
    description: String(parsed.description ?? "").trim(),
    h2Outline,
    quickAnswerBullets,
    faqQuestions,
    outlineJson: raw,
  };
}
