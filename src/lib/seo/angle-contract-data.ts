import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";
import type { BlogWordCountTier } from "@/lib/seo/structural-archetypes";
import { ARCHETYPE_WORD_COUNT_TIER } from "@/lib/seo/blog-angle-archetypes";
import { trimSerpDescription } from "@/lib/seo/serp-description";

export type { StructuralArchetype } from "@/lib/seo/structural-archetypes";
export type { BlogWordCountTier } from "@/lib/seo/structural-archetypes";

export type AngleContractMeta = {
  structuralPromise: string;
  archetype: StructuralArchetype;
  h2Template: string[];
  requiredDifferentiator: string;
  forbiddenArchetypes?: StructuralArchetype[];
};

const DEFAULT_H2_TAIL = [
  "Key takeaways for plant managers",
  "What plant managers should do next",
];

function meta(
  structuralPromise: string,
  archetype: StructuralArchetype,
  h2Middle: string[],
  requiredDifferentiator: string,
  forbiddenArchetypes?: StructuralArchetype[]
): AngleContractMeta {
  return {
    structuralPromise,
    archetype,
    h2Template: ["Quick answer", ...h2Middle, ...DEFAULT_H2_TAIL],
    requiredDifferentiator,
    forbiddenArchetypes,
  };
}

export const ANGLE_CONTRACT_BY_ID: Record<string, AngleContractMeta> = {
  "price-capex-om": meta(
    "Bridge module capex to post-commissioning O&M and cleaning budgets",
    "price_capex_bridge",
    [
      "How module price affects lifetime O&M on MW plants",
      "What O&M teams budget for cleaning after module purchase",
    ],
    "India utility capex-to-O&M bridge with cleaning line items"
  ),
  "price-per-watt-cleaning": meta(
    "Per-watt module price vs cleaning O&M budget lines",
    "price_capex_bridge",
    [
      "Per-watt capex vs per-MW cleaning O&M",
      "When cleaning ROI matters more than cheaper modules",
    ],
    "Per-watt economics tied to cleaning frequency"
  ),
  "price-utility-tco": meta(
    "Utility-scale module TCO beyond upfront module cost",
    "price_capex_bridge",
    [
      "TCO beyond module cost on 50 MW+ plants",
      "Soiling and cleaning in lifetime plant economics",
    ],
    "MW-scale TCO framing, not residential price lists"
  ),
  "price-soiling-roi": meta(
    "Module price vs soiling loss trade-off for asset owners",
    "cost_breakdown",
    [
      "When cheaper modules lose to soiling on dust-belt sites",
      "Cleaning ROI vs module cost savings",
    ],
    "Soiling loss % vs module price delta"
  ),
  "mfg-om-bridge": meta(
    "Manufacturer research bridged to post-install cleaning O&M",
    "vendor_shortlist",
    [
      "Specs that matter before you commission cleaning robots",
      "Post-install cleaning plan for MW portfolios",
    ],
    "Vendor shortlist criteria for utility O&M leads",
    ["mistakes_listicle", "complete_guide"]
  ),
  "mfg-shortlist": meta(
    "Shortlist criteria for manufacturers with cleaning robot fit",
    "vendor_shortlist",
    [
      "Evaluation rubric for utility-scale suppliers",
      "Tracker and waterless fit on Indian sites",
    ],
    "Structured vendor comparison table",
    ["mistakes_listicle"]
  ),
  "mfg-vendor-vs-robot": meta(
    "Manufacturer vs cleaning robot partner decision matrix",
    "comparison_matrix",
    [
      "When to partner with a robot OEM vs module vendor",
      "CAPEX and support comparison for MW plants",
    ],
    "Side-by-side vendor vs robot partner criteria"
  ),
  "brush-vs-robot": meta(
    "Brush crew vs robot TCO on utility plants",
    "manual_vs_robot",
    [
      "Manual brush crews vs waterless robots on 50 MW sites",
      "Labour, water, and cycle time comparison",
    ],
    "India MW-scale TCO table, not DIY brush tips",
    ["mistakes_listicle"]
  ),
  "brush-tracker": meta(
    "Manual brush limits on single-axis tracker arrays",
    "manual_vs_robot",
    [
      "Why brush crews struggle on tracker rows at scale",
      "Night-window and safety constraints on trackers",
    ],
    "Tracker geometry and crew productivity limits"
  ),
  "brush-water": meta(
    "Brush crews vs waterless robots: labour and water math",
    "manual_vs_robot",
    [
      "Water use and labour hours: brush vs robot",
      "Dust-belt scheduling for brush crews",
    ],
    "Water litres and crew hours per MW-month"
  ),
  "freq-50mw": meta(
    "Cleaning frequency playbook for 50 MW plants in India",
    "frequency_guide",
    [
      "How often should you clean solar panels on a 50 MW plant?",
      "Seasonal schedules for dust-belt O&M teams",
    ],
    "Seasonal MW-scale frequency calendar",
    ["mistakes_listicle", "complete_guide"]
  ),
  "freq-dust-belt": meta(
    "Dust-belt seasonal cleaning intervals for O&M",
    "frequency_guide",
    [
      "Pre-monsoon vs post-monsoon cleaning windows",
      "Priority blocks when dust return is fastest",
    ],
    "State-level dust season calendar for utilities"
  ),
  "freq-tracker": meta(
    "Cleaning intervals on single-axis trackers",
    "frequency_guide",
    [
      "Tracker tilt cycles vs fixed-tilt cleaning intervals",
      "Night cleaning windows on tracker fleets",
    ],
    "Tracker-specific cycle time constraints"
  ),
  "cost-manual-robot": meta(
    "Per-MW cleaning cost breakdown: manual vs robot",
    "cost_breakdown",
    [
      "Line-item budget: labour, water, robots on 10–100 MW sites",
      "When robot CAPEX pays back vs manual crews",
    ],
    "INR/MW-year budget table with assumptions",
    ["mistakes_listicle"]
  ),
  "cost-per-mw": meta(
    "Per-MW budget lines Indian asset owners use for cleaning",
    "cost_breakdown",
    [
      "O&M budget worksheet for cleaning on utility portfolios",
      "Hidden costs: water, downtime, PR loss",
    ],
    "Per-MW line-item breakdown, not generic price list"
  ),
  "cost-water": meta(
    "Water, labour, and robot cost comparison at scale",
    "cost_breakdown",
    [
      "Water-stressed states: cost of manual vs waterless",
      "Labour escalation vs robot opex on MW sites",
    ],
    "Water litres saved and labour FTE math"
  ),
  "waterless-sprinkler": meta(
    "Waterless robots vs sprinkler systems on MW sites",
    "comparison_matrix",
    [
      "When waterless beats sprinklers on utility arrays",
      "Water use and PR impact comparison",
    ],
    "Sprinkler vs robot water and cycle comparison"
  ),
  "waterless-drought": meta(
    "Water-stressed state playbook for utility cleaning",
    "checklist_playbook",
    [
      "Waterless cleaning compliance on drought-prone sites",
      "O&M checklist for water-scarce MW plants",
    ],
    "State water stress + cleaning method checklist"
  ),
  "robot-eval": meta(
    "Utility O&M evaluation criteria for cleaning robots",
    "robot_evaluation",
    [
      "What Indian utility O&M teams should evaluate before buying",
      "Tracker fit, docking, and night-window requirements",
    ],
    "Structured evaluation rubric for MW plants",
    ["mistakes_listicle", "complete_guide"]
  ),
  "robot-tracker-fit": meta(
    "Robot fit on single-axis trackers: docking and cycle time",
    "robot_evaluation",
    [
      "Docking, row length, and night cleaning on trackers",
      "Commissioning checklist for tracker-compatible robots",
    ],
    "Tracker docking and cycle-time specifics"
  ),
  "robot-capex-opex": meta(
    "Robot CAPEX vs OPEX models for 25–100 MW portfolios",
    "cost_breakdown",
    [
      "Buy vs service models for cleaning robots",
      "Portfolio-level opex planning for robot fleets",
    ],
    "CAPEX/OPEX decision matrix for asset owners"
  ),
  "default-guide": meta(
    "Practical O&M decision guide for utility plants",
    "general_om",
    [
      "Decision criteria for utility-scale operations",
      "Methods and robot options compared for MW sites",
    ],
    "Utility India MW context with specific thresholds",
    ["mistakes_listicle", "complete_guide"]
  ),
  "default-om": meta(
    "O&M decisions for utility plants in India",
    "general_om",
    [
      "O&M planning for post-commissioning cleaning",
      "Asset owner priorities on dust-belt sites",
    ],
    "O&M lead decision framework",
    ["mistakes_listicle"]
  ),
  "default-compare": meta(
    "Methods, costs, and robot options compared at MW scale",
    "comparison_matrix",
    [
      "Comparison table: manual, brush, sprinkler, robot",
      "Which method fits 10 MW vs 100 MW plants",
    ],
    "HTML comparison table with MW scenarios",
    ["mistakes_listicle"]
  ),
};

export const ANGLE_ARCHETYPE_BY_ID: Record<string, StructuralArchetype> =
  Object.fromEntries(
    Object.entries(ANGLE_CONTRACT_BY_ID).map(([id, contract]) => [
      id,
      contract.archetype,
    ])
  ) as Record<string, StructuralArchetype>;

export function getWordCountTierForAngle(angleId: string): BlogWordCountTier {
  const archetype = ANGLE_ARCHETYPE_BY_ID[angleId.trim()] ?? "general_om";
  return ARCHETYPE_WORD_COUNT_TIER[archetype] ?? "standard";
}

export function getAngleContractMeta(angleId: string): AngleContractMeta {
  return (
    ANGLE_CONTRACT_BY_ID[angleId] ??
    meta(
      "Utility-scale O&M decision guide for Indian MW plants",
      "general_om",
      ["Practical decision criteria for plant managers"],
      "India utility MW context",
      ["mistakes_listicle"]
    )
  );
}

export function buildSyntheticMetaDescription(
  keyword: string,
  contract: AngleContractMeta
): string {
  const kw = keyword.trim().toLowerCase();
  const base = `${contract.structuralPromise} for ${kw} on Indian MW plants: ${contract.requiredDifferentiator}.`;
  const padded =
    base.length >= 120
      ? base
      : `${base} Compare methods, costs, and robot options for utility O&M teams.`;
  return trimSerpDescription(padded);
}
