import type { SearchIntentFamily } from "@/lib/seo/keyword-intent-taxonomy";

const STOP = new Set([
  "solar",
  "panel",
  "panels",
  "plant",
  "plants",
  "india",
  "indian",
  "utility",
  "scale",
  "guide",
  "best",
  "your",
  "what",
  "when",
  "how",
  "the",
  "for",
  "and",
]);

/** Stable slug for sub-intent within a cluster family (comparison axis, failure mode, etc.). */
export function normalizeSubAngle(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

export function inferSubAngle(input: {
  title: string;
  intentFamily: SearchIntentFamily;
  angleId?: string | null;
}): string {
  if (input.angleId?.trim()) {
    return normalizeSubAngle(input.angleId);
  }

  const t = input.title.toLowerCase();
  const vs = t.match(/\bvs\.?\s+([a-z0-9\s-]{3,48})/);
  if (vs?.[1]) {
    return normalizeSubAngle(`vs_${vs[1]}`);
  }
  if (/\bcompared to\b|\bcomparison\b/.test(t)) {
    const compared = t.match(/\bcompared to\s+([a-z0-9\s-]{3,40})/);
    if (compared?.[1]) return normalizeSubAngle(`vs_${compared[1]}`);
  }

  switch (input.intentFamily) {
    case "financial_roi":
      if (/payback/.test(t)) return "payback_period";
      if (/opex|capex|tco/.test(t)) return "capex_opex_tco";
      return "roi_economics";
    case "risk_compliance":
      if (/warranty/.test(t)) return "module_warranty";
      if (/micro-?crack/.test(t)) return "micro_crack_prevention";
      if (/certif|compliance|tuv/.test(t)) return "certification_compliance";
      return "safety_risk";
    case "troubleshooting_problem":
      if (/alignment|fleet/.test(t)) return "fleet_alignment";
      if (/soiling|dust/.test(t)) return "heavy_soiling";
      return "operational_failure";
    case "comparison_alternative":
      if (/manual|brush|labou?r/.test(t)) return "vs_manual_labor";
      if (/fixed.?tilt/.test(t)) return "vs_fixed_tilt";
      if (/waterless|water/.test(t)) return "vs_water_cleaning";
      return "method_comparison";
    case "technical_howto":
    default:
      if (/how often|frequency|schedule/.test(t)) return "frequency_schedule";
      if (/integrat|deploy|install/.test(t)) return "deployment_process";
      if (/tracker/.test(t)) return "tracker_implementation";
      break;
  }

  const tokens = t
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOP.has(w));
  if (tokens.length >= 2) {
    return normalizeSubAngle(tokens.slice(0, 3).join("_"));
  }
  return normalizeSubAngle(`${input.intentFamily}_angle`);
}

export function parseSubAngle(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const normalized = normalizeSubAngle(raw);
  return normalized.length >= 3 ? normalized : null;
}
