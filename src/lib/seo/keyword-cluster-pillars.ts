import "server-only";

import type { KeywordIntentRecord } from "@/lib/seo/keyword-intent-registry";

const KEYWORD_PILLAR_RULES: { pattern: RegExp; pillarPath: string; label: string }[] = [
  {
    pattern:
      /cleaning cost|panel cleaning cost|cost per mw|opex pricing|opex rate|pay per panel|cleaning price india/,
    pillarPath: "/solar-cleaning-opex-pricing",
    label: "OPEX cleaning pricing",
  },
  {
    pattern: /capex vs opex|buy vs service|procurement model|robot buy vs/,
    pillarPath: "/solar-cleaning-capex-vs-opex",
    label: "CAPEX vs OPEX guide",
  },
  {
    pattern: /robot price|capex price|purchase robot|buy robot|robot cost india/,
    pillarPath: "/solar-panel-cleaning-robot-price-india",
    label: "Robot CAPEX price guide",
  },
  {
    pattern: /roi calculator|payback calculator|price calculator/,
    pillarPath: "/solar-panel-cleaning-robot-price-calculator",
    label: "Cleaning ROI calculator",
  },
  {
    pattern:
      /cleaning service india|national cleaning|pan-india cleaning|cleaning company india/,
    pillarPath: "/solar-panel-cleaning-service-india",
    label: "National cleaning service",
  },
  {
    pattern: /fleet monitoring|plant monitoring software|scada complement/,
    pillarPath: "/solar-fleet-monitoring-software",
    label: "Fleet monitoring evaluation",
  },
  {
    pattern: /plant intelligence|plant data|orion/,
    pillarPath: "/solar-plant-data-intelligence",
    label: "Plant data intelligence",
  },
  {
    pattern: /cleaning robot|panel cleaning robot|solar robot|waterless robot/,
    pillarPath: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    label: "Automatic cleaning robots",
  },
  {
    pattern: /cleaning system|automatic cleaning|waterless cleaning/,
    pillarPath: "/solar-panel-cleaning-system",
    label: "Solar cleaning systems hub",
  },
  {
    pattern: /tracker|single.?axis/,
    pillarPath: "/cleaning-technology",
    label: "Cleaning technology (trackers)",
  },
  {
    pattern: /brush|manual clean/,
    pillarPath: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
    label: "Robot vs manual comparison",
  },
  {
    pattern: /waterless|dry clean/,
    pillarPath: "/compare/waterless-vs-water-based-solar-cleaning",
    label: "Waterless vs water-based",
  },
  {
    pattern: /managed service|opex service|robotic cleaning service/,
    pillarPath: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    label: "OPEX cleaning service",
  },
  {
    pattern: /price|cost|roi|payback|opex|capex/,
    pillarPath: "/solar-cleaning-opex-pricing",
    label: "Cleaning pricing (fallback)",
  },
];

export function resolvePillarPathForKeyword(keyword: string): string | null {
  const k = keyword.toLowerCase().trim();
  for (const rule of KEYWORD_PILLAR_RULES) {
    if (rule.pattern.test(k)) return rule.pillarPath;
  }
  if (/clean|soil|robot|wash/.test(k)) {
    return "/solar-panel-cleaning-system";
  }
  return null;
}

export function formatClusterInternalLinksPrompt(input: {
  keyword: string;
  siblings: KeywordIntentRecord[];
  pillarPath?: string | null;
}): string {
  const lines: string[] = [];
  const pillar = input.pillarPath ?? resolvePillarPathForKeyword(input.keyword);

  if (pillar) {
    lines.push(
      `- PILLAR (link once with descriptive anchor when on-topic): ${pillar}`
    );
  }

  const siblings = input.siblings.filter((s) => s.slug);
  if (siblings.length > 0) {
    lines.push(
      "- CLUSTER SIBLINGS (link to 1–2 when context fits, same keyword, different intent):"
    );
    for (const s of siblings.slice(0, 6)) {
      lines.push(
        `  /blog/${s.slug}, "${s.title}" [${s.intentFamily}${s.subAngle ? ` / ${s.subAngle}` : ""}]`
      );
    }
  }

  if (lines.length === 0) return "";

  return `CONTENT CLUSTER INTERNAL LINKS for "${input.keyword}":
${lines.join("\n")}
- Use contextual anchor text; do not force links that do not fit the section.`;
}
