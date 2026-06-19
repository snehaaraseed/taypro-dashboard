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
import type { BlogStructurePolicy } from "@/lib/seo/blog-word-count-tier";

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
  researchBlock?: string;
  contractBlock?: string;
  wordCountRules?: string;
  structurePolicy?: BlogStructurePolicy;
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
  const intentFromPlan =
    plan.readerQuestion || plan.mustCover?.length || plan.avoidTopics?.length
      ? `
PLANNED INTENT (every section must serve this — do NOT drift to generic robot O&M):
Reader question: ${plan.readerQuestion ?? "(answer the title directly)"}
Must cover: ${(plan.mustCover ?? []).map((m) => `- ${m}`).join("\n") || "(see H2 outline)"}
Avoid: ${(plan.avoidTopics ?? []).map((a) => `- ${a}`).join("\n") || "(off-topic sales pitch)"}
`
      : "";
  const bullets =
    options.isFirstChunk && plan.quickAnswerBullets.length > 0
      ? `\nQuick answer bullets to include under the Quick answer H2:\n${plan.quickAnswerBullets.map((b) => `- ${b}`).join("\n")}\n`
      : "";

  const introRule = options.isFirstChunk
    ? `- Start with 1–2 intro <p> tags that directly answer the title and reader question, then write the section H2s below.\n`
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

${ctx.contractBlock ? `${ctx.contractBlock}\n` : ""}
${intentFromPlan}
${ctx.editorial}
${ctx.authorBlock}
${ctx.seoBlock}
${ctx.researchBlock ?? ""}
${ctx.excludeBlock ? `\n${ctx.excludeBlock}\n` : ""}

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
${ctx.wordCountRules ?? LONG_FORM_CONTENT_RULES}

Rules:
- Output HTML for ONLY the H2 sections listed in "Write ONLY these H2 sections" above.
- Do NOT repeat or rewrite any H2 from ARTICLE SO FAR — continue after the last paragraph only.
- Every H2 in this chunk must advance the title intent; do not insert unrelated cleaning-robot sales sections.
- Target ${sectionH2s.length * (ctx.structurePolicy?.wordsPerH2ChunkMin ?? 350)}–${sectionH2s.length * (ctx.structurePolicy?.wordsPerH2ChunkMax ?? 500)} words for this chunk.
- Match voice, facts, and MW/%/INR ranges used in prior sections; do not contradict.
- Use verified stats from FACT RESEARCH when provided; otherwise label ranges as industry-typical.
- Return ONLY valid JSON: { "html": "<h2>...</h2><p>...</p>..." }
- No outer <html> or markdown; HTML fragment only.
- Use ONLY verified facts from the knowledge pack.`;
}

export function buildFaqWriterPrompt(
  ctx: SectionWriterContext,
  plan: BlogContentPlan,
  contentPreview: string
): string {
  const intentNote = plan.readerQuestion
    ? `\nReader question (FAQs must support this): ${plan.readerQuestion}\n`
    : "";
  return `Write exactly 4 FAQ items for this published utility-scale solar blog.

Title: ${ctx.topic}
Primary keyword: ${ctx.primaryKeyword?.trim() || "(none)"}
${intentNote}
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

function normalizeOutlineH2Key(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Whether a planned outline H2 is already represented in written sections. */
export function h2OutlineCovered(
  plannedH2: string,
  writtenH2Keys: Set<string>
): boolean {
  const planned = normalizeOutlineH2Key(plannedH2);
  if (!planned) return true;
  for (const written of writtenH2Keys) {
    if (written === planned || written.includes(planned) || planned.includes(written)) {
      return true;
    }
    const plannedWords = planned.split(/\s+/).filter((w) => w.length > 3);
    if (plannedWords.length === 0) continue;
    const hits = plannedWords.filter((w) => written.includes(w)).length;
    if (hits >= Math.ceil(plannedWords.length * 0.5)) return true;
  }
  return false;
}

export function missingH2OutlineSections(
  h2Outline: string[],
  writtenH2Keys: Set<string>
): string[] {
  return h2Outline.filter((h2) => !h2OutlineCovered(h2, writtenH2Keys));
}
