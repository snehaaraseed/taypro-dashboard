import {
  canonicalizeCategoryDetailTags,
  projectHasCategoryTag,
} from "@/lib/cms/project-categories";
import type {
  ProjectFactsJson,
  ProjectSectionsJson,
} from "@/lib/cms/project-facts-types";
import {
  enrichFactsWithRegionalContext,
  inferStateFromProjectText,
} from "@/lib/cms/project-regional-context";

function parseMwFromText(text: string): number | undefined {
  const m = text.match(/(\d+(?:\.\d+)?)\s*mw/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

function parseRobotCounts(text: string): {
  auto?: number;
  semi?: number;
} {
  const auto = text.match(/(\d+)\s*(?:auto(?:matic)?)\s*robots?/i);
  const semi = text.match(/(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/i);
  return {
    auto: auto ? Number(auto[1]) : undefined,
    semi: semi ? Number(semi[1]) : undefined,
  };
}

export function parseProjectFactsFromCms(input: {
  title?: string;
  description?: string;
  details?: string[];
  content?: string;
  seoKeyword?: string | null;
}): ProjectFactsJson {
  const joined = [
    input.title ?? "",
    input.description ?? "", ...(input.details ?? []),
    input.content ?? "",
  ].join(" ");

  const mw =
    parseMwFromText(input.title ?? "") ??
    parseMwFromText(joined) ??
    undefined;
  const robots = parseRobotCounts(joined);
  const state = inferStateFromProjectText(
    input.title,
    input.title,
    input.details
  );

  let location = input.title?.split("–")[0]?.split("-")[0]?.trim() || "";
  if (!location && state) location = state;

  const facts: ProjectFactsJson = {
    location,
    state,
    capacityMw: mw,
    automaticRobots: robots.auto,
    semiAutomaticRobots: robots.semi,
    primaryKeyword: input.seoKeyword ?? undefined,
  };

  const water = joined.match(
    /([\d.]+\s*(?:million|thousand)?\s*lit(?:re|er)s?)/i
  );
  if (water) facts.waterSavedPerYear = water[1];

  const gwh = joined.match(/([\d.]+)\s*gwh/i);
  if (gwh) facts.additionalGenerationPerYear = `${gwh[1]} GWh`;

  const co2 = joined.match(/([\d.]+)\s*(?:metric\s*)?tons?\s*co/i);
  if (co2) facts.co2SavedPerYear = `${co2[1]} metric tons`;

  for (const d of input.details ?? []) {
    const low = d.toLowerCase();
    if (/glyde/i.test(low)) facts.robotSystem = "GLYDE";
    if (/nyuma|helyx/i.test(low)) facts.robotSystem = facts.robotSystem || "NYUMA";
    if (/automatic/i.test(low)) facts.cleaningMode = "Automatic";
    if (/semi/i.test(low)) facts.cleaningMode = facts.cleaningMode || "Semi-Automatic";
    if (/capex/i.test(low)) facts.procurement = "Capex";
    if (/opex/i.test(low)) facts.procurement = facts.procurement || "Opex";
    if (/nectyr/i.test(low)) facts.nectyr = true;
    if (/tracker/i.test(low)) facts.arrayType = "Single-axis trackers";
    if (/ground/i.test(low)) facts.arrayType = facts.arrayType || "Ground mount";
  }

  return enrichFactsWithRegionalContext(facts);
}

export function buildDetailsFromFacts(facts: ProjectFactsJson): string[] {
  const chips: string[] = [];
  if (facts.capacityMw) chips.push(`${facts.capacityMw} MW`);
  if (facts.state) chips.push(facts.state);
  if (facts.robotSystem) chips.push(facts.robotSystem);
  if (facts.cleaningMode) chips.push(facts.cleaningMode);
  if (facts.procurement) chips.push(facts.procurement);
  const auto = Number(facts.automaticRobots) || 0;
  const semi = Number(facts.semiAutomaticRobots) || 0;
  const total = auto + semi;
  if (total > 0) chips.push(`${total} robots`);
  if (facts.waterSavedPerYear) chips.push(`${facts.waterSavedPerYear} water saved`);
  if (facts.arrayType) chips.push(facts.arrayType);
  return canonicalizeCategoryDetailTags([...new Set(chips)]);
}

export function formatProjectFactsForPrompt(facts: ProjectFactsJson): string {
  const lines = Object.entries(facts)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      if (Array.isArray(v)) return `- ${k}: ${v.join(", ")}`;
      if (typeof v === "boolean") return `- ${k}: ${v ? "yes" : "no"}`;
      return `- ${k}: ${v}`;
    });
  return `STRUCTURED SITE FACTS (authoritative, do not contradict or invent alternate numbers):
${lines.join("\n")}`;
}

export function assertFactsReflectedInContent(
  facts: ProjectFactsJson,
  content: string
): string[] {
  const issues: string[] = [];
  const plain = content.toLowerCase();
  if (facts.capacityMw && !plain.includes(String(facts.capacityMw).toLowerCase())) {
    issues.push(`Content should mention capacity ${facts.capacityMw} MW`);
  }
  if (facts.state && !plain.includes(facts.state.toLowerCase())) {
    issues.push(`Content should mention state ${facts.state}`);
  }
  return issues;
}

export function parseFactsJson(raw: string | null | undefined): ProjectFactsJson | null {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as ProjectFactsJson;
  } catch {
    return null;
  }
}

export function parseSectionsJson(
  raw: string | null | undefined
): ProjectSectionsJson | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as ProjectSectionsJson;
    if (!parsed || typeof parsed.executiveSummary !== "string") return null;
    if (!Array.isArray(parsed.narrative)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ensureCategoryDetails(details: string[]): string[] {
  const canon = canonicalizeCategoryDetailTags(details);
  if (!projectHasCategoryTag(canon)) {
    throw new Error(
      'Details must include at least one category tag: Automatic, Semi-Automatic, Capex, or Opex'
    );
  }
  return canon;
}
