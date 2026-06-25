import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";
import {
  projectCardCategoryEyebrow,
  prioritizeProjectCardDetails,
} from "@/lib/cms/project-card-display";

const INDIAN_STATE_NAMES = [
  "andhra pradesh",
  "arunachal pradesh",
  "assam",
  "bihar",
  "chhattisgarh",
  "goa",
  "gujarat",
  "gujrat",
  "haryana",
  "himachal pradesh",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil nadu",
  "telangana",
  "tripura",
  "uttar pradesh",
  "uttarakhand",
  "west bengal",
];

export type ProjectHeroStat = {
  label: string;
  value: string;
};

export function heroStatsFromFacts(facts: ProjectFactsJson): ProjectHeroStat[] {
  const stats: ProjectHeroStat[] = [];
  if (facts.capacityMw) {
    stats.push({ label: "Capacity", value: `${facts.capacityMw} MW` });
  }
  const auto = Number(facts.automaticRobots) || 0;
  const semi = Number(facts.semiAutomaticRobots) || 0;
  const total = auto + semi;
  if (total > 0) {
    stats.push({ label: "Fleet", value: `${total} robots` });
  }
  if (facts.state) {
    stats.push({ label: "Location", value: facts.state });
  }
  const deployment = projectCardCategoryEyebrow(
    [facts.cleaningMode, facts.procurement, facts.robotSystem].filter(
      Boolean
    ) as string[]
  );
  if (deployment) {
    stats.push({ label: "Deployment", value: deployment });
  }
  return stats.slice(0, 4);
}

function findIndianState(text: string): string | null {
  const lower = text.toLowerCase();
  for (const state of INDIAN_STATE_NAMES) {
    if (lower.includes(state)) {
      return state
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }
  return null;
}

/** Up to four headline metrics for the project detail hero. */
export function extractProjectHeroStats(
  details: string[] | undefined,
  title: string,
  facts?: ProjectFactsJson | null
): ProjectHeroStat[] {
  if (facts && (facts.capacityMw || facts.state)) {
    const fromFacts = heroStatsFromFacts(facts);
    if (fromFacts.length > 0) return fromFacts;
  }
  const stats: ProjectHeroStat[] = [];
  const joined = [...(details ?? []), title].join(" ");

  const mwMatch = joined.match(/(\d+(?:\.\d+)?)\s*mw/i);
  if (mwMatch) {
    stats.push({ label: "Capacity", value: `${mwMatch[1]} MW` });
  }

  const autoMatch = joined.match(/(\d+)\s*auto\s*robots?/i);
  const semiMatch = joined.match(/(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/i);
  const autoCount = autoMatch ? Number(autoMatch[1]) : 0;
  const semiCount = semiMatch ? Number(semiMatch[1]) : 0;
  if (autoCount > 0 || semiCount > 0) {
    stats.push({ label: "Fleet", value: `${autoCount + semiCount} robots` });
  }

  const state =
    (details ?? []).map((tag) => findIndianState(tag)).find(Boolean) ??
    findIndianState(title);
  if (state) {
    stats.push({ label: "Location", value: state });
  }

  const deployment = projectCardCategoryEyebrow(details);
  if (deployment) {
    stats.push({ label: "Deployment", value: deployment });
  }

  return stats.slice(0, 4);
}

export function projectDetailTags(
  details: string[] | undefined,
  title: string,
  maxTags = 6
): string[] {
  return prioritizeProjectCardDetails(details, title, maxTags);
}
