import "server-only";

import { parseGeminiJsonObject } from "@/lib/gemini/parse-json-response";
import { generateAutomationText } from "@/lib/gemini/generate-automation-text";
import { formatSerpBriefForPrompt } from "@/lib/gemini/grounded-serp-research";
import type { SerpResearchBrief } from "@/lib/gemini/grounded-serp-research";
import type { FactResearchBrief } from "@/lib/gemini/grounded-fact-research";
import { loadCompetitorContextForPrompt } from "@/lib/insights/research-competitor-context";
import { formatAllFactBriefsForPrompt } from "@/lib/insights/research-deep-bundle";
import type { ResearchTopicConfig } from "@/lib/insights/research-topics-config";
import { buildMonthlyReportTitle } from "@/lib/insights/research-topics-config";

export type ResearchReportPlan = {
  title: string;
  description: string;
  h2Outline: string[];
  readerQuestions: string[];
};

const MIN_H2_SECTIONS = 10;

export async function planResearchReport(
  topic: ResearchTopicConfig,
  period: string,
  serpBrief: SerpResearchBrief,
  factBriefs: FactResearchBrief[],
  priorEditionThemes: string[] = []
): Promise<ResearchReportPlan> {
  const reportTitle = buildMonthlyReportTitle(topic, period);

  const priorBlock =
    priorEditionThemes.length > 0
      ? `\nPRIOR EDITIONS of this exact topic have already used these section themes. Take a DISTINCTLY fresh angle for this edition and do NOT reuse them as H2 headings:\n${priorEditionThemes
          .map((t) => `- ${t}`)
          .join("\n")}\n`
      : "";

  const prompt = `You are a senior research editor for Taypro Insights: deep procurement intelligence for utility-scale solar cleaning in India.

Plan a LONG-FORM monthly research report (target 4,000–5,500 words when written).

Report title (locked): ${reportTitle}
Audience: ${topic.audience}
Primary keyword: ${topic.keyword}
Angle: ${topic.angle}

${formatSerpBriefForPrompt(serpBrief)}

${formatAllFactBriefsForPrompt(factBriefs)}

${loadCompetitorContextForPrompt()}
${priorBlock}
Return ONLY valid JSON:
{
  "title": "${reportTitle}",
  "description": "150–220 char SERP description for this month's report",
  "h2Outline": [
    "10–12 distinct H2 section titles, must include Executive summary, Market landscape, Technical/operations deep dive, Economics/TCO, Regional India context, Risk & red flags, Procurement/RFP checklist, Scenario recommendations, Conclusion"
  ],
  "readerQuestions": ["5–7 questions this report must answer for ${topic.audience}"]
}

Rules:
- h2Outline: exactly 10–12 items; each must be specific to this topic, not generic blog headings.
- Exploit SERP gaps and verified stats from fact research.
- Do NOT plan a Sources section (appended automatically).
- Write for IPP/O&M executives who will read 15+ minutes, depth over fluff.`;

  const raw = await generateAutomationText(prompt, {
    maxOutputTokens: 4096,
    purpose: "editorial",
    preferQualityModel: true,
  });

  const parsed = parseGeminiJsonObject<{
    title?: string;
    description?: string;
    h2Outline?: string[];
    readerQuestions?: string[];
  }>(raw);

  const h2Outline = (parsed.h2Outline ?? [])
    .map((h) => String(h).trim())
    .filter(Boolean);

  if (h2Outline.length < MIN_H2_SECTIONS) {
    throw new Error(
      `Research plan has ${h2Outline.length} H2 sections; need at least ${MIN_H2_SECTIONS}`
    );
  }

  return {
    title: parsed.title?.trim() || reportTitle,
    description: parsed.description?.trim() || topic.description,
    h2Outline: h2Outline.slice(0, 12),
    readerQuestions: (parsed.readerQuestions ?? []).map(String).filter(Boolean),
  };
}
