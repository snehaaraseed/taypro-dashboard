import "server-only";

import { generateAutomationText } from "@/lib/gemini/generate-automation-text";
import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import { formatSerpBriefForPrompt } from "@/lib/gemini/grounded-serp-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import {
  chunkH2Outline,
  missingH2OutlineSections,
} from "@/lib/seo/blog-section-writer";
import { extractH2Headings } from "@/lib/seo/blog-similarity";
import { stripPriorH2Sections } from "@/lib/seo/blog-body-hygiene";
import { cleanResearchSectionHtml } from "@/lib/insights/research-html-sanitize";
import { loadCompetitorContextForPrompt } from "@/lib/insights/research-competitor-context";
import { formatAllFactBriefsForPrompt } from "@/lib/insights/research-deep-bundle";
import { buildResearchRoiPromptBlock } from "@/lib/insights/research-roi-reference";
import type { ResearchTopicConfig } from "@/lib/insights/research-topics-config";
import type { ResearchReportPlan } from "@/lib/insights/research-report-planner";

const WORDS_PER_H2_MIN = 320;
const WORDS_PER_H2_MAX = 480;

const HTML_START = "===HTML_START===";
const HTML_END = "===HTML_END===";

function stripModelFences(text: string): string {
  let out = text.trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```(?:html|json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return out.trim();
}

/**
 * Extract clean section HTML from a model response. Gemma prefixes its real HTML
 * with planning/chain-of-thought, so we (1) prefer content inside the sentinel
 * markers, (2) fall back to a JSON {html} wrapper, then raw, and (3) keep only
 * real <h2> sections, dropping any leaked preamble.
 */
function parseSectionHtmlResponse(raw: string): string {
  let html = "";

  const startIdx = raw.indexOf(HTML_START);
  const endIdx = raw.lastIndexOf(HTML_END);
  if (startIdx !== -1) {
    html = raw.slice(
      startIdx + HTML_START.length,
      endIdx > startIdx ? endIdx : undefined
    );
  }

  if (!html.trim()) {
    try {
      const parsed = parseGeminiJsonObject<{ html?: string }>(raw);
      if (parsed.html?.trim()) html = parsed.html;
    } catch {
      /* fall through */
    }
  }

  if (!html.trim()) html = stripModelFences(raw);

  return cleanResearchSectionHtml(html);
}

function assembleHtml(parts: string[]): string {
  return parts.filter((p) => p.trim()).join("\n\n");
}

export async function writeResearchReportBody(
  topic: ResearchTopicConfig,
  plan: ResearchReportPlan,
  serpBrief: SerpResearchBrief,
  factBriefs: FactResearchBrief[]
): Promise<string> {
  const researchBlock = [
    formatSerpBriefForPrompt(serpBrief),
    formatAllFactBriefsForPrompt(factBriefs),
    loadCompetitorContextForPrompt(),
    buildResearchRoiPromptBlock(),
  ].join("\n\n");

  const readerBlock =
    plan.readerQuestions.length > 0
      ? `Questions this report MUST answer:\n${plan.readerQuestions.map((q) => `- ${q}`).join("\n")}`
      : "";

  const chunks = chunkH2Outline(plan.h2Outline, 2);
  const htmlParts: string[] = [];
  const priorH2Keys = new Set<string>();

  async function writeChunk(
    sectionH2s: string[],
    maxRetries = 2
  ): Promise<void> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const alreadyWritten =
        priorH2Keys.size > 0
          ? `ALREADY-WRITTEN SECTIONS (do not repeat these headings):\n${[...priorH2Keys]
              .map((h) => `- ${h}`)
              .join("\n")}\n`
          : "";

      const prompt = `Write the next sections of a long-form research report as clean HTML.

CONTEXT (background only, never restate or quote any of this in your output):
- Report title: ${plan.title}
- Audience: ${topic.audience}
- Primary keyword: ${topic.keyword}

${readerBlock}

${researchBlock}

${alreadyWritten}
Write ONLY these H2 sections now:
${sectionH2s.map((h) => `- ${h}`).join("\n")}

WRITING RULES:
- Write dense, specific, decision-useful prose for ${topic.audience}; ~${sectionH2s.length * WORDS_PER_H2_MIN}–${sectionH2s.length * WORDS_PER_H2_MAX} words total.
- Short paragraphs; use <ul>/<table> only where they genuinely aid scanning.
- Cite industry stats inline with the source name in parentheses, e.g. (Mercom India 2025). Add an <a href="https://..." rel="noopener noreferrer"> only when the URL is known from the research metadata.
- Use the DETERMINISTIC ROI BANDS for economics, do not invent payback figures.
- Natural internal links where relevant: /solar-panel-cleaning-system, /utility-scale-solar-operations, /solar-panel-cleaning-robot-price-calculator, /compare/solar-panel-cleaning-robot-vs-manual-cleaning

OUTPUT FORMAT: follow exactly:
- Output ONLY the HTML, wrapped between the two markers below. Write nothing before, between, or after the markers except the HTML itself.
- Begin each section with <h2>…</h2>, then the body tags.
- Absolutely DO NOT include: planning, notes, word counts, "Part X of Y", self-commentary, markdown, code fences, empty paragraphs, or <h1>.

Example shape:
${HTML_START}
<h2>${sectionH2s[0] ?? "First section heading"}</h2>
<p>First paragraph of dense, specific prose…</p>
${HTML_END}`;

      const raw = await generateAutomationText(prompt, {
        maxOutputTokens: 8192,
        purpose: "editorial",
        preferQualityModel: true,
      });

      let sectionHtml = parseSectionHtmlResponse(raw);
      if (!sectionHtml) continue;

      sectionHtml = stripPriorH2Sections(sectionHtml, priorH2Keys);
      if (!sectionHtml.trim()) continue;

      for (const h of extractH2Headings(sectionHtml)) {
        priorH2Keys.add(h);
      }
      htmlParts.push(sectionHtml);
      return;
    }
  }

  for (let i = 0; i < chunks.length; i++) {
    await writeChunk(chunks[i]!);
  }

  const missing = missingH2OutlineSections(plan.h2Outline, priorH2Keys);
  for (let i = 0; i < missing.length; i++) {
    await writeChunk([missing[i]!], 3);
  }

  const stillMissing = missingH2OutlineSections(plan.h2Outline, priorH2Keys);
  if (stillMissing.length > 0) {
    throw new Error(
      `Research report incomplete, missing sections: ${stillMissing.slice(0, 4).join("; ")}`
    );
  }

  return assembleHtml(htmlParts);
}
