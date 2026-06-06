import type { BlogWordCountTier } from "@/lib/seo/structural-archetypes";
import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";

/** Maps editorial archetypes to content depth (SEO-STRATEGY §3 Tier B vs Tier C). */
export const ARCHETYPE_WORD_COUNT_TIER: Record<
  StructuralArchetype,
  BlogWordCountTier
> = {
  comparison_matrix: "pillar",
  manual_vs_robot: "pillar",
  cost_breakdown: "pillar",
  vendor_shortlist: "pillar",
  price_capex_bridge: "pillar",
  robot_evaluation: "pillar",
  frequency_guide: "narrow",
  checklist_playbook: "narrow",
  weather_soiling: "narrow",
  general_om: "standard",
  complete_guide: "standard",
  mistakes_listicle: "standard",
};
