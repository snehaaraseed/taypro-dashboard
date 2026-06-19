import "server-only";

import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";

/**
 * B2B search-intent families for content clusters (one keyword → many non-cannibalizing posts).
 * @see docs/KEYWORD_INTENT_CLUSTERS.md
 */
export type SearchIntentFamily =
  | "technical_howto"
  | "financial_roi"
  | "risk_compliance"
  | "comparison_alternative"
  | "troubleshooting_problem";

export type IntentFamilyMeta = {
  id: SearchIntentFamily;
  label: string;
  readerQuestion: string;
  titlePatterns: string[];
  mustDeliver: string[];
  avoidCannibalizing: string;
};

export const SEARCH_INTENT_FAMILIES: IntentFamilyMeta[] = [
  {
    id: "technical_howto",
    label: "Technical how-to & process",
    readerQuestion:
      "How do I implement this safely and correctly on my plant without breaking existing systems?",
    titlePatterns: [
      "How to integrate {keyword} into …",
      "Step-by-step guide: deploying {keyword} …",
      "How often should you … {keyword}",
    ],
    mustDeliver: [
      "Step-by-step process or schedule",
      "MW-scale / India plant constraints",
      "Specific thresholds (%, days, MW)",
    ],
    avoidCannibalizing:
      "Do not repeat ROI tables or vendor comparison matrices covered in other posts for this keyword.",
  },
  {
    id: "financial_roi",
    label: "Financial & ROI",
    readerQuestion:
      "What is the payback period, and how does this affect OPEX vs CAPEX on my portfolio?",
    titlePatterns: [
      "The economics of {keyword}: calculating payback",
      "How {keyword} lowers O&M expenses …",
      "{keyword} cost per MW in India",
    ],
    mustDeliver: [
      "Capex/opex or TCO framing",
      "Payback or budget line items",
      "Industry-typical INR/MW ranges where relevant",
    ],
    avoidCannibalizing:
      "Do not re-write a generic how-to; focus on numbers and procurement justification.",
  },
  {
    id: "risk_compliance",
    label: "Risk mitigation & compliance",
    readerQuestion:
      "Will this damage modules, void warranties, or violate safety/regulatory requirements?",
    titlePatterns: [
      "Is {keyword} safe for … modules?",
      "How to prevent micro-cracks when using {keyword}",
      "Compliance review: {keyword} on utility plants",
    ],
    mustDeliver: [
      "Warranty / certification / safety criteria",
      "Module or OEM compatibility framing",
      "What to document for asset owners",
    ],
    avoidCannibalizing:
      "Do not duplicate comparison tables or pure ROI posts for the same keyword.",
  },
  {
    id: "comparison_alternative",
    label: "Comparison & alternatives",
    readerQuestion:
      "Why should I choose this approach over what we have always done?",
    titlePatterns: [
      "{keyword} vs manual labour …",
      "{keyword} vs fixed-tilt systems …",
      "Why waterless {keyword} is replacing …",
    ],
    mustDeliver: [
      "HTML comparison table or decision matrix",
      "Pros/cons for utility-scale India",
      "Clear recommendation for plant managers",
    ],
    avoidCannibalizing:
      "Must use a different comparison axis than existing posts (e.g. robot vs brush, not robot vs brush again).",
  },
  {
    id: "troubleshooting_problem",
    label: "Troubleshooting & problem-solving",
    readerQuestion:
      "Why is my current setup failing, and how does this keyword solve it?",
    titlePatterns: [
      "How {keyword} solves heavy soiling losses …",
      "Fixing tracker alignment issues with {keyword}",
      "Troubleshooting … on {keyword} fleets",
    ],
    mustDeliver: [
      "Named operational failure mode",
      "Root cause + fix pathway",
      "Field scenarios (dust belt, trackers, water scarcity)",
    ],
    avoidCannibalizing:
      "Target a different failure mode than existing troubleshooting posts for this keyword.",
  },
];

export const INTENT_FAMILY_ORDER: SearchIntentFamily[] = SEARCH_INTENT_FAMILIES.map(
  (f) => f.id
);

export function parseSearchIntentFamily(raw: unknown): SearchIntentFamily | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toLowerCase();
  return (INTENT_FAMILY_ORDER as string[]).includes(id)
    ? (id as SearchIntentFamily)
    : null;
}

export function formatIntentFamilyIdsForPrompt(): string {
  return INTENT_FAMILY_ORDER.join(" | ");
}

export function intentFamilyMeta(
  id: SearchIntentFamily
): IntentFamilyMeta | undefined {
  return SEARCH_INTENT_FAMILIES.find((f) => f.id === id);
}

const ARCHETYPE_TO_INTENT: Record<StructuralArchetype, SearchIntentFamily> = {
  frequency_guide: "technical_howto",
  complete_guide: "technical_howto",
  checklist_playbook: "technical_howto",
  general_om: "technical_howto",
  price_capex_bridge: "financial_roi",
  cost_breakdown: "financial_roi",
  vendor_shortlist: "comparison_alternative",
  comparison_matrix: "comparison_alternative",
  manual_vs_robot: "comparison_alternative",
  robot_evaluation: "comparison_alternative",
  mistakes_listicle: "troubleshooting_problem",
  weather_soiling: "troubleshooting_problem",
};

const ANGLE_ID_TO_INTENT: Record<string, SearchIntentFamily> = {
  "price-capex-om": "financial_roi",
  "price-per-watt-cleaning": "financial_roi",
  "price-utility-tco": "financial_roi",
  "price-soiling-roi": "financial_roi",
  "mfg-om-bridge": "risk_compliance",
  "mfg-shortlist": "comparison_alternative",
  "mfg-vendor-vs-robot": "comparison_alternative",
  "brush-vs-robot": "comparison_alternative",
  "brush-tracker": "comparison_alternative",
  "brush-water": "comparison_alternative",
  "freq-50mw": "technical_howto",
  "freq-dust-belt": "technical_howto",
  "freq-tracker": "technical_howto",
  "cost-manual-robot": "comparison_alternative",
  "robot-eval": "comparison_alternative",
  "robot-tracker-fit": "technical_howto",
  "default-guide": "technical_howto",
};

export function inferIntentFamilyFromTitle(title: string): SearchIntentFamily | null {
  const t = title.toLowerCase();
  if (
    /\bvs\b|versus|compared|comparison|better than|replace\b/.test(t)
  ) {
    return "comparison_alternative";
  }
  if (
    /\broi\b|payback|economics|cost per|price per|capex|opex|tco\b|budget/.test(t)
  ) {
    return "financial_roi";
  }
  if (
    /\bsafe\b|warranty|compliance|certif|micro-?crack|damage|prevent\b/.test(t)
  ) {
    return "risk_compliance";
  }
  if (
    /\btroubleshoot|fixing|solve|failure|problem|why is my|heavy soiling/.test(t)
  ) {
    return "troubleshooting_problem";
  }
  if (
    /\bhow to\b|how often|step-by-step|guide\b|integrat|deploy|schedule|frequency/.test(t)
  ) {
    return "technical_howto";
  }
  return null;
}

export function inferIntentFamily(input: {
  angleId?: string | null;
  archetype?: StructuralArchetype | null;
  title?: string | null;
}): SearchIntentFamily {
  const fromAngle = input.angleId
    ? ANGLE_ID_TO_INTENT[input.angleId.trim()]
    : undefined;
  if (fromAngle) return fromAngle;

  if (input.archetype && ARCHETYPE_TO_INTENT[input.archetype]) {
    return ARCHETYPE_TO_INTENT[input.archetype];
  }

  const fromTitle = input.title
    ? inferIntentFamilyFromTitle(input.title)
    : null;
  if (fromTitle) return fromTitle;

  return "technical_howto";
}

/** Prompt block teaching the model how to pick the next intent for a keyword cluster. */
export function formatIntentSelectionGuideBlock(): string {
  const lines = SEARCH_INTENT_FAMILIES.map(
    (f) =>
      `- ${f.id}: ${f.label} — ${f.readerQuestion} (titles like: ${f.titlePatterns[0]?.replace("{keyword}", "[keyword]") ?? "…"})`
  );
  return `KEYWORD INTENT CLUSTER RULES (avoid cannibalization):
For one primary keyword, Taypro may publish MULTIPLE posts — each must serve a DIFFERENT search intent:
${lines.join("\n")}
When a keyword already has posts listed under COVERED INTENTS, pick an UNCOVERED intent family or a clearly different sub-angle (comparison axis, failure mode, or buyer role). Never rewrite the same intent with a synonym title.`;
}
