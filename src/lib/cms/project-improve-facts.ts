import "server-only";

import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";
import {
  enrichFactsWithRegionalContext,
  inferStateFromProjectText,
} from "@/lib/cms/project-regional-context";
import { parseProjectFactsFromCms } from "@/lib/cms/project-facts";

export type ProjectImproveSource = {
  slug: string;
  title: string;
  description: string;
  details: string[];
  content: string;
  seoKeyword?: string | null;
  facts: ProjectFactsJson | null;
};

function parseMwFromText(text: string): number | undefined {
  const m = text.match(/(\d+(?:\.\d+)?)\s*mw/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

function parseRobotCountsFromDetails(details: string[]): {
  auto?: number;
  semi?: number;
} {
  let auto: number | undefined;
  let semi: number | undefined;
  for (const line of details) {
    const autoMatch = line.match(/(\d+)\s*(?:auto(?:matic)?)\s*robots?/i);
    const semiMatch = line.match(/(\d+)\s*semi[-\s]?auto(?:matic)?\s*robots?/i);
    if (autoMatch) auto = Number(autoMatch[1]);
    if (semiMatch) semi = Number(semiMatch[1]);
  }
  return { auto, semi };
}

/** Meta description chips: `5 MW · Gunore · NYUMA · Semi-automatic · 2 robots · saves …` */
function parseFactsFromDescription(description: string): Partial<ProjectFactsJson> {
  const parts = description.split("·").map((p) => p.trim()).filter(Boolean);
  const out: Partial<ProjectFactsJson> = {};

  for (const part of parts) {
    const mw = parseMwFromText(part);
    if (mw) out.capacityMw = mw;

    const low = part.toLowerCase();
    if (/^semi[-\s]?automatic$/i.test(part)) out.cleaningMode = "Semi-Automatic";
    if (low === "automatic") out.cleaningMode = "Automatic";
    if (/^capex$/i.test(part)) out.procurement = "Capex";
    if (/^opex$/i.test(part)) out.procurement = "Opex";
    if (/glyde/i.test(part)) out.robotSystem = "GLYDE";
    if (/nyuma|helyx/i.test(part)) out.robotSystem = out.robotSystem || "NYUMA";

    const robots = part.match(/(\d+)\s*robots?/i);
    if (robots && !out.automaticRobots && !out.semiAutomaticRobots) {
      const n = Number(robots[1]);
      if (out.cleaningMode === "Semi-Automatic") out.semiAutomaticRobots = n;
      else if (out.cleaningMode === "Automatic") out.automaticRobots = n;
    }

    const saves = part.match(/saves?\s+(.+)/i);
    if (saves) out.waterSavedPerYear = saves[1].trim();

    const gen = part.match(/\+(.+)/);
    if (gen && /mwh|gwh/i.test(gen[1])) {
      out.additionalGenerationPerYear = gen[1].trim();
    }

    if (!out.location && part.length > 3 && !/mw|robot|saves|\+/i.test(part)) {
      out.location = part.replace(/\s*Solar Plant.*$/i, "").trim();
    }
  }

  return out;
}

function resolveCleaningMode(
  details: string[],
  auto: number | undefined,
  semi: number | undefined
): string | undefined {
  const tags = details.map((d) => d.trim().toLowerCase());
  const hasSemiTag = tags.some((t) => t === "semi-automatic");
  const hasAutoTag = tags.some((t) => t === "automatic");
  const autoN = auto ?? 0;
  const semiN = semi ?? 0;

  if (hasSemiTag && !hasAutoTag) return "Semi-Automatic";
  if (hasAutoTag && !hasSemiTag && semiN === 0) return "Automatic";
  if (semiN > 0 && autoN === 0) return "Semi-Automatic";
  if (autoN > 0 && semiN === 0) return "Automatic";
  if (autoN > 0 && semiN > 0) return "Mixed";
  return undefined;
}

/**
 * Build authoritative site facts for AI improve from DB row + chips + meta description.
 * 83+ legacy rows have no facts_json — this backfills from what is already on the page.
 */
export function ensureProjectFactsForImprove(
  input: ProjectImproveSource
): ProjectFactsJson {
  const fromCms = parseProjectFactsFromCms({
    title: input.title,
    description: input.description,
    details: input.details,
    content: input.content,
    seoKeyword: input.seoKeyword,
  });

  const fromDescription = parseFactsFromDescription(input.description);
  const fromDetails = parseRobotCountsFromDetails(input.details);

  const merged: ProjectFactsJson = {
    ...fromCms,
    ...input.facts,
    ...fromDescription,
  };

  if (fromDetails.auto !== undefined) merged.automaticRobots = fromDetails.auto;
  if (fromDetails.semi !== undefined) merged.semiAutomaticRobots = fromDetails.semi;

  const cleaningMode = resolveCleaningMode(
    input.details,
    Number(merged.automaticRobots) || 0,
    Number(merged.semiAutomaticRobots) || 0
  );
  if (cleaningMode) merged.cleaningMode = cleaningMode;

  if (!merged.location?.trim()) {
    const fromTitle =
      input.title.split("–")[0]?.split("-")[0]?.trim() ||
      input.title.split(":")[0]?.trim();
    if (fromTitle) merged.location = fromTitle;
  }

  if (!merged.state) {
    merged.state = inferStateFromProjectText(
      input.title,
      merged.location,
      input.details
    );
  }

  if (!merged.capacityMw) {
    merged.capacityMw =
      parseMwFromText(input.title) ?? parseMwFromText(input.description);
  }

  if (!merged.soiling && merged.state) {
    const enriched = enrichFactsWithRegionalContext({ state: merged.state });
    if (enriched.soiling) merged.soiling = enriched.soiling;
  }

  if (!merged.primaryKeyword && input.seoKeyword?.trim()) {
    merged.primaryKeyword = input.seoKeyword.trim();
  }

  return enrichFactsWithRegionalContext(merged);
}
