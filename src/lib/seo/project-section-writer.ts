import "server-only";

import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";
import type { ProjectNarrativeSectionId } from "@/lib/cms/project-facts-types";
import { formatProjectFactsForPrompt } from "@/lib/cms/project-facts";
import type { RegionalContext } from "@/lib/cms/project-regional-context";
import {
  formatWordCountPolicyForPrompt,
  getSectionWordBudgets,
  type ProjectWordCountPolicy,
} from "@/lib/seo/project-content-outline";
import {
  ANTI_GENERIC_WRITING_RULES,
  PUNCTUATION_RULES,
  SEO_AND_READER_RULES,
} from "@/lib/seo/content-quality";

export type ProjectContentPlan = {
  description: string;
  executiveSummaryOutline: string;
  sectionNotes: Partial<Record<ProjectNarrativeSectionId, string>>;
};

const SECTION_INSTRUCTIONS: Record<ProjectNarrativeSectionId, string> = {
  environment:
    "Explain site-specific soiling using REGIONAL CONTEXT. No generic India-wide dust copy.",
  challenge:
    "Describe O&M pain before robotics: water, labour, audit gaps. Use facts.omChallenge and facts.waterLabour.",
  deployment:
    "Fleet mix, robot system, procurement model, commissioning emphasis. Use facts only.",
  operations:
    "Cleaning cadence, NECTYR or inspection-led accountability, wind holds. No daily wash myths.",
  results:
    "Qualitative outcomes; reference metrics qualitatively, numbers live in the stats table only.",
  peers:
    "Compare to 2 peer deployments by MW/mode; end with 4–6 bullet planning checklist.",
};

export function buildProjectPlanPrompt(
  facts: ProjectFactsJson,
  regional: RegionalContext | null,
  policy: ProjectWordCountPolicy,
  knowledgeContext: string,
  improvementBrief?: string
): string {
  const regionalBlock = regional
    ? `REGIONAL CONTEXT (${regional.state}):
Soiling: ${regional.soilingSummary}
Water: ${regional.waterConstraints}
O&M: ${regional.omChallenges.join(" ")}`
    : "";

  return `You are planning a Taypro utility-scale solar cleaning robot case study.

${formatProjectFactsForPrompt(facts)}
${regionalBlock}
${formatWordCountPolicyForPrompt(policy)}
${knowledgeContext}

DIFFERENTIATION (critical for SEO — every Taypro case study must read as a distinct page):
- Lead with THIS plant's specifics: exact location/district, state, capacity (MW), fleet size and mix, and the named outcome.
- Frame the narrative around this site's unique soiling, terrain, and O&M situation — not generic "robotic cleaning saves water" copy shared by other projects.
- Avoid boilerplate sentences that could apply to any plant; anchor every claim to this project's facts and region.

${improvementBrief ? `IMPROVEMENT NOTES: ${improvementBrief}` : ""}

Return ONLY valid JSON:
{
  "description": "Meta description 140-155 chars with location, MW, outcome",
  "executiveSummaryOutline": "3 bullet points for exec summary",
  "sectionNotes": {
    "environment": "angle for this site",
    "challenge": "angle",
    "deployment": "angle",
    "operations": "angle",
    "results": "angle",
    "peers": "angle or omit for compact"
  }
}`;
}

export function buildProjectSectionPrompt(
  sectionId: ProjectNarrativeSectionId | "executiveSummary",
  heading: string,
  facts: ProjectFactsJson,
  regional: RegionalContext | null,
  policy: ProjectWordCountPolicy,
  plan: ProjectContentPlan,
  knowledgeContext: string,
  options?: {
    preservedImageUrls?: string[];
    previousHtml?: string;
  }
): string {
  const budgets = getSectionWordBudgets(policy);
  const budget = budgets.find((b) => b.id === sectionId);
  const wordRange = budget
    ? `${budget.min}–${budget.max} words`
    : "120–200 words";

  const isExec = sectionId === "executiveSummary";
  const instruction = isExec
    ? "Write 2–3 <p> paragraphs only (no h2). Cover site, challenge, Taypro deployment, headline outcomes."
  : SECTION_INSTRUCTIONS[sectionId as ProjectNarrativeSectionId];

  const imageBlock =
    options?.preservedImageUrls && options.preservedImageUrls.length > 0
      ? `\nIf referencing photos, use ONLY these existing image URLs:\n${options.preservedImageUrls.map((u) => `- ${u}`).join("\n")}\n`
      : "";

  const continuity = options?.previousHtml?.trim()
    ? `\nPRIOR SECTIONS (maintain consistency):\n${options.previousHtml.trim().slice(-2000)}\n`
    : "";

  return `Write the "${heading}" section for a Taypro project case study.

SECTION: ${sectionId}
TARGET: ${wordRange}
INSTRUCTION: ${instruction}
PLAN NOTE: ${isExec ? plan.executiveSummaryOutline : plan.sectionNotes[sectionId as ProjectNarrativeSectionId] ?? ""}

${formatProjectFactsForPrompt(facts)}
${regional ? `Regional soiling: ${regional.soilingSummary}` : ""}
${knowledgeContext}
${imageBlock}
${continuity}

RULES:
- Output HTML with <p>, <ul>, <h3> only, NO <h2>, NO <h1>.
- Do NOT invent client names, ROI %, or specs outside facts.
- Do NOT repeat exact metrics from facts table in long form, reference qualitatively.
- Anchor wording to THIS plant (location, MW, fleet, region). Avoid generic phrasing reusable across other case studies.
${ANTI_GENERIC_WRITING_RULES}
${PUNCTUATION_RULES}
${SEO_AND_READER_RULES}

OUTPUT FORMAT (strict):
- Do NOT show any planning, outlines, drafts, revisions, word-count checks, self-corrections, or commentary.
- Output the finished HTML fragment ONLY, wrapped exactly between the markers below.
- Nothing before the first marker and nothing after the last marker.

===HTML===
<the final HTML fragment only>
===END===`;
}
