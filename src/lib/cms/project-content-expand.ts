import "server-only";

import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";
import type { RegionalContext } from "@/lib/cms/project-regional-context";
import { formatProjectFactsForPrompt } from "@/lib/cms/project-facts";
import {
  formatWordCountPolicyForPrompt,
  type ProjectWordCountPolicy,
} from "@/lib/seo/project-content-outline";
import {
  ANTI_GENERIC_WRITING_RULES,
  PUNCTUATION_RULES,
  SEO_AND_READER_RULES,
} from "@/lib/seo/content-quality";
import { stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { expandProjectHtmlWithGemini } from "@/lib/cms/project-ai-gemini";

export type ExpandProjectContentInput = {
  content: string;
  title: string;
  facts: ProjectFactsJson;
  regional: RegionalContext | null;
  policy: ProjectWordCountPolicy;
  knowledgeContext: string;
  seoKeyword?: string | null;
};

function countWords(html: string): number {
  return stripHtmlToPlainText(html).split(/\s+/).filter(Boolean).length;
}

export function buildExpandProjectContentPrompt(
  input: ExpandProjectContentInput
): string {
  const wordCount = countWords(input.content);
  const wordsNeeded = Math.max(
    input.policy.publishMin - wordCount + 40,
    150
  );
  const regionalBlock = input.regional
    ? `Regional soiling: ${input.regional.soilingSummary}\nO&M context: ${input.regional.omChallenges.join(" ")}`
    : "";

  return `You are expanding a SHORT Taypro utility-scale solar case study (${wordCount} words). Add at least ${wordsNeeded} words so the total reaches ${input.policy.publishMin}–${input.policy.publishMax} (tier ${input.policy.tier}).

Site title: ${input.title}
Primary SEO keyword: ${input.seoKeyword?.trim() || "(none — use location + MW in opening)"}

${formatProjectFactsForPrompt(input.facts)}
${regionalBlock}
${formatWordCountPolicyForPrompt(input.policy)}
${input.knowledgeContext}

CURRENT HTML (keep every existing <h2> heading text unchanged; expand body copy under each section):
${input.content}

RULES:
- Return ONLY the full expanded HTML document (all sections from current draft).
- Expand EXISTING sections in place with site-specific O&M, SCADA, lender-pack, or regional detail.
- Do NOT add new <h2> headings. Do not remove the stats table.
- Do NOT duplicate paragraphs or repeat H2 blocks.
- First narrative paragraph must include the primary SEO keyword when provided.
- Reference site metrics qualitatively; exact numbers stay in the stats table.
${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}

The expanded HTML MUST be at least ${input.policy.publishMin} words (currently ${wordCount}; need ~${wordsNeeded} more).`;
}

/** Expand composed case-study HTML in one pass (mirrors blog expandShortBlogDraft). */
export async function expandShortProjectContent(
  input: ExpandProjectContentInput
): Promise<string> {
  const prompt = buildExpandProjectContentPrompt(input);
  const expanded = await expandProjectHtmlWithGemini(prompt);
  const before = countWords(input.content);
  const after = countWords(expanded);
  if (after < before * 0.9) {
    console.warn(
      `Project expand shrank content (${after} vs ${before} words); keeping previous`
    );
    return input.content;
  }
  return expanded;
}

export { countWords as countProjectContentWords };
