import type {
  ProjectEditorialStatus,
  ProjectFactsJson,
  ProjectNarrativeSectionId,
} from "@/lib/cms/project-facts-types";
import { FEATURED_HUB_PROJECT_SLUGS } from "@/lib/cms/projects-hub-config";

export type ProjectWordCountTier = "flagship" | "mega" | "mid" | "compact";

export type ProjectWordCountPolicy = {
  tier: ProjectWordCountTier;
  targetMin: number;
  targetMax: number;
  publishMin: number;
  publishMax: number;
  h2Min: number;
  h2Max: number;
};

export type SectionWordBudget = {
  id: ProjectNarrativeSectionId | "executiveSummary";
  min: number;
  max: number;
  optional?: boolean;
};

function parseMw(facts: ProjectFactsJson | null | undefined): number {
  const raw = facts?.capacityMw;
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function resolveProjectWordCountTier(
  facts: ProjectFactsJson | null | undefined,
  editorialStatus?: ProjectEditorialStatus | null,
  slug?: string
): ProjectWordCountTier {
  if (editorialStatus === "flagship") return "flagship";
  if (slug && (FEATURED_HUB_PROJECT_SLUGS as readonly string[]).includes(slug)) {
    return "flagship";
  }
  const mw = parseMw(facts);
  if (mw >= 150) return "flagship";
  if (mw >= 75) return "mega";
  if (mw >= 15) return "mid";
  return "compact";
}

const TIER_POLICIES: Record<ProjectWordCountTier, ProjectWordCountPolicy> = {
  flagship: {
    tier: "flagship",
    targetMin: 2000,
    targetMax: 2800,
    publishMin: 1800,
    publishMax: 3500,
    h2Min: 7,
    h2Max: 8,
  },
  mega: {
    tier: "mega",
    targetMin: 1500,
    targetMax: 2000,
    publishMin: 1200,
    publishMax: 2500,
    h2Min: 7,
    h2Max: 8,
  },
  mid: {
    tier: "mid",
    targetMin: 1100,
    targetMax: 1500,
    publishMin: 900,
    publishMax: 1800,
    h2Min: 8,
    h2Max: 8,
  },
  compact: {
    tier: "compact",
    targetMin: 750,
    targetMax: 1050,
    publishMin: 650,
    publishMax: 1300,
    h2Min: 7,
    h2Max: 8,
  },
};

export function resolveProjectWordCountPolicy(
  facts: ProjectFactsJson | null | undefined,
  editorialStatus?: ProjectEditorialStatus | null,
  slug?: string
): ProjectWordCountPolicy {
  const tier = resolveProjectWordCountTier(facts, editorialStatus, slug);
  return TIER_POLICIES[tier];
}

const SECTION_BUDGETS: Record<
  ProjectWordCountTier,
  SectionWordBudget[]
> = {
  flagship: [
    { id: "executiveSummary", min: 180, max: 250 },
    { id: "environment", min: 220, max: 320 },
    { id: "challenge", min: 180, max: 260 },
    { id: "deployment", min: 280, max: 400 },
    { id: "operations", min: 200, max: 280 },
    { id: "results", min: 200, max: 280 },
    { id: "peers", min: 180, max: 260 },
  ],
  mega: [
    { id: "executiveSummary", min: 150, max: 220 },
    { id: "environment", min: 180, max: 260 },
    { id: "challenge", min: 150, max: 220 },
    { id: "deployment", min: 220, max: 320 },
    { id: "operations", min: 160, max: 240 },
    { id: "results", min: 160, max: 240 },
    { id: "peers", min: 140, max: 200 },
  ],
  mid: [
    { id: "executiveSummary", min: 120, max: 180 },
    { id: "environment", min: 140, max: 200 },
    { id: "challenge", min: 120, max: 180 },
    { id: "deployment", min: 180, max: 260 },
    { id: "operations", min: 130, max: 190 },
    { id: "results", min: 130, max: 190 },
    { id: "peers", min: 100, max: 160 },
  ],
  compact: [
    { id: "executiveSummary", min: 100, max: 150 },
    { id: "environment", min: 100, max: 150 },
    { id: "challenge", min: 90, max: 140 },
    { id: "deployment", min: 120, max: 180 },
    { id: "operations", min: 90, max: 130 },
    { id: "results", min: 90, max: 130 },
    { id: "peers", min: 0, max: 100, optional: true },
  ],
};

export function getSectionWordBudgets(
  policy: ProjectWordCountPolicy
): SectionWordBudget[] {
  return SECTION_BUDGETS[policy.tier];
}

export function defaultSectionHeading(
  sectionId: ProjectNarrativeSectionId,
  location: string,
  capacityMw: number | string
): string {
  const loc = location || "site";
  const mw = capacityMw ? `${capacityMw} MW` : "";
  switch (sectionId) {
    case "environment":
      return `Environment and soiling at ${loc}`;
    case "challenge":
      return "O&M before Taypro";
    case "deployment":
      return mw ? `Fleet and deployment at ${mw}` : "Fleet and deployment";
    case "operations":
      return "Operations and monitoring";
    case "results":
      return "Results and impact";
    case "peers":
      return "Peer comparison and planning checklist";
    default:
      return sectionId;
  }
}

export function createEmptySectionsJson(
  facts: ProjectFactsJson
): import("@/lib/cms/project-facts-types").ProjectSectionsJson {
  const location = facts.location || facts.state || "site";
  const mw = facts.capacityMw ?? "";
  const tier = resolveProjectWordCountTier(facts);
  const ids: ProjectNarrativeSectionId[] =
    tier === "compact"
      ? ["environment", "challenge", "deployment", "operations", "results"]
      : [
          "environment",
          "challenge",
          "deployment",
          "operations",
          "results",
          "peers",
        ];

  return {
    executiveSummary: "",
    narrative: ids.map((id) => ({
      id,
      heading: defaultSectionHeading(id, location, mw),
      bodyHtml: "",
    })),
  };
}

export function formatWordCountPolicyForPrompt(
  policy: ProjectWordCountPolicy
): string {
  const budgets = getSectionWordBudgets(policy)
    .map((b) => `${b.id}: ${b.min}–${b.max} words${b.optional ? " (optional)" : ""}`)
    .join("\n");
  return `WORD COUNT TIER: ${policy.tier}
Total narrative target: ${policy.targetMin}–${policy.targetMax} words (publish minimum ${policy.publishMin}; no maximum).
H2 sections in composed page: ${policy.h2Min}–${policy.h2Max} (includes Executive summary + Site statistics + narrative sections).
Per-section budgets:
${budgets}`;
}
