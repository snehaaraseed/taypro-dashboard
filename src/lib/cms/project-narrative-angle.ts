import "server-only";

import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";

export type NarrativeAngle = {
  id: number;
  name: string;
  leadInstruction: string;
  h2Style: string;
  outOfBox?: string;
};

export const PROJECT_NARRATIVE_ANGLES: NarrativeAngle[] = [
  {
    id: 0,
    name: "soiling-environment",
    leadInstruction:
      "Lead with site-specific soiling, dust type, and seasonal pattern at this exact village/district — not generic Maharashtra copy.",
    h2Style:
      "Use H2 headings that name the location and a soiling outcome (e.g. 'Dust load and seasonal swings at {location}').",
  },
  {
    id: 1,
    name: "water-labour-om",
    leadInstruction:
      "Lead with water logistics and manual crew limits before robotics — tanker dependency, night windows, audit gaps.",
    h2Style:
      "Frame challenge H2 around O&M labour and water constraints unique to this MW scale and region.",
  },
  {
    id: 2,
    name: "fleet-deployment",
    leadInstruction:
      "Lead with fleet sizing, robot mix, commissioning timeline, and procurement model for this plant.",
    h2Style:
      "Deployment H2 should highlight robot count per MW and how the fleet maps to block layout.",
  },
  {
    id: 3,
    name: "operations-nectyr",
    leadInstruction:
      "Lead with NECTYR scheduling, cleaning accountability, wind/rain skip logic, and logged completion proof.",
    h2Style:
      "Operations H2 should emphasise logged cycles and supervisor visibility — not generic 'robot saves water'.",
  },
  {
    id: 4,
    name: "results-impact",
    leadInstruction:
      "Lead with qualitative outcomes tied to this site's water saved and generation uplift from facts.",
    h2Style:
      "Results section first in narrative flow; environment becomes supporting context.",
  },
  {
    id: 5,
    name: "regional-peer-contrast",
    leadInstruction:
      "Open by contrasting this site's MW/mode/fleet with a different scale deployment in the same state — without copying peer sentences.",
    h2Style:
      "Include a peer comparison H2 with checklist bullets; vary bullet verbs from other Ahmadnagar/Yavatmal pages.",
  },
  {
    id: 6,
    name: "commissioning-story",
    leadInstruction:
      "Tell a commissioning-to-steady-state story: mobilisation, row coverage proof, first full cycle, handover to plant O&M.",
    h2Style:
      "Use timeline-style H3 subheads inside deployment and operations sections.",
  },
  {
    id: 7,
    name: "out-of-box-audit",
    leadInstruction:
      "Write as an IPP audit narrative: what an asset manager needed to see on paper before approving robotic cleaning at this site.",
    h2Style:
      "Use unconventional H2 framing (audit questions, evidence trail, fleet governance) while keeping all facts accurate.",
    outOfBox:
      "Think like a technical due-diligence memo turned into a case study — still HTML case study format, not a letter.",
  },
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getDefaultNarrativeAngleIndex(slug: string): number {
  return hashSlug(slug) % PROJECT_NARRATIVE_ANGLES.length;
}

export function getNarrativeAngle(index: number): NarrativeAngle {
  const normalized =
    ((index % PROJECT_NARRATIVE_ANGLES.length) + PROJECT_NARRATIVE_ANGLES.length) %
    PROJECT_NARRATIVE_ANGLES.length;
  return PROJECT_NARRATIVE_ANGLES[normalized]!;
}

export function buildNarrativeAngleBrief(
  angleIndex: number,
  facts: ProjectFactsJson,
  slug: string
): string {
  const angle = getNarrativeAngle(angleIndex);
  const loc = facts.location || facts.state || "this site";
  const mw = facts.capacityMw ? `${facts.capacityMw} MW` : "utility-scale";
  const mode = facts.cleaningMode || "robotic";
  const cadenceHint =
    facts.cleaningMode === "Semi-Automatic" || Number(facts.semiAutomaticRobots) > 0
      ? "This is a semi-automatic / pick-and-place site: describe site-specific scheduled dry cycles (commonly about 3–10 per month), NOT daily plant-wide automatic-row cleaning."
      : "This is an automatic robot site: describe daily waterless cleaning cycles in NECTYR — never '3–10 per month' or 'not daily washing'.";

  return [
    `NARRATIVE ANGLE ${angle.id + 1}/${PROJECT_NARRATIVE_ANGLES.length}: ${angle.name}`,
    angle.leadInstruction,
    angle.h2Style.replace(/\{location\}/g, loc),
    angle.outOfBox ?? "",
    `SITE ANCHOR: ${loc}, ${mw}, ${mode}. Slug: ${slug}.`,
    cadenceHint,
    "Every section must cite at least one STRUCTURED SITE FACT. No sentence that could be pasted unchanged onto another plant in the same district.",
  ]
    .filter(Boolean)
    .join("\n");
}

export type SimilarityConflict = {
  reason: string;
  title: string;
  slug: string;
  score?: number;
};

export function parseSimilarityConflict(message: string): SimilarityConflict | null {
  const bodyMatch = message.match(
    /Project body too similar to existing case study \(([^,]+), score ([\d.]+)\): "([^"]+)" \(([^)]+)\)/
  );
  if (bodyMatch) {
    return {
      reason: bodyMatch[1]!,
      score: Number(bodyMatch[2]),
      title: bodyMatch[3]!,
      slug: bodyMatch[4]!,
    };
  }

  const draftMatch = message.match(
    /Project too similar to existing case study \(([^)]+)\): "([^"]+)" \(([^)]+)\)/
  );
  if (draftMatch) {
    return { reason: draftMatch[1]!, title: draftMatch[2]!, slug: draftMatch[3]! };
  }

  return null;
}

export function buildDifferentiationRetryBrief(
  error: string,
  nextAngleIndex: number,
  facts: ProjectFactsJson,
  slug: string
): string {
  const angleBrief = buildNarrativeAngleBrief(nextAngleIndex, facts, slug);
  const conflict = parseSimilarityConflict(error);
  const validationIssues = error.includes("Project structure validation failed")
    ? error.replace("Project structure validation failed: ", "")
    : null;

  const parts = [
    angleBrief,
    "RETRY — prior draft was rejected. Change story spine, H2 wording, and paragraph openings completely.",
  ];

  if (conflict) {
    parts.push(
      `UNIQUENESS: Too similar to "${conflict.title}" (${conflict.slug}) on ${conflict.reason}.`,
      `Do NOT reuse that page's H2 pattern, executive summary shape, or environment paragraph.`,
      `Lead instead with: ${facts.omChallenge || facts.soiling || facts.deploymentHighlight || `fleet at ${facts.location}`}.`
    );
  }

  if (validationIssues) {
    parts.push(`FIX VALIDATION: ${validationIssues}`);
  }

  if (/too short|word count/i.test(error)) {
    parts.push(
      "Expand narrative sections to tier minimum using site facts — no filler duplicated from other projects."
    );
  }

  parts.push(
    "OUT-OF-BOX: Use a fresh metaphor or framing (audit trail, monsoon window, block-coverage map, supervisor shift handover) that other Taypro case studies in this district have not used."
  );

  return parts.join("\n");
}

export function getMaxAnglesPerSlug(): number {
  const raw = process.env.CMS_PROJECT_IMPROVE_MAX_ANGLES?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : PROJECT_NARRATIVE_ANGLES.length;
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, PROJECT_NARRATIVE_ANGLES.length)
    : PROJECT_NARRATIVE_ANGLES.length;
}
