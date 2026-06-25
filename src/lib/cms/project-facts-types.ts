/** Shared project facts / sections types (client + server safe). */

export type ProjectEditorialStatus =
  | "legacy"
  | "ai_draft"
  | "editorial_v2"
  | "flagship";

export type ProjectFactsJson = {
  location?: string;
  state?: string;
  capacityMw?: number | string;
  arrayType?: string;
  commissioningYear?: string;
  automaticRobots?: number | string;
  semiAutomaticRobots?: number | string;
  robotSystem?: string;
  cleaningMode?: string;
  procurement?: string;
  nectyr?: boolean;
  soiling?: string;
  omChallenge?: string;
  waterLabour?: string;
  waterSavedPerYear?: string;
  additionalGenerationPerYear?: string;
  co2SavedPerYear?: string;
  deploymentHighlight?: string;
  peerSlugs?: string[];
  primaryKeyword?: string;
};

export type ProjectNarrativeSection = {
  id: string;
  heading: string;
  bodyHtml: string;
};

export type ProjectSectionsJson = {
  executiveSummary: string;
  narrative: ProjectNarrativeSection[];
};

export const PROJECT_NARRATIVE_SECTION_IDS = [
  "environment",
  "challenge",
  "deployment",
  "operations",
  "results",
  "peers",
] as const;

export type ProjectNarrativeSectionId =
  (typeof PROJECT_NARRATIVE_SECTION_IDS)[number];
