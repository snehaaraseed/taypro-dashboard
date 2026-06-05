import "server-only";

import type { BlogAuthor } from "@/app/data/blogAuthors";
import type { BlogContentPlan } from "@/lib/seo/blog-content-plan";
import type { SeoKeywordBrief } from "@/lib/seo/keyword-stats";
import {
  AI_OVERVIEW_SNIPPET_RULES,
  LONG_FORM_CONTENT_RULES,
  PUNCTUATION_RULES,
  SEO_AND_READER_RULES,
} from "@/lib/seo/content-quality";

export type SectionWriterContext = {
  topic: string;
  category: string;
  seoBrief?: SeoKeywordBrief | null;
  knowledgeContext: string;
  editorial: string;
  authorBlock: string;
  seoBlock: string;
  excludeBlock: string;
  primaryKeyword?: string;
};

/** Split H2 outline into chunks of 2 for reliable ~400–900 word sections per call. */
export function chunkH2Outline(h2Outline: string[], chunkSize = 2): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < h2Outline.length; i += chunkSize) {
    chunks.push(h2Outline.slice(i, i + chunkSize));
  }
  return chunks;
}

export function buildSectionWriterPrompt(
  ctx: SectionWriterContext,
  plan: BlogContentPlan,
  sectionH2s: string[],
  options: {
    isFirstChunk: boolean;
    sectionIndex: number;
    totalSections: number;
    previousSectionsHtml?: string;
  }
): string {
  const h2List = sectionH2s.map((h) => `- ${h}`).join("\n");
  const fullOutline = plan.h2Outline.map((h, i) => `${i + 1}. ${h}`).join("\n");
  const bullets =
    options.isFirstChunk && plan.quickAnswerBullets.length > 0
      ? `\nQuick answer bullets to include under the Quick answer H2:\n${plan.quickAnswerBullets.map((b) => `- ${b}`).join("\n")}\n`
      : "";

  const introRule = options.isFirstChunk
    ? `- Start with 1–2 intro <p> tags that directly answer the title, then write the section H2s below.\n`
    : `- Do NOT repeat the intro; continue seamlessly from the prior sections.\n`;

  const continuityBlock = options.previousSectionsHtml?.trim()
    ? `
ARTICLE SO FAR (do not rewrite; maintain facts, tone, and terminology — continue after this):
${options.previousSectionsHtml.trim().slice(-3500)}

REMAINING H2 OUTLINE (full article structure):
${fullOutline}
`
    : `
FULL ARTICLE H2 OUTLINE (you are writing sections ${options.sectionIndex + 1}/${options.totalSections}):
${fullOutline}
`;

  return `You are writing part ${options.sectionIndex + 1}/${options.totalSections} of ONE cohesive utility-scale solar blog post.

Title (locked): ${ctx.topic}
Primary keyword: ${ctx.primaryKeyword?.trim() || "(none)"}
Category: ${ctx.category}

${ctx.editorial}
${ctx.authorBlock}
${ctx.seoBlock}
${ctx.excludeBlock}

${continuityBlock}

VERIFIED KNOWLEDGE PACK (use for facts; same pack as rest of article):
${ctx.knowledgeContext}

Write ONLY these H2 sections in this chunk (each H2 plus paragraphs, lists, or tables as needed):
${h2List}
${bullets}
${introRule}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}
${AI_OVERVIEW_SNIPPET_RULES}
${LONG_FORM_CONTENT_RULES}

Rules:
- Target ${sectionH2s.length * 400}–${sectionH2s.length * 550} words for this chunk.
- Match voice, facts, and MW/%/INR ranges used in prior sections; do not contradict.
- Return ONLY valid JSON: { "html": "<h2>...</h2><p>...</p>..." }
- No outer <html> or markdown; HTML fragment only.
- Use ONLY verified facts from the knowledge pack.`;
}

export function buildFaqWriterPrompt(
  ctx: SectionWriterContext,
  plan: BlogContentPlan,
  contentPreview: string
): string {
  return `Write exactly 4 FAQ items for this published utility-scale solar blog.

Title: ${ctx.topic}
Primary keyword: ${ctx.primaryKeyword?.trim() || "(none)"}

Planned FAQ questions (use these or tighten them):
${plan.faqQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Quick answer bullets from the article:
${plan.quickAnswerBullets.map((b) => `- ${b}`).join("\n")}

Article excerpt (for factual alignment):
${contentPreview.slice(0, 2500)}

${PUNCTUATION_RULES}

Return ONLY valid JSON:
{
  "faqs": [
    { "question": "...", "answer": "plain text 40-80 words" }
  ]
}

Rules:
- Exactly 4 FAQs; faqs[0] must phrase the primary keyword as a question.
- Answers must match Quick answer facts; plain text only.`;
}

export function assembleSectionHtml(parts: string[]): string {
  return parts.map((p) => p.trim()).filter(Boolean).join("\n\n");
}
